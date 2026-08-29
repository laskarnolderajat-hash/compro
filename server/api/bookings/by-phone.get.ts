import type { Booking, Member } from '~~/app/types/models'

/**
 * Dipakai halaman /riwayat: peserta cukup memasukkan nomor HP-nya, koleksi
 * bookings sendiri tertutup dari client (lihat firestore.rules).
 */
export default defineEventHandler(async (event) => {
  const phone = (getQuery(event).phone as string | undefined)?.trim()
  if (!phone) throw createError({ statusCode: 400, message: 'Parameter phone wajib diisi.' })

  const db = useAdminDb()
  const memberSnap = await db.collection('members').where('phone', '==', phone).limit(1).get()
  if (memberSnap.empty) return { member: null, bookings: [] as Booking[] }

  const member = mapDoc<Member>(memberSnap.docs[0]!)
  const bookingSnap = await db.collection('bookings').where('memberId', '==', member.id).get()
  const bookings = mapDocs<Booking>(bookingSnap)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  return { member, bookings }
})
