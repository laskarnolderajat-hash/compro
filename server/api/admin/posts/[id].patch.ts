import type { Post } from '~~/app/types/models'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const docId = getRouterParam(event, 'id')!
  const { id: _ignored, ...patch } = await readBody<Partial<Post>>(event)
  if (!Object.keys(patch).length) throw createError({ statusCode: 400, message: 'Tidak ada field untuk diubah.' })

  const ref = useAdminDb().collection('posts').doc(docId)
  if (!(await ref.get()).exists) throw createError({ statusCode: 404, message: 'Post tidak ditemukan.' })

  await ref.update({ ...patch, updatedAt: new Date().toISOString() })
  return { ok: true }
})
