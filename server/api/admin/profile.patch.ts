import type { CompanyProfile } from '~~/app/types/models'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const patch = await readBody<Partial<CompanyProfile>>(event)
  if (!patch || !Object.keys(patch).length) {
    throw createError({ statusCode: 400, message: 'Tidak ada field untuk diubah.' })
  }

  await useAdminDb()
    .collection('settings')
    .doc('companyProfile')
    .set({ ...patch, updatedAt: new Date().toISOString() }, { merge: true })

  return { ok: true }
})
