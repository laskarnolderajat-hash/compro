export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  await useAdminDb().collection('posts').doc(getRouterParam(event, 'id')!).delete()
  return { ok: true }
})
