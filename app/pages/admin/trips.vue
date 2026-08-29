<script setup lang="ts">
import type { Trip } from '~/types/models'
definePageMeta({ layout: 'admin' })

const { trips, formatPrice, createTrip, updateTrip, deleteTrip } = useTrips()

const showForm = ref(false)
const editingId = ref<string | null>(null)

function blankTrip(): Trip {
  return {
    id: '', title: '', mountain: '', location: '', elevation: 0, description: '',
    itinerary: [{ day: 1, title: '', activities: [''] }],
    include: [''], exclude: [''], requirements: [''],
    price: 0, quota: 10, slotsTaken: 0,
    dateStart: '', dateEnd: '', status: 'open', images: [], difficulty: 'Pemula',
    registrationConfig: { requireKTP: false, requireBirthPlace: false, requireEmergencyContact: false, minEmergencyContact: 1, requireKTPPhoto: false },
    createdAt: new Date().toISOString(),
  }
}

const form = ref<Trip>(blankTrip())

function openCreate() {
  form.value = blankTrip()
  editingId.value = null
  showForm.value = true
}
function openEdit(trip: Trip) {
  form.value = JSON.parse(JSON.stringify(trip))
  editingId.value = trip.id
  showForm.value = true
}
const qrTripId = ref<string | null>(null)
function toggleQr(id: string) {
  qrTripId.value = qrTripId.value === id ? null : id
}

const saving = ref(false)
const error = ref('')

async function save() {
  if (!form.value.title || !form.value.dateStart) return
  saving.value = true
  error.value = ''
  try {
    if (editingId.value) {
      await updateTrip(editingId.value, form.value)
    } else {
      form.value.id = `trip-${form.value.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`
      await createTrip(form.value)
    }
    showForm.value = false
  } catch (e: any) {
    error.value = e?.data?.message || e?.message || 'Gagal menyimpan trip.'
  } finally {
    saving.value = false
  }
}
async function remove(id: string) {
  if (!confirm('Hapus trip ini?')) return
  try {
    await deleteTrip(id)
  } catch (e: any) {
    error.value = e?.data?.message || e?.message || 'Gagal menghapus trip.'
  }
}

