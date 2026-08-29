import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app'
import { connectAuthEmulator, getAuth, type Auth } from 'firebase/auth'
import { connectFirestoreEmulator, getFirestore, type Firestore } from 'firebase/firestore'
import { getAnalytics, isSupported } from 'firebase/analytics'

export interface FirebaseServices {
  app: FirebaseApp
  auth: Auth
  db: Firestore
}

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig().public

  const app = getApps().length ? getApp() : initializeApp({ ...config.firebase })
  const auth = getAuth(app)
  const db = getFirestore(app)

  if (config.useFirebaseEmulator) {
    // connect* melempar kalau dipanggil dua kali (HMR) — abaikan saja.
    try {
      connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true })
    } catch {}
    try {
      connectFirestoreEmulator(db, '127.0.0.1', 8080)
    } catch {}
  } else if (config.firebase.measurementId) {
    // Analytics hanya saat menembak Firebase asli — jangan kotori data dengan
    // trafik emulator. isSupported() menjaga browser tanpa cookie/IndexedDB.
    isSupported().then(ok => ok && getAnalytics(app)).catch(() => {})
  }

  return {
    provide: {
      firebase: { app, auth, db } satisfies FirebaseServices,
    },
  }
})
