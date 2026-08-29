// Seed data — dipakai scripts/seed.ts untuk mengisi Firestore pertama kali.
// Tipe datanya tinggal di ~/types/models.ts.

import type { RegistrationConfig, Trip, Member, Booking, CompanyProfile, Post } from '../types/models'

export type * from '../types/models'

const defaultRegConfig: RegistrationConfig = {
  requireKTP: false,
  requireBirthPlace: false,
  requireEmergencyContact: false,
  minEmergencyContact: 1,
  requireKTPPhoto: false,
}

export const mockTrips: Trip[] = [
  {
    id: 'trip-semeru-3d2n',
    title: 'Pendakian Gunung Semeru 3D2N',
    mountain: 'Gunung Semeru',
    location: 'Lumajang, Jawa Timur',
    elevation: 3676,
    description:
      'Summit tertinggi di Pulau Jawa. Melewati savana Oro-oro Ombo, hutan cemara, dan Ranu Kumbolo yang legendaris sebelum summit attack ke Mahameru.',
    itinerary: [
      { day: 1, title: 'Ranupani – Ranu Kumbolo', activities: ['Briefing & SIMAKSI', 'Trekking ke Ranu Kumbolo', 'Camp di tepi danau'] },
      { day: 2, title: 'Ranu Kumbolo – Kalimati', activities: ['Tanjakan Cinta', 'Oro-oro Ombo', 'Camp di Kalimati'] },
      { day: 3, title: 'Summit Attack – Turun', activities: ['Summit attack dini hari', 'Turun ke Ranupani'] },
    ],
    include: ['Transport lokal', 'SIMAKSI', 'Guide & porter', 'Tenda & matras', 'Konsumsi selama trip'],
    exclude: ['Transport menuju titik kumpul', 'Perlengkapan pribadi', 'Asuransi tambahan'],
    requirements: ['Sehat jasmani & rohani', 'Usia 17-50 tahun', 'Membawa surat sehat dari puskesmas/dokter'],
    price: 950000,
    quota: 20,
    slotsTaken: 20,
    dateStart: '2026-09-12',
    dateEnd: '2026-09-14',
    status: 'open',
    images: [],
    difficulty: 'Menengah',
    registrationConfig: { requireKTP: true, requireBirthPlace: true, requireEmergencyContact: true, minEmergencyContact: 1, requireKTPPhoto: true },
    createdAt: '2026-07-01',
  },
  {
    id: 'trip-bromo-sunrise',
    title: 'Bromo Sunrise Trip 2D1N',
    mountain: 'Gunung Bromo',
    location: 'Probolinggo, Jawa Timur',
    elevation: 2329,
    description:
      'Trip santai buat pemula — lihat sunrise dari Penanjakan, jeep ke lautan pasir, dan naik ke kawah Bromo.',
    itinerary: [
      { day: 1, title: 'Kumpul – Penginapan', activities: ['Perjalanan menuju basecamp', 'Istirahat malam'] },
      { day: 2, title: 'Sunrise – Kawah – Pulang', activities: ['Sunrise Penanjakan', 'Lautan pasir & kawah Bromo', 'Perjalanan pulang'] },
    ],
    include: ['Jeep sunrise', 'Penginapan 1 malam', 'Guide lokal', 'Tiket masuk kawasan'],
    exclude: ['Konsumsi', 'Sewa kuda (opsional)'],
    requirements: ['Cocok untuk pemula', 'Bawa jaket tebal — suhu bisa di bawah 5°C'],
    price: 450000,
    quota: 15,
    slotsTaken: 6,
    dateStart: '2026-09-20',
    dateEnd: '2026-09-21',
    status: 'open',
    images: [],
    difficulty: 'Pemula',
    registrationConfig: defaultRegConfig,
    createdAt: '2026-07-10',
  },
  {
    id: 'trip-rinjani-4d3n',
    title: 'Pendakian Gunung Rinjani via Senaru 4D3N',
    mountain: 'Gunung Rinjani',
    location: 'Lombok, Nusa Tenggara Barat',
    elevation: 3726,
    description:
      'Ekspedisi ke Danau Segara Anak dan puncak Rinjani. Salah satu trip paling menantang — butuh persiapan fisik matang.',
    itinerary: [
      { day: 1, title: 'Senaru – Pos 3', activities: ['Briefing SIMAKSI', 'Trekking hutan tropis', 'Camp Pos 3'] },
      { day: 2, title: 'Pos 3 – Danau Segara Anak', activities: ['Turun ke danau', 'Pemandian air panas', 'Camp tepi danau'] },
      { day: 3, title: 'Summit Attack – Plawangan', activities: ['Summit dini hari', 'Turun ke Plawangan Sembalun'] },
      { day: 4, title: 'Turun ke Sembalun', activities: ['Trekking savana', 'Selesai di basecamp Sembalun'] },
    ],
    include: ['SIMAKSI', 'Guide & porter berpengalaman', 'Tenda dome', 'Konsumsi full'],
    exclude: ['Transport ke Lombok', 'Perlengkapan pribadi', 'Tip porter'],
    requirements: ['Fisik prima — disarankan latihan 1 bulan sebelumnya', 'Wajib medical check-up', 'Usia 18-45 tahun'],
    price: 1850000,
    quota: 12,
    slotsTaken: 9,
    dateStart: '2026-10-03',
    dateEnd: '2026-10-06',
    status: 'open',
    images: [],
    difficulty: 'Berpengalaman',
    registrationConfig: { requireKTP: true, requireBirthPlace: true, requireEmergencyContact: true, minEmergencyContact: 2, requireKTPPhoto: true },
    createdAt: '2026-07-15',
  },
  {
    id: 'trip-prau-1d',
    title: 'Gunung Prau One Day Hike',
    mountain: 'Gunung Prau',
    location: 'Dieng, Jawa Tengah',
    elevation: 2565,
    description: 'Hiking santai sehari — golden sunrise dengan latar Sindoro-Sumbing, cocok buat yang baru mulai naik gunung.',
    itinerary: [{ day: 1, title: 'Naik – Sunrise – Turun', activities: ['Start pendakian malam', 'Camp singkat / summit langsung', 'Sunrise di puncak', 'Turun siang hari'] }],
    include: ['Guide lokal', 'Tiket masuk', 'Simaksi'],
    exclude: ['Konsumsi', 'Sewa tenda (opsional)'],
    requirements: ['Cocok untuk pemula', 'Fisik dasar cukup'],
    price: 250000,
    quota: 25,
    slotsTaken: 25,
    dateStart: '2026-08-30',
    dateEnd: '2026-08-30',
    status: 'closed',
    images: [],
    difficulty: 'Pemula',
    registrationConfig: defaultRegConfig,
    createdAt: '2026-07-05',
  },
]

