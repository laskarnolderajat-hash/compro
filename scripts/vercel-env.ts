/**
 * Menyusun daftar environment variable untuk Vercel dari .env + serviceAccount.json,
 * lalu menulisnya ke vercel-env.local.txt (rahasia, sudah masuk .gitignore).
 *
 *   npm run vercel:env
 *
 * Isi file itu tinggal di-paste ke Vercel → Settings → Environment Variables.
 */
import { readFileSync, writeFileSync } from 'node:fs'

// Kredensial lokal tidak berlaku di Vercel: file service account tidak ikut
// ter-deploy, dan Vercel tidak punya Application Default Credentials.
const SKIP = ['GOOGLE_APPLICATION_CREDENTIALS', 'NUXT_FIREBASE_SERVICE_ACCOUNT']

const vars: [string, string][] = []

for (const line of readFileSync('.env', 'utf8').split('\n')) {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith('#')) continue
  const idx = trimmed.indexOf('=')
  if (idx === -1) continue
  const key = trimmed.slice(0, idx)
  if (SKIP.includes(key)) continue
  vars.push([key, trimmed.slice(idx + 1)])
}

const serviceAccount = JSON.parse(readFileSync('serviceAccount.json', 'utf8'))
vars.push(['NUXT_FIREBASE_SERVICE_ACCOUNT', JSON.stringify(serviceAccount)])

// Sengaja tanpa baris komentar: bulk-paste Vercel bisa salah baca baris "#"
// dan menyimpan variabel dengan nilai kosong.
writeFileSync('vercel-env.local.txt', vars.map(([k, v]) => `${k}=${v}`).join('\n') + '\n')

console.log('✓ vercel-env.local.txt dibuat —', vars.length, 'variabel')
console.log('  RAHASIA (sudah gitignored) — paste seluruh isinya ke')
console.log('  Vercel → Settings → Environment Variables, centang ketiga environment.')
for (const [k, v] of vars) {
  console.log('  ', k, '=', k.includes('SERVICE_ACCOUNT') ? `${v.length} karakter (RAHASIA)` : v)
}
