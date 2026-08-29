# Laskar Nol Derajat — Company Profile & Open Trip Platform

Stack: Nuxt 4 (Vue) + Tailwind CSS v4 + **Firebase** (Firestore + Auth).

Arsitekturnya hybrid:
- **Baca publik** (trips, post published, profil perusahaan) langsung dari Firestore lewat client SDK, realtime pakai `onSnapshot`. Diamankan `firestore.rules`.
- **Semua tulis** lewat server routes Nitro di `server/api/` memakai `firebase-admin`. Booking dan perubahan status memakai transaksi Firestore supaya kuota tidak kelebihan. Endpoint `/api/admin/*` mewajibkan ID token dengan custom claim `admin: true`.

Project Firebase: **`laskarnolderajat-6693f`**.

## Menjalankan di lokal

`.env.example` sudah berisi konfigurasi project asli, jadi `npm run dev` langsung
menyambung ke Firestore produksi.

```bash
npm install
cp .env.example .env
npm run dev               # http://localhost:3000
```

Tambahan sekali saja: unduh **service account** (Firebase Console → Project settings →
Service accounts → Generate new private key), simpan sebagai `serviceAccount.json` di root
project. Tanpa ini, semua endpoint di `server/api/` (booking, CRUD admin) akan gagal karena
`firebase-admin` tidak punya kredensial. File ini rahasia dan sudah masuk `.gitignore`.

> ⚠️ Selama `NUXT_PUBLIC_USE_FIREBASE_EMULATOR=false`, tiap booking/CRUD dari lokal langsung
> menulis ke data produksi. Hapus data uji lewat Console setelah percobaan.

### Alternatif: Emulator Suite

Untuk bereksperimen tanpa menyentuh data asli, set `NUXT_PUBLIC_USE_FIREBASE_EMULATOR=true`
di `.env` lalu:

```bash
npm run emu               # terminal 1 — Auth :9099, Firestore :8080, UI :4000
npm run seed              # terminal 2 — isi data awal + akun admin
npm run dev               # terminal 3
```

`npm run seed` mengisi Firestore dari `app/data/mockData.ts` dan membuat akun admin
`admin@laskarnolderajat.id` / `admin123` dengan custom claim `admin: true`.

## Setup di Firebase Console (sekali saja)

1. **Firestore Database** → Create database, mode production, region `asia-southeast2` (Jakarta).
2. **Authentication** → Sign-in method → aktifkan **Email/Password**.
3. Naikkan project ke **Blaze plan** (syarat App Hosting).
4. Deploy rules & index: `npx firebase deploy --only firestore`.
5. Isi data awal + akun admin: `SEED_TARGET=production SEED_ADMIN_PASSWORD='<password-kuat>' npm run seed`.
   Jangan pakai `admin123` di produksi.

## Deploy — Vercel

Firebase tetap jadi backend (Firestore + Auth); yang di-host di Vercel hanya aplikasi Nuxt-nya.
Cukup paket **Spark (gratis)** di Firebase — App Hosting yang butuh Blaze tidak dipakai.

1. Import repo `laskarnolderajat-hash/compro` di https://vercel.com/new. Framework terdeteksi
   otomatis sebagai Nuxt; jangan ubah build command atau output directory.
2. Isi Environment Variables. Jalankan `npm run vercel:env` untuk membuat
   `vercel-env.local.txt` berisi semua baris yang perlu di-paste (file ini rahasia dan
   sudah masuk `.gitignore`). Wajib ada:
   - semua `NUXT_PUBLIC_FIREBASE_*` dan `NUXT_PUBLIC_USE_FIREBASE_EMULATOR=false`
   - `NUXT_FIREBASE_SERVICE_ACCOUNT` — isi `serviceAccount.json` dalam satu baris.
     Di Vercel tidak ada Application Default Credentials, jadi ini **wajib**; tanpa itu
     semua endpoint `server/api/` gagal 500.
   - jangan isi `GOOGLE_APPLICATION_CREDENTIALS` (file-nya tidak ikut ter-deploy).
3. Setelah domain terbit, daftarkan di Firebase Console → **Authentication → Settings →
   Authorized domains**. Kalau dilewat, login admin ditolak `auth/unauthorized-domain`.

[`vercel.json`](vercel.json) mengunci region ke `sin1` (Singapura) supaya dekat dengan
pengguna Indonesia dan dengan Firestore di `asia-southeast2`.

> `apphosting.yaml` sengaja dibiarkan di repo kalau suatu saat pindah ke Firebase App
> Hosting — file itu diabaikan oleh Vercel.

## QR code open trip

Tiap trip punya QR berisi link ke halaman detailnya, dibuat di browser (`qrcode`) tanpa
layanan luar dan tanpa disimpan di Firestore. Muncul di tiga tempat:

- `/admin/trips` — tombol **QR** per trip, lengkap dengan **Unduh PNG** untuk bahan promo
- `/trip/[id]` — bagian "Bagikan Trip Ini"
- `/riwayat` — di tiap kartu pendaftaran peserta

Komponennya `app/components/TripQr.vue`, URL-nya dirangkai `app/utils/tripUrl.ts` dari origin
request — jadi otomatis memakai domain produksi setelah deploy.

## Struktur

| Bagian | Lokasi |
| --- | --- |
| Tipe data bersama | `app/types/models.ts` |
| Data seed | `app/data/mockData.ts` |
| Init Firebase (client) | `app/plugins/firebase.client.ts`, `app/utils/firebase.ts` |
| Init Firebase (server) | `server/utils/firebaseAdmin.ts` |
| Guard admin | `server/utils/requireAdmin.ts` |
| Endpoint | `server/api/bookings/*`, `server/api/admin/*` |
| Security rules | `firestore.rules`, `firestore.indexes.json` |
| QR trip | `app/components/TripQr.vue`, `app/utils/tripUrl.ts` |
| Config deploy | `apphosting.yaml`, `.firebaserc` |

Koleksi Firestore: `trips`, `posts`, `bookings`, `members`, dan dokumen tunggal `settings/companyProfile`.

## Halaman
- `/` — Company profile (hero, trip terdekat, tentang/visi/misi)
- `/trip` — Daftar open trip + filter level
- `/trip/[id]` — Detail trip + form booking dinamis (field menyesuaikan toggle SIMAKSI dari admin)
- `/blog`, `/blog/[slug]` — Artikel
- `/riwayat` — Cek status pendaftaran pakai nomor HP
- `/admin` — Login admin (Firebase Auth)
- `/admin/dashboard`, `/admin/trips`, `/admin/posts`, `/admin/bookings`, `/admin/members`, `/admin/profile`

## Yang masih perlu disambungkan sebelum production
1. **Upload foto** (trip images, foto KTP) — sekarang masih field URL teks; perlu Firebase Storage.
2. **Notifikasi WhatsApp** ke peserta saat status booking berubah (opsional, Fonnte/WA Business API).
3. **SSR untuk SEO** — daftar trip & artikel saat ini dimuat client-side (realtime `onSnapshot`), jadi belum ikut di HTML hasil SSR. Kalau SEO penting, tambahkan endpoint publik `GET /api/trips` + `useAsyncData` sebagai data awal.
