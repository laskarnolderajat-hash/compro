<script setup lang="ts">
import type { Booking } from '~/types/models'

const { searchBookingsByPhone, statusLabel } = useBookings()
const { getTripById, formatDateRange } = useTrips()

const phone = ref('')
const searched = ref(false)
const searching = ref(false)
const results = ref<Booking[]>([])

async function search() {
  const q = phone.value.trim()
  if (!q || searching.value) return
  searching.value = true
  try {
    results.value = (await searchBookingsByPhone(q)).bookings
  } catch {
    results.value = []
  } finally {
    searching.value = false
    searched.value = true
  }
}

const statusColor: Record<string, string> = {
  pending: 'text-yellow-300 bg-yellow-300/10',
  confirmed: 'text-frost bg-frost/10',
  waitlist: 'text-ember bg-ember/10',
  cancelled: 'text-fog bg-white/5',
}
</script>

<template>
  <div class="max-w-2xl mx-auto px-5 py-14">
    <p class="font-mono text-ember text-xs uppercase tracking-widest mb-2">Status Pendaftaran</p>
    <h1 class="font-display text-5xl uppercase mb-6">Cek Pendaftaran</h1>
    <p class="text-fog text-sm mb-6">Masukkan nomor HP yang kamu pakai saat mendaftar trip.</p>

    <form @submit.prevent="search" class="flex gap-2 mb-10">
      <input v-model="phone" placeholder="08xxxxxxxxxx" class="flex-1 bg-pine border border-white/15 rounded-lg px-4 py-2.5 text-sm focus:border-frost outline-none" />
      <button type="submit" :disabled="searching" class="bg-frost disabled:opacity-60 text-night font-semibold px-6 py-2.5 rounded-lg">{{ searching ? 'Mencari…' : 'Cari' }}</button>
    </form>

    <div v-if="searched">
      <div v-if="results.length === 0" class="text-fog text-center py-10">Tidak ditemukan pendaftaran dengan nomor ini.</div>
      <div v-else class="space-y-4">
        <div v-for="b in results" :key="b.id" class="bg-pine border border-white/10 rounded-2xl p-5">
          <div class="flex items-start justify-between mb-2">
            <div>
              <div class="font-display text-xl uppercase">{{ getTripById(b.tripId)?.title }}</div>
              <div class="text-xs text-fog">{{ getTripById(b.tripId) ? formatDateRange(getTripById(b.tripId)!.dateStart, getTripById(b.tripId)!.dateEnd) : '' }}</div>
            </div>
            <span class="text-xs font-mono px-2.5 py-1 rounded-full" :class="statusColor[b.status]">{{ statusLabel[b.status] }}</span>
          </div>
          <div class="text-sm text-paper/70">{{ b.participants.length }} peserta: {{ b.participants.map(p => p.name).join(', ') }}</div>

          <div class="mt-4 pt-4 border-t border-white/10">
            <TripQr :trip-id="b.tripId" :title="getTripById(b.tripId)?.title" compact />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
