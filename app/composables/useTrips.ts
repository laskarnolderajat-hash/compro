import { collection, onSnapshot, query, orderBy } from 'firebase/firestore'
import type { Trip } from '~/types/models'

// Cache reactive level-modul: satu listener onSnapshot dipakai bersama semua
// komponen, jadi helper baca di bawah tetap sinkron seperti versi mock.
const trips = ref<Trip[]>([])
const loading = ref(true)
let subscribed = false

function subscribe() {
  if (subscribed || import.meta.server) return
  const db = useFirestore()
  if (!db) return
  subscribed = true
  onSnapshot(
    query(collection(db, 'trips'), orderBy('dateStart', 'asc')),
    (snap) => {
      trips.value = snap.docs.map(d => ({ id: d.id, ...d.data() }) as Trip)
      loading.value = false
    },
    (err) => {
      console.error('[useTrips] gagal memuat trips:', err)
      loading.value = false
    },
  )
}

export function useTrips() {
  subscribe()

  const openTrips = computed(() => trips.value.filter(t => t.status !== 'closed'))

  function getTripById(id: string) {
    return trips.value.find(t => t.id === id)
  }
  async function createTrip(trip: Trip) {
    return await adminFetch<Trip>('/api/admin/trips', { method: 'POST', body: trip })
  }
  async function updateTrip(id: string, patch: Partial<Trip>) {
    await adminFetch(`/api/admin/trips/${id}`, { method: 'PATCH', body: patch })
  }
  async function deleteTrip(id: string) {
    await adminFetch(`/api/admin/trips/${id}`, { method: 'DELETE' })
  }
  function formatPrice(price: number) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price)
  }
  function formatDateRange(start: string, end: string) {
    const s = new Date(start)
    const e = new Date(end)
    const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }
    if (start === end) return s.toLocaleDateString('id-ID', { ...opts, year: 'numeric' })
    const sameMonth = s.getMonth() === e.getMonth()
    const startStr = s.toLocaleDateString('id-ID', sameMonth ? { day: 'numeric' } : opts)
    const endStr = e.toLocaleDateString('id-ID', { ...opts, year: 'numeric' })
    return `${startStr} – ${endStr}`
  }
  function slotsRemaining(trip: Trip) {
    return Math.max(trip.quota - trip.slotsTaken, 0)
  }
  function effectiveStatus(trip: Trip): 'open' | 'full' | 'closed' {
    if (trip.status === 'closed') return 'closed'
    if (trip.slotsTaken >= trip.quota) return 'full'
    return 'open'
  }

  return { trips, loading, openTrips, getTripById, createTrip, updateTrip, deleteTrip, formatPrice, formatDateRange, slotsRemaining, effectiveStatus }
}
