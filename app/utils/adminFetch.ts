/**
 * $fetch untuk endpoint /api/admin/* — selalu menyertakan ID token admin
 * yang sedang login. Melempar kalau belum login.
 */
export async function adminFetch<T>(url: string, opts: Parameters<typeof $fetch>[1] = {}): Promise<T> {
  const auth = useFirebaseAuth()
  const user = auth?.currentUser
  if (!user) throw new Error('Belum login sebagai admin.')

  const token = await user.getIdToken()
  return await $fetch<T>(url, {
    ...opts,
    headers: { ...(opts?.headers as Record<string, string>), Authorization: `Bearer ${token}` },
  })
}
