<script setup lang="ts">
import type { SocialPost } from '~/types/models'

// Embed resmi platform. Tidak butuh API key untuk post publik, tapi memuat
// skrip pihak ketiga — makanya hanya dipakai di /galeri, dan skripnya baru
// dimuat saat blok ini masuk viewport.
const props = defineProps<{ post: SocialPost }>()

const root = ref<HTMLElement | null>(null)
const shown = ref(false)

const SCRIPTS: Record<SocialPost['platform'], string> = {
  instagram: 'https://www.instagram.com/embed.js',
  tiktok: 'https://www.tiktok.com/embed.js',
}

// Satu skrip per platform untuk seluruh halaman.
const loaded = new Set<string>()

function loadScript(platform: SocialPost['platform']) {
  const src = SCRIPTS[platform]
  if (loaded.has(src)) {
    // Instagram perlu diminta memproses blockquote yang baru muncul.
    ;(window as any).instgrm?.Embeds?.process?.()
    return
  }
  loaded.add(src)
  const s = document.createElement('script')
  s.src = src
  s.async = true
  document.body.appendChild(s)
}

onMounted(() => {
  if (!root.value) return
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue
      shown.value = true
      io.disconnect()
      nextTick(() => loadScript(props.post.platform))
    }
  }, { rootMargin: '200px' })
  io.observe(root.value)
  onBeforeUnmount(() => io.disconnect())
})
</script>

<template>
  <div ref="root" class="bg-white rounded-2xl overflow-hidden min-h-[420px]">
    <template v-if="shown">
      <blockquote
        v-if="post.platform === 'instagram'"
        class="instagram-media"
        :data-instgrm-permalink="post.url"
        data-instgrm-version="14"
        style="margin:0;width:100%"
      >
        <a :href="post.url" target="_blank" rel="noopener">Lihat di Instagram</a>
      </blockquote>

      <blockquote
        v-else
        class="tiktok-embed"
        :cite="post.url"
        :data-video-id="post.postId"
        style="margin:0;width:100%"
      >
        <section>
          <a :href="post.url" target="_blank" rel="noopener">Lihat di TikTok</a>
        </section>
      </blockquote>
    </template>

    <div v-else class="h-[420px] flex items-center justify-center text-night/40 text-sm">
      Memuat…
    </div>
  </div>
</template>
