import { cert, getApps, initializeApp, applicationDefault, type App, type ServiceAccount } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

let app: App | undefined

function ensureApp(): App {
  if (app) return app
  if (getApps().length) {
    app = getApps()[0]!
    return app
  }

  const config = useRuntimeConfig()
  const projectId = config.public.firebase.projectId || process.env.FIREBASE_PROJECT_ID

  if (config.public.useFirebaseEmulator) {
    // Admin SDK memilih emulator lewat env var ini, bukan lewat opsi init.
    process.env.FIRESTORE_EMULATOR_HOST ||= '127.0.0.1:8080'
    process.env.FIREBASE_AUTH_EMULATOR_HOST ||= '127.0.0.1:9099'
    app = initializeApp({ projectId })
    return app
  }

  const raw = config.firebaseServiceAccount
  app = initializeApp({
    projectId,
    credential: raw ? cert(parseServiceAccount(raw)) : applicationDefault(),
  })
  return app
}

/**
 * NUXT_FIREBASE_SERVICE_ACCOUNT bisa sampai dalam dua bentuk: Nuxt otomatis
 * mem-parse env var yang isinya JSON jadi objek (destr), tapi kalau ada karakter
 * yang membuat parsing gagal, nilainya tetap string mentah. Tangani keduanya.
 */
function parseServiceAccount(raw: unknown): ServiceAccount {
  const sa = typeof raw === 'string' ? JSON.parse(raw) : raw as Record<string, unknown>
  if (!sa || typeof sa !== 'object' || !sa.private_key) {
    throw new Error('NUXT_FIREBASE_SERVICE_ACCOUNT tidak berisi service account yang valid.')
  }
  // Sebagian platform menyimpan newline sebagai "\n" literal — kembalikan.
  if (typeof sa.private_key === 'string' && sa.private_key.includes('\\n')) {
    sa.private_key = sa.private_key.replace(/\\n/g, '\n')
  }
  return sa as ServiceAccount
}

export function useAdminDb() {
  return getFirestore(ensureApp())
}

export function useAdminAuthSdk() {
  return getAuth(ensureApp())
}
