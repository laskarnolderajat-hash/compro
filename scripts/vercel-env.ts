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

const out = [
  '# Salin tiap baris ke Vercel → Settings → Environment Variables',
  '# (centang Production, Preview, dan Development)',
  '# FILE INI RAHASIA — sudah masuk .gitignore, jangan di-commit atau dikirim.',
  '',
  ...vars.map(([k, v]) => `${k}=${v}`),
].join('\n')

writeFileSync('vercel-env.local.txt', out + '\n')

console.log('✓ vercel-env.local.txt dibuat —', vars.length, 'variabel')
for (const [k, v] of vars) {
  console.log('  ', k, '=', k.includes('SERVICE_ACCOUNT') ? `${v.length} karakter (RAHASIA)` : v)
}
