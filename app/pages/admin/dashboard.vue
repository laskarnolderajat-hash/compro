<script setup lang="ts">
definePageMeta({ layout: 'admin' })
const { trips, effectiveStatus } = useTrips()
const { bookings, members } = useBookings()

const stats = computed(() => ({
  activeTrips: trips.value.filter(t => effectiveStatus(t) === 'open').length,
  totalTrips: trips.value.length,
  pendingBookings: bookings.value.filter(b => b.status === 'pending').length,
  totalMembers: members.value.length,
}))
</script>

<template>
  <div>
    <p class="font-mono text-ember text-xs uppercase tracking-widest mb-1">Ringkasan</p>
    <h1 class="font-display text-4xl uppercase mb-8">Dashboard</h1>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
      <div class="bg-pine border border-white/10 rounded-2xl p-5">
        <div class="text-xs text-fog mb-1">Trip Aktif</div>
        <div class="font-display text-4xl text-frost">{{ stats.activeTrips }}</div>
      </div>
      <div class="bg-pine border border-white/10 rounded-2xl p-5">
        <div class="text-xs text-fog mb-1">Total Trip</div>
        <div class="font-display text-4xl">{{ stats.totalTrips }}</div>
      </div>
      <div class="bg-pine border border-white/10 rounded-2xl p-5">
        <div class="text-xs text-fog mb-1">Perlu Approve</div>
        <div class="font-display text-4xl text-ember">{{ stats.pendingBookings }}</div>
      </div>
      <div class="bg-pine border border-white/10 rounded-2xl p-5">
        <div class="text-xs text-fog mb-1">Total Member</div>
        <div class="font-display text-4xl">{{ stats.totalMembers }}</div>
      </div>
    </div>

    <div class="flex gap-3">
      <NuxtLink to="/admin/trips" class="text-sm bg-frost text-night font-semibold px-4 py-2 rounded-full">Kelola Trip</NuxtLink>
      <NuxtLink to="/admin/bookings" class="text-sm border border-white/20 px-4 py-2 rounded-full">Lihat Pendaftar</NuxtLink>
    </div>
  </div>
</template>
