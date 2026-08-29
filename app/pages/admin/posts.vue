<script setup lang="ts">
import type { Post } from '~/types/models'
definePageMeta({ layout: 'admin' })

const { posts, createPost, updatePost, deletePost, slugify } = usePosts()

const showForm = ref(false)
const editingId = ref<string | null>(null)

function blankPost(): Post {
  return {
    id: '', title: '', slug: '', excerpt: '', content: '', coverImage: '',
    author: '', status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

const form = ref<Post>(blankPost())

function openCreate() {
  form.value = blankPost()
  editingId.value = null
  showForm.value = true
}
function openEdit(post: Post) {
  form.value = JSON.parse(JSON.stringify(post))
  editingId.value = post.id
  showForm.value = true
}
const saving = ref(false)
const error = ref('')

async function save() {
  if (!form.value.title) return
  if (!form.value.slug) form.value.slug = slugify(form.value.title)
  form.value.updatedAt = new Date().toISOString()
  saving.value = true
  error.value = ''
  try {
    if (editingId.value) {
      await updatePost(editingId.value, form.value)
    } else {
      form.value.id = `post-${slugify(form.value.title)}-${Date.now()}`
      await createPost(form.value)
    }
    showForm.value = false
  } catch (e: any) {
    error.value = e?.data?.message || e?.message || 'Gagal menyimpan post.'
  } finally {
    saving.value = false
  }
}
async function remove(id: string) {
  if (!confirm('Hapus post ini?')) return
  try {
    await deletePost(id)
  } catch (e: any) {
    error.value = e?.data?.message || e?.message || 'Gagal menghapus post.'
  }
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-8">
      <div>
        <p class="font-mono text-ember text-xs uppercase tracking-widest mb-1">Manajemen</p>
        <h1 class="font-display text-4xl uppercase">Kelola Post</h1>
      </div>
      <button @click="openCreate" class="bg-ember hover:bg-ember-dim text-night font-semibold px-4 py-2 rounded-full text-sm">+ Post Baru</button>
    </div>

    <!-- List -->
    <div v-if="!showForm" class="space-y-3">
      <div v-if="posts.length === 0" class="text-fog text-sm">Belum ada post.</div>
      <div v-for="post in posts" :key="post.id" class="bg-pine border border-white/10 rounded-xl p-4 flex items-center justify-between gap-4">
        <div class="min-w-0">
          <div class="font-medium truncate">{{ post.title }}</div>
          <div class="text-xs text-fog">{{ post.author }} · {{ post.status === 'published' ? 'Terbit' : 'Draft' }} · /blog/{{ post.slug }}</div>
        </div>
        <div class="flex gap-2 shrink-0">
          <button @click="openEdit(post)" class="text-xs border border-white/20 px-3 py-1.5 rounded-full hover:border-frost/50">Edit</button>
          <button @click="remove(post.id)" class="text-xs border border-ember/40 text-ember px-3 py-1.5 rounded-full hover:bg-ember/10">Hapus</button>
        </div>
      </div>
    </div>

    <!-- Form -->
    <div v-else class="bg-pine border border-white/10 rounded-2xl p-6">
      <div class="flex items-center justify-between mb-5">
        <h2 class="font-display text-2xl uppercase">{{ editingId ? 'Edit Post' : 'Post Baru' }}</h2>
        <button @click="showForm = false" class="text-xs text-fog hover:text-frost">Batal</button>
      </div>

      <div class="space-y-5">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label class="block"><span class="text-xs text-fog">Judul</span>
            <input v-model="form.title" class="mt-1 w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm" /></label>
          <label class="block"><span class="text-xs text-fog">Slug (opsional, otomatis dari judul)</span>
            <input v-model="form.slug" class="mt-1 w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm" placeholder="otomatis-dari-judul" /></label>
          <label class="block"><span class="text-xs text-fog">Penulis</span>
            <input v-model="form.author" class="mt-1 w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm" /></label>
          <label class="block"><span class="text-xs text-fog">Cover Image (URL)</span>
            <input v-model="form.coverImage" class="mt-1 w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm" /></label>
          <label class="block"><span class="text-xs text-fog">Status</span>
            <select v-model="form.status" class="mt-1 w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm">
              <option value="draft">Draft</option><option value="published">Terbit</option>
            </select></label>
        </div>

        <label class="block"><span class="text-xs text-fog">Ringkasan (excerpt)</span>
          <textarea v-model="form.excerpt" rows="2" class="mt-1 w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm"></textarea></label>

        <label class="block"><span class="text-xs text-fog">Konten</span>
          <textarea v-model="form.content" rows="8" class="mt-1 w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm"></textarea></label>

        <p v-if="error" class="text-ember text-sm mb-2">{{ error }}</p>
        <button @click="save" :disabled="saving" class="bg-ember hover:bg-ember-dim disabled:opacity-60 text-night font-semibold px-6 py-2.5 rounded-full text-sm">{{ saving ? 'Menyimpan…' : 'Simpan Post' }}</button>
      </div>
    </div>
  </div>
</template>
