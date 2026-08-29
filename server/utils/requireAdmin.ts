import type { H3Event } from 'h3'
import type { DecodedIdToken } from 'firebase-admin/auth'

/**
 * Verifikasi header `Authorization: Bearer <idToken>` dan pastikan user punya
 * custom claim `admin: true` (di-set lewat scripts/seed.ts atau manual).
 */
export async function requireAdmin(event: H3Event): Promise<DecodedIdToken> {
  const header = getRequestHeader(event, 'authorization') ?? ''
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : ''

  if (!token) {
    throw createError({ statusCode: 401, message: 'Token tidak ada.' })
  }

  // Sengaja di luar try di bawah: kegagalan inisialisasi Admin SDK (mis. service
  // account tidak terpasang) adalah masalah server, bukan masalah token
  // pengguna. Kalau ikut tertangkap, admin dapat pesan "token tidak valid" yang
  // menyesatkan dan menyembunyikan sebab aslinya.
  const auth = useAdminAuthSdk()

  let decoded: DecodedIdToken
  try {
    decoded = await auth.verifyIdToken(token)
  } catch {
    throw createError({ statusCode: 401, message: 'Sesi kedaluwarsa. Keluar lalu masuk lagi.' })
  }

  if (decoded.admin !== true) {
    throw createError({ statusCode: 403, message: 'Akun ini bukan admin.' })
  }

  return decoded
}
