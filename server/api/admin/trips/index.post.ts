import type { Trip } from '~~/app/types/models'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const body = await readBody<Trip>(event)
  if (!body?.title?.trim()) throw createError({ statusCode: 400, message: 'Judul trip wajib diisi.' })

  const { id, ...data } = body
  const db = useAdminDb()
  const ref = id?.trim() ? db.collection('trips').doc(id.trim()) : db.collection('trips').doc()

  await ref.set({ ...data, createdAt: data.createdAt || new Date().toISOString() })
  return { id: ref.id, ...data } as Trip
})
