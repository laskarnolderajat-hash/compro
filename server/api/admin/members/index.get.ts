import type { Member } from '~~/app/types/models'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const snap = await useAdminDb().collection('members').orderBy('createdAt', 'desc').get()
  return mapDocs<Member>(snap)
})
