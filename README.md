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

## Deploy — Firebase App Hosting

```bash
npx firebase apphosting:backends:create
```

Ikuti wizard-nya (hubungkan repo GitHub, pilih branch). Setelah itu tiap push ke branch
tersebut memicu build otomatis.

Konfigurasi runtime ada di [`apphosting.yaml`](apphosting.yaml) — semua env `NUXT_PUBLIC_*`
ada di situ dan **tidak ada service account**: runtime App Hosting menyediakan Application
Default Credentials sendiri, dan `server/utils/firebaseAdmin.ts` otomatis memakainya.

Setelah backend jadi, tambahkan domainnya di **Authentication → Settings → Authorized
domains**. Kalau dilewat, login admin ditolak dengan `auth/unauthorized-domain`.

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
