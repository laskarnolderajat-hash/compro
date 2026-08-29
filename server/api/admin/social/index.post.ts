import type { SocialPost } from '~~/app/types/models'

interface Body {
  url?: string
  caption?: string
  thumbnailUrl?: string
  tripId?: string
  featured?: boolean
  order?: number
}

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const body = await readBody<Body>(event)
  const parsed = await parseSocialUrl(body?.url ?? '')

  const db = useAdminDb()

  // Satu post cukup sekali tampil — tolak duplikat dengan pesan yang jelas.
  const existing = await db.collection('socialPosts').where('url', '==', parsed.url).limit(1).get()
  if (!existing.empty) {
    throw createError({ statusCode: 409, message: 'Post ini sudah pernah ditambahkan.' })
  }

  const meta = parsed.platform === 'tiktok' ? await fetchTiktokMeta(parsed.url) : {}

  // Post baru masuk paling atas.
  const last = await db.collection('socialPosts').orderBy('order', 'desc').limit(1).get()
  const nextOrder = last.empty ? 0 : ((last.docs[0]!.data().order as number) ?? 0) + 1

  const data: Omit<SocialPost, 'id'> = {
    platform: parsed.platform,
    url: parsed.url,
    postId: parsed.postId,
    ...(body.caption?.trim() || meta.caption ? { caption: body.caption?.trim() || meta.caption } : {}),
    ...(body.thumbnailUrl?.trim() || meta.thumbnailUrl ? { thumbnailUrl: body.thumbnailUrl?.trim() || meta.thumbnailUrl } : {}),
    ...(meta.authorName ? { authorName: meta.authorName } : {}),
    ...(body.tripId ? { tripId: body.tripId } : {}),
    featured: body.featured ?? false,
    order: body.order ?? nextOrder,
    createdAt: new Date().toISOString(),
  }

  const ref = db.collection('socialPosts').doc()
  await ref.set(data)

  return { id: ref.id, ...data } satisfies SocialPost
})
