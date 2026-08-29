<script setup lang="ts">
import type { SocialPost } from '~/types/models'
definePageMeta({ layout: 'admin' })

const { posts, loading, platformLabel, createSocialPost, updateSocialPost, deleteSocialPost } = useSocialPosts()
const { trips } = useTrips()

const url = ref('')
const caption = ref('')
const thumbnailUrl = ref('')
const tripId = ref('')
const featured = ref(true)

const saving = ref(false)
const error = ref('')

// Instagram tidak punya oEmbed tanpa token app Meta, jadi thumbnail & caption
// IG harus diisi manual. TikTok terisi otomatis dari oEmbed publik.
const isInstagram = computed(() => /instagram\.com/i.test(url.value))

async function add() {
  if (!url.value.trim() || saving.value) return
  saving.value = true
  error.value = ''
  try {
    await createSocialPost({
      url: url.value.trim(),
      caption: caption.value.trim() || undefined,
      thumbnailUrl: thumbnailUrl.value.trim() || undefined,
      tripId: tripId.value || undefined,
      featured: featured.value,
    })
    url.value = ''
    caption.value = ''
    thumbnailUrl.value = ''
    tripId.value = ''
  } catch (e: any) {
    error.value = e?.data?.message || e?.message || 'Gagal menambah postingan.'
  } finally {
    saving.value = false
  }
}

async function patch(post: SocialPost, changes: Partial<SocialPost>) {
  try {
    await updateSocialPost(post.id, changes)
  } catch (e: any) {
    error.value = e?.data?.message || e?.message || 'Gagal menyimpan perubahan.'
  }
}

async function remove(post: SocialPost) {
  if (!confirm('Hapus postingan ini dari situs? Postingan aslinya di IG/TikTok tidak terhapus.')) return
  try {
    await deleteSocialPost(post.id)
  } catch (e: any) {
    error.value = e?.data?.message || e?.message || 'Gagal menghapus.'
  }
}

/** Tukar urutan dengan tetangganya — daftar sudah urut `order` menurun. */
async function move(index: number, arah: -1 | 1) {
  const a = posts.value[index]
  const b = posts.value[index + arah]
  if (!a || !b) return
  await Promise.all([
    updateSocialPost(a.id, { order: b.order }),
    updateSocialPost(b.id, { order: a.order }),
  ]).catch((e: any) => (error.value = e?.data?.message || 'Gagal mengubah urutan.'))
}
</script>

<template>
  <div>
    <div class="mb-8">
      <p class="font-mono text-ember text-xs uppercase tracking-widest mb-1">Manajemen</p>
      <h1 class="font-display text-4xl uppercase">Sosial Media</h1>
      <p class="text-fog text-sm mt-2">
        Tempel link post Instagram atau video TikTok. Yang ditandai <em>Tampilkan di beranda</em>
        muncul di halaman depan; semuanya muncul di <NuxtLink to="/galeri" class="text-frost underline">/galeri</NuxtLink>.
      </p>
    </div>

    <!-- Form tambah -->
    <div class="bg-pine border border-white/10 rounded-2xl p-6 mb-8 space-y-4">
      <label class="block">
        <span class="text-xs text-fog">Link post</span>
        <input
          v-model="url" @keyup.enter="add"
          placeholder="https://www.instagram.com/reel/XXXX/  atau  https://www.tiktok.com/@akun/video/123"
          class="mt-1 w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm focus:border-frost outline-none"
        />
      </label>

      <p v-if="isInstagram" class="text-xs text-fog bg-night/60 border border-white/10 rounded-lg p-3">
        Instagram tidak mengizinkan pengambilan thumbnail otomatis tanpa izin aplikasi Meta.
        Isi caption dan URL gambar di bawah kalau mau kartunya bergambar di beranda —
        kalau dikosongkan, kartunya tetap tampil tapi polos. Embed di /galeri tetap utuh.
      </p>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label class="block">
          <span class="text-xs text-fog">Caption (opsional{{ isInstagram ? '' : ' — TikTok terisi otomatis' }})</span>
          <input v-model="caption" class="mt-1 w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm" />
        </label>
        <label class="block">
          <span class="text-xs text-fog">URL thumbnail (opsional{{ isInstagram ? '' : ' — TikTok otomatis' }})</span>
          <input v-model="thumbnailUrl" class="mt-1 w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm" />
        </label>
        <label class="block">
          <span class="text-xs text-fog">Kaitkan ke trip (opsional)</span>
          <select v-model="tripId" class="mt-1 w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm">
            <option value="">— tidak dikaitkan —</option>
            <option v-for="t in trips" :key="t.id" :value="t.id">{{ t.title }}</option>
          </select>
        </label>
        <label class="flex items-end gap-2 text-sm pb-2">
          <input type="checkbox" v-model="featured" class="accent-ember" /> Tampilkan di beranda
        </label>
      </div>

      <p v-if="error" class="text-ember text-sm">{{ error }}</p>
      <button
        @click="add" :disabled="saving || !url.trim()"
        class="bg-ember hover:bg-ember-dim disabled:opacity-60 text-night font-semibold px-6 py-2.5 rounded-full text-sm"
      >{{ saving ? 'Menambahkan…' : '+ Tambah Postingan' }}</button>
    </div>

    <!-- Daftar -->
    <div v-if="loading" class="text-fog text-sm">Memuat…</div>
    <div v-else-if="posts.length === 0" class="text-fog text-sm">Belum ada postingan.</div>

    <div v-else class="space-y-3">
      <div
        v-for="(p, i) in posts" :key="p.id"
        class="bg-pine border border-white/10 rounded-xl p-4 flex items-start gap-4"
      >
        <img v-if="p.thumbnailUrl" :src="p.thumbnailUrl" alt="" class="w-16 h-20 object-cover rounded-lg shrink-0" />
        <div v-else class="w-16 h-20 rounded-lg bg-night border border-white/10 shrink-0" />

        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2 mb-1">
            <span class="text-[10px] font-mono uppercase tracking-wider text-frost-dim">{{ platformLabel[p.platform] }}</span>
            <span v-if="p.authorName" class="text-xs text-fog">@{{ p.authorName }}</span>
          </div>
          <p class="text-sm truncate">{{ p.caption || p.url }}</p>
          <p v-if="p.tripId" class="text-xs text-frost-dim mt-1">
            Trip: {{ trips.find(t => t.id === p.tripId)?.title || p.tripId }}
          </p>

          <div class="flex flex-wrap items-center gap-3 mt-3">
            <label class="flex items-center gap-1.5 text-xs text-fog">
              <input
                type="checkbox" :checked="p.featured" class="accent-ember"
                @change="patch(p, { featured: ($event.target as HTMLInputElement).checked })"
              /> Beranda
            </label>
            <a :href="p.url" target="_blank" rel="noopener" class="text-xs text-frost hover:underline">Buka post ↗</a>
            <button @click="move(i, -1)" :disabled="i === 0" class="text-xs text-fog disabled:opacity-30 hover:text-frost">↑ Naik</button>
            <button @click="move(i, 1)" :disabled="i === posts.length - 1" class="text-xs text-fog disabled:opacity-30 hover:text-frost">↓ Turun</button>
            <button @click="remove(p)" class="text-xs text-ember hover:underline ml-auto">Hapus</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
