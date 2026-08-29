/**
 * URL absolut halaman detail trip — dipakai isi QR code dan tombol salin link.
 * useRequestURL() benar di SSR maupun client, jadi otomatis ikut domain produksi
 * setelah deploy tanpa perlu env tambahan.
 */
export function tripUrl(tripId: string) {
  return new URL(`/trip/${tripId}`, useRequestURL().origin).toString()
}
