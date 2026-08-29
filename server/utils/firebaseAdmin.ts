import { cert, getApps, initializeApp, applicationDefault, type App } from 'firebase-admin/app'
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
    credential: raw ? cert(JSON.parse(raw)) : applicationDefault(),
  })
  return app
}

export function useAdminDb() {
  return getFirestore(ensureApp())
}

export function useAdminAuthSdk() {
  return getAuth(ensureApp())
}
