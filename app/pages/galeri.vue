<script setup lang="ts">
import type { SocialPost } from '~/types/models'

const { posts, loading, byPlatform } = useSocialPosts()
const { profile } = useCompanyProfile()

const filter = ref<SocialPost['platform'] | 'all'>('all')
const shown = computed(() => byPlatform(filter.value))

const tabs: { value: SocialPost['platform'] | 'all', label: string }[] = [
  { value: 'all', label: 'Semua' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'tiktok', label: 'TikTok' },
]

useHead({
  title: 'Galeri — Laskar Nol Derajat',
  meta: [{ name: 'description', content: 'Dokumentasi perjalanan Laskar Nol Derajat dari Instagram dan TikTok.' }],
})
</script>

<template>
  <div class="max-w-6xl mx-auto px-5 py-14">
    <p class="font-mono text-ember text-xs uppercase tracking-widest mb-2">Dokumentasi</p>
    <h1 class="font-display text-5xl md:text-6xl uppercase mb-4">Galeri</h1>
    <p class="text-fog max-w-2xl mb-8">
      Cerita perjalanan kami dari Instagram dan TikTok — sebagian besar diambil langsung di atas gunung.
    </p>

    <div class="flex flex-wrap items-center gap-2 mb-10">
      <button
        v-for="t in tabs" :key="t.value"
        @click="filter = t.value"
        class="text-sm px-4 py-2 rounded-full border transition-colors"
        :class="filter === t.value ? 'bg-frost text-night border-frost font-semibold' : 'border-white/20 text-fog hover:border-frost/50'"
      >{{ t.label }}</button>

      <a
        v-if="profile.contact.instagram"
        :href="`https://instagram.com/${profile.contact.instagram.replace('@', '')}`"
        target="_blank" rel="noopener"
        class="ml-auto text-sm text-frost hover:underline"
      >Ikuti {{ profile.contact.instagram }} →</a>
    </div>

    <div v-if="loading" class="text-fog text-center py-20">Memuat postingan…</div>

    <div v-else-if="shown.length === 0" class="text-fog text-center py-20">
      Belum ada postingan{{ filter !== 'all' ? ` dari ${filter === 'instagram' ? 'Instagram' : 'TikTok'}` : '' }}.
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <SocialEmbed v-for="p in shown" :key="p.id" :post="p" />
    </div>
  </div>
</template>
