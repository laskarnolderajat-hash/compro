<script setup lang="ts">
const { publishedPosts } = usePosts()

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}
</script>

<template>
  <div class="max-w-6xl mx-auto px-5 py-14">
    <p class="font-mono text-ember text-xs uppercase tracking-widest mb-2">Cerita & Tips</p>
    <h1 class="font-display text-5xl md:text-6xl uppercase mb-10">Blog</h1>

    <div v-if="publishedPosts.length === 0" class="text-fog py-16 text-center">Belum ada artikel.</div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
      <NuxtLink
        v-for="post in publishedPosts" :key="post.id" :to="`/blog/${post.slug}`"
        class="group bg-pine border border-white/10 rounded-2xl p-6 hover:border-frost/40 transition-colors flex flex-col"
      >
        <img v-if="post.coverImage" :src="post.coverImage" :alt="post.title" class="w-full h-40 object-cover rounded-lg mb-4" />
        <p class="font-mono text-xs text-frost-dim mb-1">{{ formatDate(post.createdAt) }} · {{ post.author }}</p>
        <h3 class="font-display text-2xl uppercase group-hover:text-frost transition-colors leading-tight mb-2">{{ post.title }}</h3>
        <p class="text-sm text-paper/70 line-clamp-3">{{ post.excerpt }}</p>
      </NuxtLink>
    </div>
  </div>
</template>
