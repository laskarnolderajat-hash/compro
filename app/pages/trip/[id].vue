<script setup lang="ts">
import type { Participant, EmergencyContact } from '~/types/models'

const route = useRoute()
const { getTripById, formatPrice, formatDateRange, effectiveStatus, slotsRemaining } = useTrips()
const { submitBooking } = useBookings()
const { postsForTrip } = useSocialPosts()

const trip = computed(() => getTripById(route.params.id as string))
const tripPosts = computed(() => (trip.value ? postsForTrip(trip.value.id) : []))

function blankParticipant(): Participant {
  return {
    name: '', domicileAddress: '', hasPreExistingCondition: false, preExistingConditionNote: '',
    phone: '', email: '',
    ktpNumber: '', birthPlace: '', birthDate: '',
    emergencyContacts: trip.value ? Array.from({ length: trip.value.registrationConfig.minEmergencyContact }, () => ({ name: '', phone: '', relation: '' })) : [],
    ktpPhotoUrl: '',
  }
}

const participants = ref<Participant[]>([])
const notes = ref('')
const submitted = ref<null | 'pending' | 'waitlist'>(null)
const error = ref('')

watchEffect(() => {
  if (trip.value && participants.value.length === 0) {
    participants.value = [blankParticipant()]
  }
})

function addParticipant() {
  participants.value.push(blankParticipant())
}
function removeParticipant(idx: number) {
  participants.value.splice(idx, 1)
}
function addEmergencyContact(p: Participant) {
  if (!p.emergencyContacts) p.emergencyContacts = []
  p.emergencyContacts.push({ name: '', phone: '', relation: '' } as EmergencyContact)
}

const submitting = ref(false)

