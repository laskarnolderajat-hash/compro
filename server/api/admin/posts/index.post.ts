import type { Post } from '~~/app/types/models'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const body = await readBody<Post>(event)
  if (!body?.title?.trim()) throw createError({ statusCode: 400, message: 'Judul post wajib diisi.' })

  const { id, ...data } = body
  const db = useAdminDb()
  const ref = id?.trim() ? db.collection('posts').doc(id.trim()) : db.collection('posts').doc()
  const now = new Date().toISOString()

  await ref.set({ ...data, createdAt: data.createdAt || now, updatedAt: now })
  return { id: ref.id, ...data } as Post
})
