import type { Booking, Trip } from '~~/app/types/models'

const VALID: Booking['status'][] = ['pending', 'confirmed', 'waitlist', 'cancelled']
const counts = (s: Booking['status']) => s === 'pending' || s === 'confirmed'

/** Port dari updateBookingStatus — penyesuaian slotsTaken dilakukan transaksional. */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const id = getRouterParam(event, 'id')!
  const { status } = await readBody<{ status?: Booking['status'] }>(event)
  if (!status || !VALID.includes(status)) {
    throw createError({ statusCode: 400, message: 'Status tidak valid.' })
  }

  const db = useAdminDb()
  const bookingRef = db.collection('bookings').doc(id)

  await db.runTransaction(async (tx) => {
    const bookingSnap = await tx.get(bookingRef)
    if (!bookingSnap.exists) throw createError({ statusCode: 404, message: 'Booking tidak ditemukan.' })
    const booking = mapDoc<Booking>(bookingSnap)
    if (booking.status === status) return

    const tripRef = db.collection('trips').doc(booking.tripId)
    const tripSnap = await tx.get(tripRef)

    tx.update(bookingRef, { status })

    if (tripSnap.exists && counts(booking.status) !== counts(status)) {
      const trip = mapDoc<Trip>(tripSnap)
      const delta = counts(status) ? booking.participants.length : -booking.participants.length
      tx.update(tripRef, { slotsTaken: Math.max(trip.slotsTaken + delta, 0) })
    }
  })

  return { ok: true }
})
