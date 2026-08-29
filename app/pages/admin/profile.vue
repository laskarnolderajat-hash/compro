<script setup lang="ts">
definePageMeta({ layout: 'admin' })
import type { CompanyProfile } from '~/types/models'

const { profile, updateProfile } = useCompanyProfile()

const form = ref<CompanyProfile>(JSON.parse(JSON.stringify(profile.value)))
const saved = ref(false)
const saving = ref(false)
const error = ref('')

// Profil datang async dari Firestore — isi ulang form sekali saat data tiba.
let hydrated = false
watch(profile, (p) => {
  if (!hydrated && p.updatedAt) {
    form.value = JSON.parse(JSON.stringify(p))
    hydrated = true
  }
}, { immediate: true })

async function save() {
  saving.value = true
  error.value = ''
  try {
    await updateProfile(form.value)
    saved.value = true
    setTimeout(() => (saved.value = false), 2000)
  } catch (e: any) {
    error.value = e?.data?.message || e?.message || 'Gagal menyimpan profil.'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div>
    <p class="font-mono text-ember text-xs uppercase tracking-widest mb-1">Manajemen</p>
    <h1 class="font-display text-4xl uppercase mb-6">Profil Perusahaan</h1>

    <div class="bg-pine border border-white/10 rounded-2xl p-6 space-y-4 max-w-2xl">
      <label class="block"><span class="text-xs text-fog">Nama Perusahaan</span>
        <input v-model="form.companyName" class="mt-1 w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm" /></label>
      <label class="block"><span class="text-xs text-fog">Tagline</span>
        <input v-model="form.tagline" class="mt-1 w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm" /></label>
      <label class="block"><span class="text-xs text-fog">Tentang</span>
        <textarea v-model="form.about" rows="4" class="mt-1 w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm"></textarea></label>
      <label class="block"><span class="text-xs text-fog">Visi</span>
        <textarea v-model="form.vision" rows="2" class="mt-1 w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm"></textarea></label>
      <div>
        <span class="text-xs text-fog">Misi</span>
        <input v-for="(_, i) in form.mission" :key="i" v-model="form.mission[i]" class="mt-1 mb-1.5 w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm" />
        <button type="button" @click="form.mission.push('')" class="text-xs text-frost">+ Tambah</button>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <label class="block"><span class="text-xs text-fog">Telepon</span>
          <input v-model="form.contact.phone" class="mt-1 w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm" /></label>
        <label class="block"><span class="text-xs text-fog">Email</span>
          <input v-model="form.contact.email" class="mt-1 w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm" /></label>
        <label class="block"><span class="text-xs text-fog">WhatsApp</span>
          <input v-model="form.contact.whatsapp" class="mt-1 w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm" /></label>
        <label class="block"><span class="text-xs text-fog">Alamat</span>
          <input v-model="form.contact.address" class="mt-1 w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm" /></label>
      </div>
      <button @click="save" :disabled="saving" class="bg-ember hover:bg-ember-dim disabled:opacity-60 text-night font-semibold px-6 py-2.5 rounded-full text-sm">{{ saving ? 'Menyimpan…' : 'Simpan Perubahan' }}</button>
      <span v-if="saved" class="ml-3 text-frost text-sm">Tersimpan ✓</span>
      <span v-if="error" class="ml-3 text-ember text-sm">{{ error }}</span>
    </div>
  </div>
</template>
