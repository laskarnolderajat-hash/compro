export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  await useAdminDb().collection('socialPosts').doc(getRouterParam(event, 'id')!).delete()
  return { ok: true }
})
