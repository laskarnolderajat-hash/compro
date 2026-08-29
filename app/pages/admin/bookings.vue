<script setup lang="ts">
definePageMeta({ layout: 'admin' })
const { bookings, updateBookingStatus, statusLabel } = useBookings()
const { getTripById } = useTrips()

const filter = ref<'all' | 'pending' | 'confirmed' | 'waitlist' | 'cancelled'>('all')
const filtered = computed(() => bookings.value.filter(b => filter.value === 'all' || b.status === filter.value).slice().reverse())

const expanded = ref<string | null>(null)
const busy = ref<string | null>(null)

async function setStatus(id: string, status: 'confirmed' | 'waitlist' | 'cancelled') {
  busy.value = id
  try {
    await updateBookingStatus(id, status)
  } catch (e: any) {
    alert(e?.data?.message || e?.message || 'Gagal mengubah status.')
  } finally {
    busy.value = null
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
  <div>
    <p class="font-mono text-ember text-xs uppercase tracking-widest mb-1">Manajemen</p>
    <h1 class="font-display text-4xl uppercase mb-6">Pendaftar</h1>

    <div class="flex flex-wrap gap-2 mb-6">
      <button v-for="opt in ['all','pending','confirmed','waitlist','cancelled']" :key="opt" @click="filter = opt as any"
        class="px-3 py-1.5 rounded-full text-xs border" :class="filter === opt ? 'bg-frost text-night border-frost' : 'border-white/20 text-paper/70'">
        {{ opt === 'all' ? 'Semua' : statusLabel[opt as keyof typeof statusLabel] }}
      </button>
    </div>

    <div v-if="filtered.length === 0" class="text-fog text-center py-16">Tidak ada data.</div>

    <div class="space-y-3">
      <div v-for="b in filtered" :key="b.id" class="bg-pine border border-white/10 rounded-xl p-4">
        <div class="flex items-center justify-between gap-4 cursor-pointer" @click="expanded = expanded === b.id ? null : b.id">
          <div class="min-w-0">
            <div class="font-medium truncate">{{ getTripById(b.tripId)?.title || 'Trip dihapus' }}</div>
            <div class="text-xs text-fog">{{ b.participants.map(p => p.name).join(', ') }} · {{ b.participants.length }} peserta</div>
          </div>
          <span class="text-xs font-mono px-2.5 py-1 rounded-full shrink-0" :class="statusColor[b.status]">{{ statusLabel[b.status] }}</span>
        </div>

        <div v-if="expanded === b.id" class="mt-4 pt-4 border-t border-white/10 space-y-3">
          <div v-for="(p, i) in b.participants" :key="i" class="text-sm bg-night rounded-lg p-3">
            <div class="font-medium mb-1">{{ p.name }}</div>
            <div class="text-fog text-xs grid grid-cols-2 gap-1">
              <span>Domisili: {{ p.domicileAddress }}</span>
              <span>Telp: {{ p.phone }}</span>
              <span>Email: {{ p.email }}</span>
              <span>Penyakit bawaan: {{ p.hasPreExistingCondition ? (p.preExistingConditionNote || 'Ya') : 'Tidak' }}</span>
              <span v-if="p.ktpNumber">KTP: {{ p.ktpNumber }}</span>
              <span v-if="p.birthPlace">TTL: {{ p.birthPlace }}, {{ p.birthDate }}</span>
              <span v-if="p.emergencyContacts?.length" class="col-span-2">
                Kontak darurat: {{ p.emergencyContacts.map(c => `${c.name} (${c.relation}) ${c.phone}`).join(' · ') }}
              </span>
            </div>
          </div>
          <div v-if="b.notes" class="text-sm text-fog">Catatan: {{ b.notes }}</div>

          <div class="flex flex-wrap gap-2 pt-2">
            <button @click="setStatus(b.id, 'confirmed')" :disabled="busy === b.id" class="disabled:opacity-50 text-xs bg-frost text-night px-3 py-1.5 rounded-full">Konfirmasi</button>
            <button @click="setStatus(b.id, 'waitlist')" :disabled="busy === b.id" class="disabled:opacity-50 text-xs border border-ember/40 text-ember px-3 py-1.5 rounded-full">Waitlist</button>
            <button @click="setStatus(b.id, 'cancelled')" :disabled="busy === b.id" class="disabled:opacity-50 text-xs border border-white/20 text-fog px-3 py-1.5 rounded-full">Batalkan</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
