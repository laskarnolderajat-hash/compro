/**
 * SEMENTARA — endpoint diagnosa untuk melacak kenapa route lain gagal di Vercel.
 * Sengaja tidak mengimpor apa pun dari server/utils supaya tetap hidup walau
 * modul lain rusak. HAPUS setelah masalahnya beres.
 */
export default defineEventHandler(async () => {
  const keys = [
    'NUXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NUXT_PUBLIC_USE_FIREBASE_EMULATOR',
    'NUXT_FIREBASE_SERVICE_ACCOUNT',
    'FIREBASE_PROJECT_ID',
  ]

  const out: Record<string, unknown> = {
    node: process.version,
    // Hanya keberadaan & panjang — nilainya tidak pernah dikembalikan.
    env: Object.fromEntries(
      keys.map(k => [k, process.env[k] ? `ada (${process.env[k]!.length} char)` : 'KOSONG']),
    ),
  }

  try {
    const { getApps } = await import('firebase-admin/app')
    out.firebaseAdminImport = 'ok'
    out.apps = getApps().length
  } catch (e) {
    out.firebaseAdminImport = `GAGAL: ${(e as Error).message}`
  }

  try {
    const { getFirestore } = await import('firebase-admin/firestore')
    out.firestoreImport = typeof getFirestore === 'function' ? 'ok' : 'aneh'
  } catch (e) {
    out.firestoreImport = `GAGAL: ${(e as Error).message}`
  }

  return out
})
