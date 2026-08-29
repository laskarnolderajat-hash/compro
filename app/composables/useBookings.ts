import { collection, onSnapshot, query, orderBy } from 'firebase/firestore'
import type { Booking, Member, Participant } from '~/types/models'

// bookings & members hanya bisa dibaca admin (lihat firestore.rules), jadi
// listener-nya baru dinyalakan setelah login admin terdeteksi.
const bookings = ref<Booking[]>([])
const members = ref<Member[]>([])
const loading = ref(false)
let subscribed = false

function subscribeAdmin() {
  if (subscribed || import.meta.server) return
  const db = useFirestore()
  if (!db) return
  subscribed = true
  loading.value = true

  onSnapshot(
    query(collection(db, 'bookings'), orderBy('createdAt', 'desc')),
    (snap) => {
      bookings.value = snap.docs.map(d => ({ id: d.id, ...d.data() }) as Booking)
      loading.value = false
    },
    err => console.error('[useBookings] gagal memuat bookings:', err),
  )
  onSnapshot(
    query(collection(db, 'members'), orderBy('createdAt', 'desc')),
    snap => (members.value = snap.docs.map(d => ({ id: d.id, ...d.data() }) as Member)),
    err => console.error('[useBookings] gagal memuat members:', err),
  )
}

export function useBookings() {
  const { isLoggedIn } = useAdminAuth()

  if (import.meta.client) {
    if (isLoggedIn.value) subscribeAdmin()
    else watch(isLoggedIn, v => v && subscribeAdmin())
  }

  /** Pendaftaran ditangani server (transaksi kuota) — lihat server/api/bookings/index.post.ts */
  async function submitBooking(tripId: string, participants: Participant[], notes?: string) {
    return await $fetch<Booking>('/api/bookings', {
      method: 'POST',
      body: { tripId, participants, notes },
    })
  }

  async function updateBookingStatus(bookingId: string, status: Booking['status']) {
    await adminFetch(`/api/admin/bookings/${bookingId}`, { method: 'PATCH', body: { status } })
  }

  /** Untuk halaman /riwayat — peserta cari booking-nya lewat nomor HP. */
  async function searchBookingsByPhone(phone: string) {
    return await $fetch<{ member: Member | null, bookings: Booking[] }>('/api/bookings/by-phone', {
      query: { phone },
    })
  }

  async function findMemberByPhone(phone: string) {
    return (await searchBookingsByPhone(phone)).member
  }

  function bookingsForMember(memberId: string) {
    return bookings.value.filter(b => b.memberId === memberId)
  }

  function bookingsForTrip(tripId: string) {
    return bookings.value.filter(b => b.tripId === tripId)
  }

  const statusLabel: Record<Booking['status'], string> = {
    pending: 'Menunggu Konfirmasi',
    confirmed: 'Terkonfirmasi',
    waitlist: 'Daftar Tunggu',
    cancelled: 'Dibatalkan',
  }

  return {
    bookings, members, loading,
    submitBooking, updateBookingStatus, searchBookingsByPhone, findMemberByPhone,
    bookingsForMember, bookingsForTrip, statusLabel,
  }
}
