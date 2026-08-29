<script setup lang="ts">
definePageMeta({ layout: 'admin' })
const { members, bookingsForMember } = useBookings()
</script>

<template>
  <div>
    <p class="font-mono text-ember text-xs uppercase tracking-widest mb-1">Manajemen</p>
    <h1 class="font-display text-4xl uppercase mb-6">Member</h1>

    <div class="space-y-3">
      <div v-for="m in members" :key="m.id" class="bg-pine border border-white/10 rounded-xl p-4 flex items-center justify-between">
        <div>
          <div class="font-medium">{{ m.name }}</div>
          <div class="text-xs text-fog">{{ m.phone }} · {{ m.email || '-' }}</div>
        </div>
        <div class="text-xs text-frost-dim">{{ bookingsForMember(m.id).length }} trip diikuti</div>
      </div>
    </div>
  </div>
</template>
