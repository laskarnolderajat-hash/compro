import { cert, getApps, initializeApp, applicationDefault, type App, type ServiceAccount } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'
import { existsSync } from 'node:fs'

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
  if (raw) {
    app = initializeApp({ projectId, credential: cert(parseServiceAccount(raw)) })
    return app
  }

  // Tanpa NUXT_FIREBASE_SERVICE_ACCOUNT, Admin SDK jatuh ke Application Default
  // Credentials. Itu tersedia di lokal (GOOGLE_APPLICATION_CREDENTIALS menunjuk
  // serviceAccount.json) dan di Google Cloud, tapi TIDAK di Vercel. Gagal di
  // sini lebih baik daripada meledak jauh kemudian dengan pesan yang tidak
  // nyambung — mis. tampil sebagai "token tidak valid" saat admin menyimpan.
  const adcPath = process.env.GOOGLE_APPLICATION_CREDENTIALS
  if (!adcPath) {
    throw createError({
      statusCode: 503,
      message: 'Kredensial server Firebase belum dipasang. Set NUXT_FIREBASE_SERVICE_ACCOUNT di environment hosting.',
    })
  }
  if (!existsSync(adcPath)) {
    throw createError({
      statusCode: 503,
      message: `GOOGLE_APPLICATION_CREDENTIALS menunjuk ke "${adcPath}" yang tidak ada di server. Di hosting, pakai NUXT_FIREBASE_SERVICE_ACCOUNT dan hapus variabel ini.`,
    })
  }

  app = initializeApp({ projectId, credential: applicationDefault() })
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
