import type { Booking, Member, Participant, Trip } from '~~/app/types/models'

interface Body {
  tripId?: string
  participants?: Participant[]
  notes?: string
}

/**
 * Port dari logika submitBooking di app/composables/useBookings.ts, tapi
 * dijalankan dalam transaksi Firestore supaya kuota tidak kelebihan saat
 * dua orang mendaftar bersamaan.
 */
export default defineEventHandler(async (event) => {
  const body = await readBody<Body>(event)
  const tripId = body?.tripId?.trim()
  const participants = body?.participants ?? []

  if (!tripId) throw createError({ statusCode: 400, message: 'tripId wajib diisi.' })
  if (!participants.length) throw createError({ statusCode: 400, message: 'Minimal satu peserta.' })

  for (const p of participants) {
    if (!p?.name?.trim() || !p?.phone?.trim()) {
      throw createError({ statusCode: 400, message: 'Nama dan nomor HP peserta wajib diisi.' })
    }
  }

  const db = useAdminDb()
  const tripRef = db.collection('trips').doc(tripId)
  const bookingRef = db.collection('bookings').doc()
  const now = new Date().toISOString()

  return await db.runTransaction(async (tx) => {
    const tripSnap = await tx.get(tripRef)
    if (!tripSnap.exists) throw createError({ statusCode: 404, message: 'Trip tidak ditemukan.' })
    const trip = mapDoc<Trip>(tripSnap)

    const primary = participants[0]!
    const memberQuery = await tx.get(db.collection('members').where('phone', '==', primary.phone).limit(1))

    let memberId: string
    if (memberQuery.empty) {
      const memberRef = db.collection('members').doc()
      const member: Omit<Member, 'id'> = {
        name: primary.name,
        phone: primary.phone,
        ...(primary.email ? { email: primary.email } : {}),
        createdAt: now,
      }
      tx.set(memberRef, member)
      memberId = memberRef.id
    } else {
      memberId = memberQuery.docs[0]!.id
    }

    const remaining = trip.quota - trip.slotsTaken
    const status: Booking['status'] = participants.length <= remaining ? 'pending' : 'waitlist'

    const booking: Omit<Booking, 'id'> = {
      tripId,
      memberId,
      participants,
      status,
      ...(body.notes ? { notes: body.notes } : {}),
      createdAt: now,
    }
    tx.set(bookingRef, booking)

    if (status === 'pending') {
      tx.update(tripRef, { slotsTaken: trip.slotsTaken + participants.length })
    }

    return { id: bookingRef.id, ...booking } satisfies Booking
  })
})