function addListItem(arr: string[]) { arr.push('') }
function addItineraryDay() { form.value.itinerary.push({ day: form.value.itinerary.length + 1, title: '', activities: [''] }) }
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-8">
      <div>
        <p class="font-mono text-ember text-xs uppercase tracking-widest mb-1">Manajemen</p>
        <h1 class="font-display text-4xl uppercase">Kelola Trip</h1>
      </div>
      <button @click="openCreate" class="bg-ember hover:bg-ember-dim text-night font-semibold px-4 py-2 rounded-full text-sm">+ Trip Baru</button>
    </div>

    <!-- List -->
    <div v-if="!showForm" class="space-y-3">
      <div v-for="trip in trips" :key="trip.id" class="bg-pine border border-white/10 rounded-xl p-4">
        <div class="flex items-center justify-between gap-4">
          <div class="min-w-0">
            <div class="font-medium truncate">{{ trip.title }}</div>
            <div class="text-xs text-fog">{{ formatPrice(trip.price) }} · {{ trip.slotsTaken }}/{{ trip.quota }} slot · {{ trip.status }}</div>
          </div>
          <div class="flex gap-2 shrink-0">
            <button @click="toggleQr(trip.id)" class="text-xs border border-white/20 px-3 py-1.5 rounded-full hover:border-frost/50">
              {{ qrTripId === trip.id ? 'Tutup QR' : 'QR' }}
            </button>
            <button @click="openEdit(trip)" class="text-xs border border-white/20 px-3 py-1.5 rounded-full hover:border-frost/50">Edit</button>
            <button @click="remove(trip.id)" class="text-xs border border-ember/40 text-ember px-3 py-1.5 rounded-full hover:bg-ember/10">Hapus</button>
          </div>
        </div>

        <div v-if="qrTripId === trip.id" class="mt-4 pt-4 border-t border-white/10">
          <p class="text-xs text-frost-dim uppercase tracking-wider mb-3 text-center">QR Pendaftaran — tempel di poster/story</p>
          <TripQr :trip-id="trip.id" :title="trip.title" />
        </div>
      </div>
    </div>

    <!-- Form -->
    <div v-else class="bg-pine border border-white/10 rounded-2xl p-6">
      <div class="flex items-center justify-between mb-5">
        <h2 class="font-display text-2xl uppercase">{{ editingId ? 'Edit Trip' : 'Trip Baru' }}</h2>
        <button @click="showForm = false" class="text-xs text-fog hover:text-frost">Batal</button>
      </div>

      <div class="space-y-5">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label class="block"><span class="text-xs text-fog">Judul Trip</span>
            <input v-model="form.title" class="mt-1 w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm" /></label>
          <label class="block"><span class="text-xs text-fog">Nama Gunung</span>
            <input v-model="form.mountain" class="mt-1 w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm" /></label>
          <label class="block"><span class="text-xs text-fog">Lokasi</span>
            <input v-model="form.location" class="mt-1 w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm" /></label>
          <label class="block"><span class="text-xs text-fog">Elevasi (mdpl)</span>
            <input v-model.number="form.elevation" type="number" class="mt-1 w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm" /></label>
          <label class="block"><span class="text-xs text-fog">Tanggal Mulai</span>
            <input v-model="form.dateStart" type="date" class="mt-1 w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm" /></label>
          <label class="block"><span class="text-xs text-fog">Tanggal Selesai</span>
            <input v-model="form.dateEnd" type="date" class="mt-1 w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm" /></label>
          <label class="block"><span class="text-xs text-fog">Harga (Rp)</span>
            <input v-model.number="form.price" type="number" class="mt-1 w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm" /></label>
          <label class="block"><span class="text-xs text-fog">Kuota</span>
            <input v-model.number="form.quota" type="number" class="mt-1 w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm" /></label>
          <label class="block"><span class="text-xs text-fog">Level</span>
            <select v-model="form.difficulty" class="mt-1 w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm">
              <option>Pemula</option><option>Menengah</option><option>Berpengalaman</option>
            </select></label>
          <label class="block"><span class="text-xs text-fog">Status</span>
            <select v-model="form.status" class="mt-1 w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm">
              <option value="open">Buka</option><option value="closed">Tutup</option>
            </select></label>
        </div>

        <label class="block"><span class="text-xs text-fog">Deskripsi</span>
          <textarea v-model="form.description" rows="3" class="mt-1 w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm"></textarea></label>

        <!-- SIMAKSI toggles -->
        <div class="border-t border-white/10 pt-4">
          <p class="text-xs text-frost-dim uppercase tracking-wider mb-3">Kebutuhan Data SIMAKSI</p>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label class="flex items-center gap-2 text-sm"><input type="checkbox" v-model="form.registrationConfig.requireKTP" class="accent-ember" /> Perlu Nomor KTP</label>
            <label class="flex items-center gap-2 text-sm"><input type="checkbox" v-model="form.registrationConfig.requireBirthPlace" class="accent-ember" /> Perlu Tempat Tgl Lahir</label>
            <label class="flex items-center gap-2 text-sm"><input type="checkbox" v-model="form.registrationConfig.requireKTPPhoto" class="accent-ember" /> Perlu Foto KTP</label>
            <label class="flex items-center gap-2 text-sm">
              <input type="checkbox" v-model="form.registrationConfig.requireEmergencyContact" class="accent-ember" /> Perlu Kontak Darurat min.
              <input v-if="form.registrationConfig.requireEmergencyContact" v-model.number="form.registrationConfig.minEmergencyContact" type="number" min="1" class="w-14 bg-night border border-white/15 rounded px-2 py-1 text-sm" />
            </label>
          </div>
        </div>

        <!-- Include / Exclude / Requirements -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p class="text-xs text-fog mb-2">Termasuk</p>
            <input v-for="(_, i) in form.include" :key="i" v-model="form.include[i]" class="mb-1.5 w-full bg-night border border-white/15 rounded-lg px-3 py-1.5 text-sm" />
            <button type="button" @click="addListItem(form.include)" class="text-xs text-frost">+ Tambah</button>
          </div>
          <div>
            <p class="text-xs text-fog mb-2">Tidak Termasuk</p>
            <input v-for="(_, i) in form.exclude" :key="i" v-model="form.exclude[i]" class="mb-1.5 w-full bg-night border border-white/15 rounded-lg px-3 py-1.5 text-sm" />
            <button type="button" @click="addListItem(form.exclude)" class="text-xs text-frost">+ Tambah</button>
          </div>
          <div>
            <p class="text-xs text-fog mb-2">Syarat Peserta</p>
            <input v-for="(_, i) in form.requirements" :key="i" v-model="form.requirements[i]" class="mb-1.5 w-full bg-night border border-white/15 rounded-lg px-3 py-1.5 text-sm" />
            <button type="button" @click="addListItem(form.requirements)" class="text-xs text-frost">+ Tambah</button>
          </div>
        </div>

        <!-- Itinerary -->
        <div>
          <p class="text-xs text-fog mb-2">Itinerary</p>
          <div v-for="(day, di) in form.itinerary" :key="di" class="mb-3 p-3 bg-night rounded-lg border border-white/10">
            <div class="flex gap-2 mb-2">
              <span class="text-xs text-frost-dim font-mono pt-2">Hari {{ day.day }}</span>
              <input v-model="day.title" placeholder="Judul hari" class="flex-1 bg-pine-light border border-white/15 rounded px-3 py-1.5 text-sm" />
            </div>
            <input v-for="(_, ai) in day.activities" :key="ai" v-model="day.activities[ai]" placeholder="Aktivitas" class="mb-1.5 w-full bg-pine-light border border-white/15 rounded px-3 py-1.5 text-sm" />
            <button type="button" @click="day.activities.push('')" class="text-xs text-frost">+ Aktivitas</button>
          </div>
          <button type="button" @click="addItineraryDay" class="text-xs text-frost">+ Tambah Hari</button>
        </div>

        <p v-if="error" class="text-ember text-sm mb-2">{{ error }}</p>
        <button @click="save" :disabled="saving" class="bg-ember hover:bg-ember-dim disabled:opacity-60 text-night font-semibold px-6 py-2.5 rounded-full text-sm">{{ saving ? "Menyimpan…" : "Simpan Trip" }}</button>
      </div>
    </div>
  </div>
</template>
