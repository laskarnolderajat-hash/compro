/**
 * Mengosongkan data konten & pendaftaran di Firestore.
 *
 * DIHAPUS   : trips, posts, bookings, members, socialPosts
 * DIPERTAHANKAN: settings/companyProfile dan seluruh akun Authentication
 *
 *   npm run reset                              # ke emulator
 *   CONFIRM=hapus-semua SEED_TARGET=production npm run reset
 *
 * Sengaja butuh CONFIRM=hapus-semua supaya tidak pernah terjalankan tak sengaja.
 */
import { applicationDefault, cert, initializeApp } from 'firebase-admin/app'
import { getFirestore, type Firestore } from 'firebase-admin/firestore'

const COLLECTIONS = ['trips', 'posts', 'bookings', 'members', 'socialPosts']

const projectId = process.env.FIREBASE_PROJECT_ID || 'laskarnolderajat-6693f'
const useEmulator = process.env.SEED_TARGET !== 'production'

if (process.env.CONFIRM !== 'hapus-semua') {
  console.error('Dibatalkan. Jalankan ulang dengan CONFIRM=hapus-semua kalau memang mau menghapus.')
  console.error(`Target yang akan dihapus: ${useEmulator ? 'EMULATOR' : `PRODUCTION (${projectId})`}`)
  console.error(`Koleksi: ${COLLECTIONS.join(', ')}`)
  process.exit(1)
}

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

/** Hapus bertahap 400 dokumen sekali commit (batas Firestore 500 operasi). */
async function clearCollection(db: Firestore, name: string) {
  let total = 0
  for (;;) {
    const snap = await db.collection(name).limit(400).get()
    if (snap.empty) break
    const batch = db.batch()
    snap.docs.forEach(d => batch.delete(d.ref))
    await batch.commit()
    total += snap.size
  }
  console.log(`✓ ${name}: ${total} dokumen dihapus`)
}

async function main() {
  console.log(`→ Target: ${useEmulator ? 'EMULATOR' : `PRODUCTION (${projectId})`}`)

  for (const name of COLLECTIONS) {
    await clearCollection(db, name)
  }

  const profile = await db.collection('settings').doc('companyProfile').get()
  console.log(`• settings/companyProfile ${profile.exists ? 'dipertahankan' : 'tidak ada'}`)
  console.log('• akun Authentication tidak disentuh')
  console.log('\nSelesai. Isi trip & artikel asli lewat /admin.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
