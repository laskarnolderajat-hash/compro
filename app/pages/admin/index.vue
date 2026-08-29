<script setup lang="ts">
definePageMeta({ layout: 'admin' })
const { login, isLoggedIn, authReady, checkSession, ADMIN_EMAIL } = useAdminAuth()
const router = useRouter()

onMounted(() => {
  checkSession()
})

// Sesi Firebase baru diketahui setelah onAuthStateChanged melapor.
watchEffect(() => {
  if (authReady.value && isLoggedIn.value) router.replace('/admin/dashboard')
})

const email = ref('')
const password = ref('')
const error = ref('')

const submitting = ref(false)

async function handleSubmit() {
  submitting.value = true
  error.value = ''
  try {
    if (await login(email.value, password.value)) {
      router.push('/admin/dashboard')
    } else {
      error.value = 'Email atau password salah, atau akun ini bukan admin.'
    }
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center px-5">
    <div class="w-full max-w-sm">
      <div class="text-center mb-8">
        <div class="font-display text-3xl text-frost">0°</div>
        <h1 class="font-display text-2xl uppercase mt-1">Admin Laskar Nol Derajat</h1>
      </div>
      <form @submit.prevent="handleSubmit" class="bg-pine border border-white/10 rounded-2xl p-6 space-y-4">
        <label class="block">
          <span class="text-xs text-fog">Email</span>
          <input v-model="email" type="email" class="mt-1 w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm focus:border-frost outline-none" />
        </label>
        <label class="block">
          <span class="text-xs text-fog">Password</span>
          <input v-model="password" type="password" class="mt-1 w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm focus:border-frost outline-none" />
        </label>
        <p v-if="error" class="text-ember text-sm">{{ error }}</p>
        <button type="submit" :disabled="submitting" class="w-full bg-ember hover:bg-ember-dim disabled:opacity-60 text-night font-semibold py-2.5 rounded-lg">
          {{ submitting ? 'Memproses…' : 'Masuk' }}
        </button>
        <p class="text-xs text-fog text-center pt-2">Akun admin: {{ ADMIN_EMAIL }}</p>
      </form>
    </div>
  </div>
</template>