async function handleSubmit() {
  error.value = ''
  if (!trip.value || submitting.value) return
  for (const p of participants.value) {
    if (!p.name || !p.domicileAddress || !p.phone || !p.email) {
      error.value = 'Lengkapi Nama, Alamat Domisili, No. Telp, dan Email untuk semua peserta.'
      return
    }
    const cfg = trip.value.registrationConfig
    if (cfg.requireKTP && !p.ktpNumber) { error.value = 'Nomor KTP wajib diisi untuk semua peserta.'; return }
    if (cfg.requireBirthPlace && (!p.birthPlace || !p.birthDate)) { error.value = 'Tempat & Tanggal Lahir wajib diisi.'; return }
    if (cfg.requireEmergencyContact) {
      const filled = (p.emergencyContacts || []).filter(c => c.name && c.phone)
      if (filled.length < cfg.minEmergencyContact) { error.value = `Minimal ${cfg.minEmergencyContact} kontak darurat wajib diisi.`; return }
    }
  }
  submitting.value = true
  try {
    const booking = await submitBooking(trip.value.id, participants.value, notes.value)
    submitted.value = booking.status === 'waitlist' ? 'waitlist' : 'pending'
  } catch (e: any) {
    error.value = e?.data?.message || 'Gagal mengirim pendaftaran. Coba lagi.'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div v-if="!trip" class="max-w-3xl mx-auto px-5 py-24 text-center">
    <p class="text-fog">Trip tidak ditemukan.</p>
    <NuxtLink to="/trip" class="text-frost underline">Kembali ke daftar trip</NuxtLink>
  </div>

  <div v-else class="max-w-4xl mx-auto px-5 py-14">
    <NuxtLink to="/trip" class="text-sm text-fog hover:text-frost">← Semua Trip</NuxtLink>

    <div class="mt-4 flex items-start justify-between gap-4">
      <div>
        <p class="font-mono text-ember text-xs uppercase tracking-widest mb-2">{{ trip.mountain }} · {{ trip.location }}</p>
        <h1 class="font-display text-4xl md:text-5xl uppercase leading-none">{{ trip.title }}</h1>
      </div>
      <div class="font-mono text-right shrink-0">
        <div class="text-3xl text-frost">{{ trip.elevation.toLocaleString('id-ID') }}</div>
        <div class="text-xs text-fog">MDPL</div>
      </div>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 mb-8">
      <div class="bg-pine border border-white/10 rounded-xl p-4">
        <div class="text-xs text-fog mb-1">Tanggal</div>
        <div class="font-medium text-sm">{{ formatDateRange(trip.dateStart, trip.dateEnd) }}</div>
      </div>
      <div class="bg-pine border border-white/10 rounded-xl p-4">
        <div class="text-xs text-fog mb-1">Harga</div>
        <div class="font-medium text-sm text-frost">{{ formatPrice(trip.price) }}</div>
      </div>
      <div class="bg-pine border border-white/10 rounded-xl p-4">
        <div class="text-xs text-fog mb-1">Slot Tersisa</div>
        <div class="font-medium text-sm" :class="effectiveStatus(trip)==='open' ? 'text-frost' : 'text-ember'">{{ slotsRemaining(trip) }} / {{ trip.quota }}</div>
      </div>
      <div class="bg-pine border border-white/10 rounded-xl p-4">
        <div class="text-xs text-fog mb-1">Level</div>
        <div class="font-medium text-sm">{{ trip.difficulty }}</div>
      </div>
    </div>

    <p class="text-paper/80 leading-relaxed mb-10">{{ trip.description }}</p>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
      <div>
        <h2 class="font-display text-2xl uppercase mb-3 text-frost">Itinerary</h2>
        <div v-for="day in trip.itinerary" :key="day.day" class="mb-3 pl-4 border-l-2 border-white/10">
          <div class="font-mono text-xs text-ember">Hari {{ day.day }}</div>
          <div class="font-medium">{{ day.title }}</div>
          <ul class="text-sm text-paper/70 list-disc list-inside">
            <li v-for="(a, i) in day.activities" :key="i">{{ a }}</li>
          </ul>
        </div>
      </div>
      <div class="space-y-6">
        <div>
          <h2 class="font-display text-2xl uppercase mb-2 text-frost">Termasuk</h2>
          <ul class="text-sm text-paper/70 space-y-1">
            <li v-for="(i, idx) in trip.include" :key="idx">✓ {{ i }}</li>
          </ul>
        </div>
        <div>
          <h2 class="font-display text-2xl uppercase mb-2 text-frost">Tidak Termasuk</h2>
          <ul class="text-sm text-paper/70 space-y-1">
            <li v-for="(i, idx) in trip.exclude" :key="idx">✕ {{ i }}</li>
          </ul>
        </div>
        <div>
          <h2 class="font-display text-2xl uppercase mb-2 text-frost">Syarat Peserta</h2>
          <ul class="text-sm text-paper/70 space-y-1">
            <li v-for="(r, idx) in trip.requirements" :key="idx">• {{ r }}</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Dokumentasi dari sosial media -->
    <div v-if="tripPosts.length" class="border-t border-white/10 pt-8 mb-10">
      <h2 class="font-display text-2xl uppercase mb-3 text-frost">Dokumentasi</h2>
      <p class="text-sm text-fog mb-5">Cuplikan perjalanan ini dari Instagram &amp; TikTok kami.</p>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SocialCard v-for="p in tripPosts" :key="p.id" :post="p" />
      </div>
    </div>

    <!-- Bagikan -->
    <div class="border-t border-white/10 pt-8 mb-10">
      <h2 class="font-display text-2xl uppercase mb-3 text-frost">Bagikan Trip Ini</h2>
      <div class="bg-pine border border-white/10 rounded-2xl p-5 inline-flex">
        <TripQr :trip-id="trip.id" :title="trip.title" compact />
      </div>
    </div>

    <!-- Booking form -->
    <div class="border-t border-white/10 pt-10">
      <h2 class="font-display text-3xl uppercase mb-1">Daftar Trip Ini</h2>
      <p class="text-fog text-sm mb-6">Isi data peserta di bawah. Pendaftaran akan berstatus "Menunggu Konfirmasi" sampai admin memverifikasi.</p>

      <div v-if="submitted" class="bg-frost/10 border border-frost/30 rounded-2xl p-6 text-center">
        <p class="font-display text-2xl uppercase text-frost mb-2">Pendaftaran Terkirim</p>
        <p class="text-paper/80 text-sm" v-if="submitted === 'pending'">Status kamu: <strong>Menunggu Konfirmasi</strong>. Cek status di halaman "Cek Pendaftaran" pakai nomor HP kamu.</p>
        <p class="text-paper/80 text-sm" v-else>Kuota penuh — kamu masuk <strong>Daftar Tunggu (Waitlist)</strong>. Kami akan hubungi via WhatsApp jika ada slot kosong.</p>
        <NuxtLink to="/riwayat" class="inline-block mt-4 text-frost underline text-sm">Cek status pendaftaran →</NuxtLink>
      </div>

      <form v-else @submit.prevent="handleSubmit" class="space-y-6">
        <div v-for="(p, idx) in participants" :key="idx" class="bg-pine border border-white/10 rounded-2xl p-5">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-mono text-sm text-frost-dim uppercase tracking-wider">Peserta {{ idx + 1 }}</h3>
            <button v-if="participants.length > 1" type="button" @click="removeParticipant(idx)" class="text-xs text-ember hover:underline">Hapus</button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label class="block">
              <span class="text-xs text-fog">Nama Lengkap</span>
              <input v-model="p.name" required class="mt-1 w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm focus:border-frost outline-none" />
            </label>
            <label class="block">
              <span class="text-xs text-fog">No. Telp (WhatsApp)</span>
              <input v-model="p.phone" required class="mt-1 w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm focus:border-frost outline-none" placeholder="08xxxxxxxxxx" />
            </label>
            <label class="block md:col-span-2">
              <span class="text-xs text-fog">Alamat Domisili</span>
              <input v-model="p.domicileAddress" required class="mt-1 w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm focus:border-frost outline-none" />
            </label>
            <label class="block">
              <span class="text-xs text-fog">Email</span>
              <input v-model="p.email" type="email" required class="mt-1 w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm focus:border-frost outline-none" />
            </label>
            <label class="flex items-center gap-2 mt-5">
              <input v-model="p.hasPreExistingCondition" type="checkbox" class="accent-ember" />
              <span class="text-sm">Punya penyakit bawaan?</span>
            </label>
            <input v-if="p.hasPreExistingCondition" v-model="p.preExistingConditionNote" placeholder="Keterangan penyakit bawaan" class="md:col-span-2 mt-1 w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm focus:border-frost outline-none" />

            <template v-if="trip.registrationConfig.requireKTP">
              <label class="block">
                <span class="text-xs text-fog">Nomor KTP</span>
                <input v-model="p.ktpNumber" required class="mt-1 w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm focus:border-frost outline-none" />
              </label>
            </template>
            <template v-if="trip.registrationConfig.requireBirthPlace">
              <label class="block">
                <span class="text-xs text-fog">Tempat Lahir</span>
                <input v-model="p.birthPlace" required class="mt-1 w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm focus:border-frost outline-none" />
              </label>
              <label class="block">
                <span class="text-xs text-fog">Tanggal Lahir</span>
                <input v-model="p.birthDate" type="date" required class="mt-1 w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm focus:border-frost outline-none" />
              </label>
            </template>
            <template v-if="trip.registrationConfig.requireKTPPhoto">
              <label class="block md:col-span-2">
                <span class="text-xs text-fog">Foto KTP (nama file, upload real via admin nanti)</span>
                <input v-model="p.ktpPhotoUrl" placeholder="ktp-nama.jpg" class="mt-1 w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm focus:border-frost outline-none" />
              </label>
            </template>
          </div>

          <div v-if="trip.registrationConfig.requireEmergencyContact" class="mt-4 pt-4 border-t border-white/10">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs text-fog uppercase tracking-wider">Kontak Darurat (min. {{ trip.registrationConfig.minEmergencyContact }})</span>
              <button type="button" @click="addEmergencyContact(p)" class="text-xs text-frost hover:underline">+ Tambah</button>
            </div>
            <div v-for="(c, ci) in p.emergencyContacts" :key="ci" class="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
              <input v-model="c.name" placeholder="Nama" class="bg-night border border-white/15 rounded-lg px-3 py-2 text-sm focus:border-frost outline-none" />
              <input v-model="c.phone" placeholder="No. Telp" class="bg-night border border-white/15 rounded-lg px-3 py-2 text-sm focus:border-frost outline-none" />
              <input v-model="c.relation" placeholder="Hubungan (mis. Ayah)" class="bg-night border border-white/15 rounded-lg px-3 py-2 text-sm focus:border-frost outline-none" />
            </div>
          </div>
        </div>

        <button type="button" @click="addParticipant" class="text-sm text-frost hover:underline">+ Tambah Peserta Lain</button>

        <label class="block">
          <span class="text-xs text-fog">Catatan (opsional)</span>
          <textarea v-model="notes" rows="2" class="mt-1 w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm focus:border-frost outline-none"></textarea>
        </label>

        <p v-if="error" class="text-ember text-sm">{{ error }}</p>

        <button type="submit" :disabled="submitting" class="w-full md:w-auto bg-ember hover:bg-ember-dim disabled:opacity-60 text-night font-semibold px-8 py-3 rounded-full transition-colors">
          {{ submitting ? 'Mengirim…' : 'Kirim Pendaftaran' }}
        </button>
      </form>
    </div>
  </div>
</template>