export const mockPosts: Post[] = [
  {
    id: 'post-persiapan-fisik-pendakian',
    title: 'Persiapan Fisik Sebelum Pendakian Gunung',
    slug: 'persiapan-fisik-sebelum-pendakian-gunung',
    excerpt: 'Latihan fisik yang tepat bisa jadi penentu antara pendakian yang lancar dan yang penuh perjuangan. Berikut tips persiapannya.',
    content:
      'Pendakian gunung menuntut stamina, kekuatan kaki, dan daya tahan kardio yang baik. Mulai latihan minimal 4-6 minggu sebelum keberangkatan dengan jogging rutin, latihan naik-turun tangga, dan stretching. Jangan lupa cukup tidur dan konsumsi gizi seimbang menjelang hari-H.',
    coverImage: '',
    author: 'Laskar Nol Derajat',
    status: 'published',
    createdAt: '2026-08-01',
    updatedAt: '2026-08-01',
  },
  {
    id: 'post-checklist-perlengkapan',
    title: 'Checklist Perlengkapan Wajib Open Trip',
    slug: 'checklist-perlengkapan-wajib-open-trip',
    excerpt: 'Jangan sampai ada yang ketinggalan — ini daftar perlengkapan pribadi yang wajib dibawa saat ikut open trip pendakian.',
    content:
      'Perlengkapan pribadi yang wajib dibawa antara lain: jaket gunung/windbreaker, sleeping bag, headlamp, sepatu trekking, jas hujan, dan obat-obatan pribadi. Sesuaikan juga dengan kondisi cuaca dan medan gunung tujuan.',
    coverImage: '',
    author: 'Laskar Nol Derajat',
    status: 'published',
    createdAt: '2026-08-10',
    updatedAt: '2026-08-10',
  },
]

export const mockMembers: Member[] = [
  { id: 'member-1', name: 'Andra Wijaya', phone: '081234567890', email: 'andra@mail.com', createdAt: '2026-07-02' },
  { id: 'member-2', name: 'Siti Nurhaliza', phone: '081298765432', email: 'siti@mail.com', createdAt: '2026-07-11' },
]

export const mockBookings: Booking[] = [
  {
    id: 'booking-1',
    tripId: 'trip-bromo-sunrise',
    memberId: 'member-1',
    status: 'confirmed',
    participants: [
      { name: 'Andra Wijaya', domicileAddress: 'Surabaya', hasPreExistingCondition: false, phone: '081234567890', email: 'andra@mail.com' },
    ],
    createdAt: '2026-07-20',
  },
  {
    id: 'booking-2',
    tripId: 'trip-rinjani-4d3n',
    memberId: 'member-2',
    status: 'pending',
    participants: [
      {
        name: 'Siti Nurhaliza', domicileAddress: 'Malang', hasPreExistingCondition: false,
        phone: '081298765432', email: 'siti@mail.com', ktpNumber: '3578xxxxxxxxxxxx',
        birthPlace: 'Malang', birthDate: '1998-04-12',
        emergencyContacts: [{ name: 'Budi Nurhaliza', phone: '081211112222', relation: 'Ayah' }],
      },
    ],
    createdAt: '2026-08-01',
  },
]

export const mockCompanyProfile: CompanyProfile = {
  companyName: 'Laskar Nol Derajat',
  tagline: 'Menapak dingin, menaklukkan puncak.',
  about:
    'Laskar Nol Derajat adalah penyelenggara open trip pendakian gunung yang berbasis di Jawa Timur. Kami percaya setiap puncak punya cerita, dan setiap pendaki berhak mendapat pengalaman yang aman, terencana, dan penuh makna — dari titik nol hingga garis puncak.',
  vision: 'Menjadi mitra pendakian terpercaya yang membawa lebih banyak orang mengenal alam Indonesia dengan aman dan bertanggung jawab.',
  mission: [
    'Menyediakan open trip dengan standar keselamatan tinggi',
    'Mendampingi pendaki pemula hingga berpengalaman',
    'Menjaga kelestarian jalur pendakian yang dilalui',
  ],
  contact: {
    phone: '+62 812-3456-7890',
    email: 'halo@laskarnolderajat.id',
    whatsapp: '6281234567890',
    address: 'Surabaya, Jawa Timur',
    instagram: '@laskarnolderajat',
  },
  gallery: [],
  updatedAt: '2026-08-01',
}
