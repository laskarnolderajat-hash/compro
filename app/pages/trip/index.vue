<script setup lang="ts">
const { trips, formatPrice, formatDateRange, effectiveStatus, slotsRemaining } = useTrips()

const difficultyFilter = ref<'all' | 'Pemula' | 'Menengah' | 'Berpengalaman'>('all')

const filteredTrips = computed(() =>
  trips.value.filter(t => difficultyFilter.value === 'all' || t.difficulty === difficultyFilter.value)
)

const statusStyles: Record<string, string> = {
  open: 'bg-frost/15 text-frost',
  full: 'bg-ember/15 text-ember',
  closed: 'bg-white/10 text-fog',
}
const statusLabel: Record<string, string> = { open: 'Buka', full: 'Penuh — Waitlist', closed: 'Ditutup' }
</script>

<template>
  <div class="max-w-6xl mx-auto px-5 py-14">
    <p class="font-mono text-ember text-xs uppercase tracking-widest mb-2">Jadwal Terkini</p>
    <h1 class="font-display text-5xl md:text-6xl uppercase mb-8">Open Trip</h1>

    <div class="flex flex-wrap gap-2 mb-10">
      <button
        v-for="opt in [{v:'all',l:'Semua'},{v:'Pemula',l:'Pemula'},{v:'Menengah',l:'Menengah'},{v:'Berpengalaman',l:'Berpengalaman'}]"
        :key="opt.v" @click="difficultyFilter = opt.v as any"
        class="px-4 py-1.5 rounded-full text-sm border transition-colors"
        :class="difficultyFilter === opt.v ? 'bg-frost text-night border-frost' : 'border-white/20 text-paper/70 hover:border-frost/50'"
      >{{ opt.l }}</button>
    </div>

    <div v-if="filteredTrips.length === 0" class="text-fog py-16 text-center">Belum ada trip untuk kategori ini.</div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
      <NuxtLink
        v-for="trip in filteredTrips" :key="trip.id" :to="`/trip/${trip.id}`"
        class="group bg-pine border border-white/10 rounded-2xl p-6 hover:border-frost/40 transition-colors flex flex-col"
      >
        <div class="flex items-start justify-between mb-3">
          <span class="font-mono text-xs px-2.5 py-1 rounded-full" :class="statusStyles[effectiveStatus(trip)]">{{ statusLabel[effectiveStatus(trip)] }}</span>
          <span class="font-mono text-xs text-frost-dim">{{ trip.elevation.toLocaleString('id-ID') }} MDPL</span>
        </div>
        <h3 class="font-display text-3xl uppercase group-hover:text-frost transition-colors leading-none mb-1">{{ trip.title }}</h3>
        <p class="text-sm text-fog mb-4">{{ trip.location }} · {{ trip.difficulty }}</p>
        <p class="text-sm text-paper/70 line-clamp-2 mb-5">{{ trip.description }}</p>
        <div class="mt-auto flex items-center justify-between pt-4 border-t border-white/10">
          <div>
            <div class="font-display text-2xl text-frost">{{ formatPrice(trip.price) }}</div>
            <div class="text-xs text-fog">{{ formatDateRange(trip.dateStart, trip.dateEnd) }}</div>
          </div>
          <div class="text-right text-sm">
            <div :class="effectiveStatus(trip) === 'open' ? 'text-frost' : 'text-ember'">{{ slotsRemaining(trip) }} slot tersisa</div>
            <div class="text-fog text-xs">dari {{ trip.quota }} kuota</div>
          </div>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>
