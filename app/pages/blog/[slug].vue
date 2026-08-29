<script setup lang="ts">
const route = useRoute()
const { getPostBySlug } = usePosts()

const post = computed(() => getPostBySlug(route.params.slug as string))

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}
</script>

<template>
  <div v-if="!post" class="max-w-3xl mx-auto px-5 py-24 text-center">
    <p class="text-fog">Artikel tidak ditemukan.</p>
    <NuxtLink to="/blog" class="text-frost underline">Kembali ke blog</NuxtLink>
  </div>

  <div v-else class="max-w-3xl mx-auto px-5 py-14">
    <NuxtLink to="/blog" class="text-sm text-fog hover:text-frost">← Semua Artikel</NuxtLink>

    <p class="font-mono text-ember text-xs uppercase tracking-widest mt-4 mb-2">{{ formatDate(post.createdAt) }} · {{ post.author }}</p>
    <h1 class="font-display text-4xl md:text-5xl uppercase leading-tight mb-6">{{ post.title }}</h1>

    <img v-if="post.coverImage" :src="post.coverImage" :alt="post.title" class="w-full rounded-2xl mb-8" />

    <p class="text-paper/80 leading-relaxed whitespace-pre-line">{{ post.content }}</p>
  </div>
</template>
