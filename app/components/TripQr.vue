<script setup lang="ts">
import QRCode from 'qrcode'

const props = withDefaults(defineProps<{
  tripId: string
  /** Judul trip — dipakai untuk nama file unduhan. */
  title?: string
  size?: number
  /** Tampilan ringkas untuk disisipkan di kartu/halaman publik. */
  compact?: boolean
}>(), {
  title: '',
  size: 220,
  compact: false,
})

const url = computed(() => tripUrl(props.tripId))
const dataUrl = ref('')
const copied = ref(false)

// QR digambar ulang kalau trip atau ukurannya berubah.
watchEffect(async () => {
  if (!import.meta.client || !props.tripId) return
  try {
    dataUrl.value = await QRCode.toDataURL(url.value, {
      width: props.size,
      margin: 1,
      errorCorrectionLevel: 'M',
      // Latar putih & modul gelap — QR gelap-di-atas-gelap tidak terbaca scanner.
      color: { dark: '#0B1220', light: '#FFFFFF' },
    })
  } catch {
    dataUrl.value = ''
  }
})

function slugify(text: string) {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

const fileName = computed(() => `qr-${slugify(props.title) || props.tripId}.png`)

async function copyLink() {
  try {
    await navigator.clipboard.writeText(url.value)
    copied.value = true
    setTimeout(() => (copied.value = false), 1800)
  } catch {
    // Clipboard bisa ditolak browser (butuh HTTPS/izin) — biarkan saja,
    // link-nya tetap terlihat di bawah QR.
  }
}
</script>

<template>
  <div :class="compact ? 'flex items-center gap-3' : 'flex flex-col items-center gap-3'">
    <div class="bg-white rounded-xl p-2 shrink-0">
      <img
        v-if="dataUrl"
        :src="dataUrl"
        :alt="`QR code menuju ${title || 'halaman trip'}`"
        :width="compact ? 88 : size"
        :height="compact ? 88 : size"
        class="block"
      />
      <div v-else :style="{ width: `${compact ? 88 : size}px`, height: `${compact ? 88 : size}px` }" />
    </div>

    <div :class="compact ? 'min-w-0' : 'w-full text-center'">
      <p v-if="!compact" class="text-xs text-fog break-all mb-3">{{ url }}</p>
      <p v-else class="text-xs text-fog mb-2">Scan untuk buka halaman trip</p>

      <div class="flex gap-2" :class="compact ? '' : 'justify-center'">
        <a
          :href="dataUrl || undefined"
          :download="fileName"
          class="text-xs border border-white/20 px-3 py-1.5 rounded-full hover:border-frost/50"
          :class="{ 'pointer-events-none opacity-50': !dataUrl }"
        >Unduh PNG</a>
        <button
          type="button"
          @click="copyLink"
          class="text-xs border border-white/20 px-3 py-1.5 rounded-full hover:border-frost/50"
        >{{ copied ? 'Tersalin ✓' : 'Salin link' }}</button>
      </div>
    </div>
  </div>
</template>
