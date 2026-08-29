import { collection, onSnapshot, query, orderBy } from 'firebase/firestore'
import type { SocialPost } from '~/types/models'

const posts = ref<SocialPost[]>([])
const loading = ref(true)
let subscribed = false

function subscribe() {
  if (subscribed || import.meta.server) return
  const db = useFirestore()
  if (!db) return
  subscribed = true
  onSnapshot(
    query(collection(db, 'socialPosts'), orderBy('order', 'desc')),
    (snap) => {
      posts.value = snap.docs.map(d => ({ id: d.id, ...d.data() }) as SocialPost)
      loading.value = false
    },
    (err) => {
      console.error('[useSocialPosts] gagal memuat postingan:', err)
      loading.value = false
    },
  )
}

export function useSocialPosts() {
  subscribe()

  const featuredPosts = computed(() => posts.value.filter(p => p.featured))

  function postsForTrip(tripId: string) {
    return posts.value.filter(p => p.tripId === tripId)
  }
  function byPlatform(platform: SocialPost['platform'] | 'all') {
    return platform === 'all' ? posts.value : posts.value.filter(p => p.platform === platform)
  }

  async function createSocialPost(body: Partial<SocialPost> & { url: string }) {
    return await adminFetch<SocialPost>('/api/admin/social', { method: 'POST', body })
  }
  async function updateSocialPost(id: string, patch: Partial<SocialPost>) {
    await adminFetch(`/api/admin/social/${id}`, { method: 'PATCH', body: patch })
  }
  async function deleteSocialPost(id: string) {
    await adminFetch(`/api/admin/social/${id}`, { method: 'DELETE' })
  }

  const platformLabel: Record<SocialPost['platform'], string> = {
    instagram: 'Instagram',
    tiktok: 'TikTok',
  }

  return {
    posts, loading, featuredPosts,
    postsForTrip, byPlatform, platformLabel,
    createSocialPost, updateSocialPost, deleteSocialPost,
  }
}
