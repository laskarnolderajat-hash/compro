/**
 * Nuxt menyembunyikan pesan error asli dari klien di produksi — itu benar dan
 * tetap dipertahankan. Tapi tanpa ini, log Vercel juga ikut tidak informatif.
 * Plugin ini mencatat detail lengkapnya ke server log saja.
 */
export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('error', (error, { event }) => {
    console.error(
      `[api-error] ${event?.method ?? '?'} ${event?.path ?? '?'}\n`,
      error instanceof Error ? (error.stack ?? error.message) : error,
    )
  })
})
