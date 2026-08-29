<script setup lang="ts">
const { profile } = useCompanyProfile()
const route = useRoute()
const mobileOpen = ref(false)

const navItems = [
  { label: 'Beranda', to: '/' },
  { label: 'Open Trip', to: '/trip' },
  { label: 'Blog', to: '/blog' },
  { label: 'Cek Pendaftaran', to: '/riwayat' },
]
</script>

<template>
  <div class="min-h-screen flex flex-col bg-night text-paper">
    <header class="sticky top-0 z-40 border-b border-white/10 bg-night/90 backdrop-blur">
      <nav class="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
        <NuxtLink to="/" class="flex items-center gap-2 group">
          <span class="font-display text-2xl tracking-tight text-frost group-hover:text-ember transition-colors">0°</span>
          <span class="font-display text-xl uppercase tracking-wide">{{ profile.companyName }}</span>
        </NuxtLink>
        <div class="hidden md:flex items-center gap-8">
          <NuxtLink
            v-for="item in navItems" :key="item.to" :to="item.to"
            class="text-sm font-medium text-paper/80 hover:text-frost transition-colors"
            :class="{ 'text-frost': route.path === item.to }"
          >{{ item.label }}</NuxtLink>
          <NuxtLink to="/trip" class="text-sm font-semibold bg-ember hover:bg-ember-dim text-night px-4 py-2 rounded-full transition-colors">
            Gabung Trip
          </NuxtLink>
        </div>
        <button class="md:hidden p-2 -mr-2" @click="mobileOpen = !mobileOpen" aria-label="Buka menu">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path v-if="!mobileOpen" d="M3 6h18M3 12h18M3 18h18" />
            <path v-else d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </nav>
      <div v-if="mobileOpen" class="md:hidden border-t border-white/10 bg-night px-5 py-4 flex flex-col gap-4">
        <NuxtLink v-for="item in navItems" :key="item.to" :to="item.to" class="text-base font-medium py-1" @click="mobileOpen = false">
          {{ item.label }}
        </NuxtLink>
        <NuxtLink to="/trip" class="text-sm font-semibold bg-ember text-night px-4 py-2.5 rounded-full text-center" @click="mobileOpen = false">
          Gabung Trip
        </NuxtLink>
      </div>
    </header>

    <main class="flex-1">
      <slot />
    </main>

    <footer class="border-t border-white/10 mt-16">
      <div class="max-w-6xl mx-auto px-5 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <div class="font-display text-2xl uppercase mb-2">{{ profile.companyName }}</div>
          <p class="text-sm text-fog max-w-xs">{{ profile.tagline }}</p>
        </div>
        <div class="text-sm text-paper/80 space-y-1.5">
          <p class="text-frost-dim font-mono text-xs uppercase tracking-wider mb-2">Kontak</p>
          <p>{{ profile.contact.phone }}</p>
          <p>{{ profile.contact.email }}</p>
          <p>{{ profile.contact.address }}</p>
        </div>
        <div class="text-sm text-paper/80 space-y-1.5">
          <p class="text-frost-dim font-mono text-xs uppercase tracking-wider mb-2">Navigasi</p>
          <NuxtLink to="/trip" class="block hover:text-frost">Open Trip</NuxtLink>
          <NuxtLink to="/blog" class="block hover:text-frost">Blog</NuxtLink>
          <NuxtLink to="/riwayat" class="block hover:text-frost">Cek Pendaftaran</NuxtLink>
          <NuxtLink to="/admin" class="block hover:text-frost text-fog">Admin</NuxtLink>
        </div>
      </div>
      <div class="text-center text-xs text-fog/70 pb-6 font-mono">© {{ new Date().getFullYear() }} {{ profile.companyName }} — Menapak dingin, menaklukkan puncak.</div>
    </footer>
  </div>
</template>
