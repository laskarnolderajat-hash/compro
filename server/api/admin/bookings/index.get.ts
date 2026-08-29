import type { Booking } from '~~/app/types/models'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const snap = await useAdminDb().collection('bookings').orderBy('createdAt', 'desc').get()
  return mapDocs<Booking>(snap)
})
