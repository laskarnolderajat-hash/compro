<script setup lang="ts">
import type { SocialPost } from '~/types/models'

// Kartu ringan tanpa skrip pihak ketiga — dipakai di halaman depan dan detail
// trip. Embed penuh hanya di /galeri lewat <SocialEmbed>.
const props = defineProps<{ post: SocialPost }>()

const badge = computed(() => props.post.platform === 'instagram'
  ? { label: 'Instagram', cls: 'bg-gradient-to-br from-[#833ab4] via-[#fd1d1d] to-[#fcb045]' }
  : { label: 'TikTok', cls: 'bg-black border border-white/25' })
</script>

<template>
  <a
    :href="post.url" target="_blank" rel="noopener"
    class="group block bg-pine border border-white/10 rounded-2xl overflow-hidden hover:border-frost/40 transition-colors"
  >
    <div class="relative aspect-[4/5] bg-night">
      <img
        v-if="post.thumbnailUrl"
        :src="post.thumbnailUrl"
        :alt="post.caption || `Postingan ${badge.label}`"
        loading="lazy"
        class="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
      />
      <div v-else class="w-full h-full flex items-center justify-center text-fog text-sm px-4 text-center">
        Lihat di {{ badge.label }}
      </div>

      <span class="absolute top-3 left-3 text-[10px] font-mono uppercase tracking-wider px-2 py-1 rounded-full text-white" :class="badge.cls">
        {{ badge.label }}
      </span>
    </div>

    <div class="p-4">
      <p v-if="post.caption" class="text-sm text-paper/80 line-clamp-2">{{ post.caption }}</p>
      <p v-if="post.authorName" class="text-xs text-fog mt-1">@{{ post.authorName }}</p>
    </div>
  </a>
</template>
