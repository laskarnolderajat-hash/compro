/**
 * Isi Firestore dengan data awal dari app/data/mockData.ts, sekaligus buat
 * akun admin (custom claim `admin: true`).
 *
 *   npm run emu        # terminal 1
 *   npm run seed       # terminal 2  (default: menulis ke emulator)
 *
 * Untuk seed ke project asli:
 *   SEED_TARGET=production GOOGLE_APPLICATION_CREDENTIALS=./serviceAccount.json npm run seed
 */
import { applicationDefault, cert, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'
import {
  mockTrips, mockPosts, mockMembers, mockBookings, mockCompanyProfile,
} from '../app/data/mockData'

const projectId = process.env.FIREBASE_PROJECT_ID || 'laskarnolderajat-6693f'
const useEmulator = process.env.SEED_TARGET !== 'production'

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || 'admin@laskarnolderajat.id'
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || 'admin123'

if (useEmulator) {
  process.env.FIRESTORE_EMULATOR_HOST ||= '127.0.0.1:8080'
  process.env.FIREBASE_AUTH_EMULATOR_HOST ||= '127.0.0.1:9099'
}

const raw = process.env.NUXT_FIREBASE_SERVICE_ACCOUNT
initializeApp({
  projectId,
  ...(useEmulator ? {} : { credential: raw ? cert(JSON.parse(raw)) : applicationDefault() }),
})

const db = getFirestore()
const auth = getAuth()

async function seedCollection<T extends { id: string }>(name: string, rows: T[]) {
  const batch = db.batch()
  for (const { id, ...data } of rows) {
    batch.set(db.collection(name).doc(id), data)
  }
  await batch.commit()
  console.log(`✓ ${name}: ${rows.length} dokumen`)
}

async function seedAdminUser() {
  let uid: string
  try {
    uid = (await auth.getUserByEmail(ADMIN_EMAIL)).uid
  } catch {
    uid = (await auth.createUser({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })).uid
    console.log(`✓ user admin dibuat: ${ADMIN_EMAIL}`)
  }
  await auth.setCustomUserClaims(uid, { admin: true })
  console.log(`✓ custom claim admin di-set untuk ${ADMIN_EMAIL}`)
}

async function main() {
  console.log(useEmulator ? '→ Target: EMULATOR' : `→ Target: PRODUCTION (${projectId})`)

  await seedCollection('trips', mockTrips)
  await seedCollection('posts', mockPosts)
  await seedCollection('members', mockMembers)
  await seedCollection('bookings', mockBookings)

  await db.collection('settings').doc('companyProfile').set(mockCompanyProfile)
  console.log('✓ settings/companyProfile')

  await seedAdminUser()
  console.log('\nSelesai.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
