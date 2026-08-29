<script setup lang="ts">
const { profile } = useCompanyProfile()
const { openTrips, formatDateRange, effectiveStatus, slotsRemaining } = useTrips()
const featuredTrips = computed(() => openTrips.value.slice(0, 3))
const { featuredPosts } = useSocialPosts()
</script>

<template>
  <div>
    <!-- Hero -->
    <section class="relative overflow-hidden border-b border-white/10">
      <div class="absolute inset-0 bg-gradient-to-b from-pine via-night to-night" />
      <div class="relative max-w-6xl mx-auto px-5 pt-20 pb-24 md:pt-28 md:pb-32">
        <p class="reveal font-mono text-ember text-sm tracking-widest uppercase mb-4">Open Trip Pendakian Gunung</p>
        <h1 class="reveal font-display text-[15vw] leading-[0.85] md:text-[7.5rem] uppercase text-paper" style="animation-delay:.05s">
          Nol Derajat<br /><span class="text-frost">di Puncak</span>
        </h1>
        <p class="reveal mt-6 max-w-lg text-paper/70 text-lg" style="animation-delay:.15s">{{ profile.tagline }} Kami rancang tiap jalur, tiap camp, tiap detail SIMAKSI — supaya kamu tinggal fokus jalan sampai puncak.</p>
        <div class="reveal mt-8 flex flex-wrap gap-3" style="animation-delay:.25s">
          <NuxtLink to="/trip" class="bg-ember hover:bg-ember-dim text-night font-semibold px-6 py-3 rounded-full transition-colors">Lihat Open Trip</NuxtLink>
          <a href="#tentang" class="border border-white/20 hover:border-frost/60 px-6 py-3 rounded-full transition-colors">Tentang Kami</a>
        </div>
      </div>
      <svg class="relative block w-full h-10 text-frost/25" viewBox="0 0 1200 40" preserveAspectRatio="none">
        <path d="M0 20 Q 50 0 100 20 T 200 20 T 300 20 T 400 20 T 500 20 T 600 20 T 700 20 T 800 20 T 900 20 T 1000 20 T 1100 20 T 1200 20" fill="none" stroke="currentColor" stroke-width="1" />
        <path d="M0 28 Q 50 10 100 28 T 200 28 T 300 28 T 400 28 T 500 28 T 600 28 T 700 28 T 800 28 T 900 28 T 1000 28 T 1100 28 T 1200 28" fill="none" stroke="currentColor" stroke-width="1" opacity=".5" />
      </svg>
    </section>

    <!-- Featured trips -->
    <section class="max-w-6xl mx-auto px-5 py-16">
      <div class="flex items-end justify-between mb-8">
        <h2 class="font-display text-4xl uppercase">Trip Terdekat</h2>
        <NuxtLink to="/trip" class="text-sm text-frost hover:text-ember font-medium">Lihat semua →</NuxtLink>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
        <NuxtLink
          v-for="trip in featuredTrips" :key="trip.id" :to="`/trip/${trip.id}`"
          class="group bg-pine border border-white/10 rounded-2xl p-6 hover:border-frost/40 transition-colors flex flex-col"
        >
          <div class="flex items-start justify-between mb-4">
            <div class="font-mono text-xs text-frost-dim uppercase tracking-wider">{{ trip.difficulty }}</div>
            <div class="font-mono text-xs text-ember">{{ trip.elevation.toLocaleString('id-ID') }} MDPL</div>
          </div>
          <h3 class="font-display text-2xl uppercase group-hover:text-frost transition-colors mb-1">{{ trip.title }}</h3>
          <p class="text-sm text-fog mb-4">{{ trip.location }}</p>
          <div class="mt-auto flex items-center justify-between pt-4 border-t border-white/10 text-sm">
            <span class="text-paper/70">{{ formatDateRange(trip.dateStart, trip.dateEnd) }}</span>
            <span :class="effectiveStatus(trip) === 'open' ? 'text-frost' : 'text-ember'">
              {{ effectiveStatus(trip) === 'open' ? `${slotsRemaining(trip)} slot` : 'Penuh' }}
            </span>
          </div>
        </NuxtLink>
      </div>
    </section>

    <!-- Sosial media -->
    <section v-if="featuredPosts.length" class="border-t border-white/10">
      <div class="max-w-6xl mx-auto px-5 py-16">
        <div class="flex items-end justify-between mb-8">
          <div>
            <p class="font-mono text-ember text-xs uppercase tracking-widest mb-2">Instagram &amp; TikTok</p>
            <h2 class="font-display text-4xl uppercase">Ikuti Perjalanan Kami</h2>
          </div>
          <NuxtLink to="/galeri" class="text-sm text-frost hover:text-ember font-medium shrink-0">Lihat galeri →</NuxtLink>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <SocialCard v-for="p in featuredPosts.slice(0, 6)" :key="p.id" :post="p" />
        </div>
      </div>
    </section>

    <!-- About -->
    <section id="tentang" class="border-t border-white/10 bg-pine/40">
      <div class="max-w-6xl mx-auto px-5 py-16 grid grid-cols-1 md:grid-cols-2 gap-12">
        <div>
          <p class="font-mono text-ember text-xs uppercase tracking-widest mb-3">Tentang Kami</p>
          <h2 class="font-display text-4xl uppercase mb-4">{{ profile.companyName }}</h2>
          <p class="text-paper/80 leading-relaxed">{{ profile.about }}</p>
        </div>
        <div class="space-y-6">
          <div>
            <p class="font-mono text-frost-dim text-xs uppercase tracking-widest mb-2">Visi</p>
            <p class="text-paper/80">{{ profile.vision }}</p>
          </div>
          <div>
            <p class="font-mono text-frost-dim text-xs uppercase tracking-widest mb-2">Misi</p>
            <ul class="space-y-1.5">
              <li v-for="(m, i) in profile.mission" :key="i" class="flex gap-2 text-paper/80">
                <span class="text-ember font-mono">{{ String(i + 1).padStart(2, '0') }}</span>{{ m }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
