import type { SocialPost } from '~~/app/types/models'

/** Hanya field yang memang boleh diubah admin — url/platform/postId tidak. */
const ALLOWED = ['caption', 'thumbnailUrl', 'tripId', 'featured', 'order'] as const

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const docId = getRouterParam(event, 'id')!
  const body = await readBody<Partial<SocialPost>>(event)

  const patch: Record<string, unknown> = {}
  for (const key of ALLOWED) {
    if (body[key] !== undefined) patch[key] = body[key]
  }
  if (!Object.keys(patch).length) {
    throw createError({ statusCode: 400, message: 'Tidak ada field untuk diubah.' })
  }

  const ref = useAdminDb().collection('socialPosts').doc(docId)
  if (!(await ref.get()).exists) {
    throw createError({ statusCode: 404, message: 'Post tidak ditemukan.' })
  }

  await ref.update(patch)
  return { ok: true }
})
