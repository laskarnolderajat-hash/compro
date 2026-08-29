export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const id = getRouterParam(event, 'id')!
  const db = useAdminDb()

  const booked = await db.collection('bookings').where('tripId', '==', id).limit(1).get()
  if (!booked.empty) {
    throw createError({ statusCode: 409, message: 'Trip sudah punya pendaftar — tutup tripnya, jangan dihapus.' })
  }

  await db.collection('trips').doc(id).delete()
  return { ok: true }
})
