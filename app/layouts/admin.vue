<script setup lang="ts">
const { isLoggedIn, authReady, logout, checkSession } = useAdminAuth()
const router = useRouter()
const route = useRoute()

onMounted(() => {
  checkSession()
})

// Tunggu authReady dulu — kalau tidak, sesi yang masih valid ikut ter-redirect.
watchEffect(() => {
  if (authReady.value && !isLoggedIn.value && route.path !== '/admin') {
    router.replace('/admin')
  }
})

const navItems = [
  { label: 'Dashboard', to: '/admin/dashboard', icon: '◆' },
  { label: 'Kelola Trip', to: '/admin/trips', icon: '▲' },
  { label: 'Kelola Post', to: '/admin/posts', icon: '✎' },
  { label: 'Sosial Media', to: '/admin/social', icon: '◐' },
  { label: 'Pendaftar', to: '/admin/bookings', icon: '●' },
  { label: 'Member', to: '/admin/members', icon: '◈' },
  { label: 'Profil Perusahaan', to: '/admin/profile', icon: '■' },
]

async function handleLogout() {
  await logout()
  router.push('/admin')
}
</script>

<template>
  <div v-if="route.path === '/admin'" class="min-h-screen bg-night text-paper">
    <slot />
  </div>
  <div v-else class="min-h-screen bg-night text-paper flex flex-col md:flex-row">
    <aside class="md:w-60 shrink-0 border-b md:border-b-0 md:border-r border-white/10 p-4 md:p-6">
      <NuxtLink to="/" class="font-display text-lg uppercase text-frost block mb-6">0° Admin</NuxtLink>
      <nav class="flex md:flex-col gap-1 overflow-x-auto">
        <NuxtLink
          v-for="item in navItems" :key="item.to" :to="item.to"
          class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap"
          :class="route.path === item.to ? 'bg-frost/15 text-frost' : 'text-paper/70 hover:bg-white/5'"
        >
          <span class="font-mono text-xs">{{ item.icon }}</span>{{ item.label }}
        </NuxtLink>
      </nav>
      <button @click="handleLogout" class="mt-6 text-xs text-fog hover:text-ember hidden md:block">Keluar</button>
    </aside>
    <main class="flex-1 p-5 md:p-8 max-w-5xl">
      <slot />
    </main>
  </div>
</template>
