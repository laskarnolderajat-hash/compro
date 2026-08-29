import { collection, onSnapshot, query, orderBy, where, type Unsubscribe } from 'firebase/firestore'
import type { Post } from '~/types/models'

const posts = ref<Post[]>([])
const loading = ref(true)
let unsubscribe: Unsubscribe | null = null
let mode: 'public' | 'admin' | null = null

// Firestore menolak query yang lebih luas dari rules-nya: pengunjung biasa
// hanya boleh membaca post published, admin boleh semuanya (termasuk draft).
function subscribe(asAdmin: boolean) {
  if (import.meta.server) return
  const next = asAdmin ? 'admin' : 'public'
  if (mode === next) return
  const db = useFirestore()
  if (!db) return

  unsubscribe?.()
  mode = next
  loading.value = true

  const base = collection(db, 'posts')
  const q = asAdmin
    ? query(base, orderBy('createdAt', 'desc'))
    : query(base, where('status', '==', 'published'), orderBy('createdAt', 'desc'))

  unsubscribe = onSnapshot(
    q,
    (snap) => {
      posts.value = snap.docs.map(d => ({ id: d.id, ...d.data() }) as Post)
      loading.value = false
    },
    (err) => {
      console.error('[usePosts] gagal memuat posts:', err)
      loading.value = false
    },
  )
}

export function usePosts() {
  const { isLoggedIn } = useAdminAuth()

  if (import.meta.client) {
    subscribe(isLoggedIn.value)
    watch(isLoggedIn, v => subscribe(v))
  }

  const publishedPosts = computed(() => posts.value.filter(p => p.status === 'published'))

  function getPostById(id: string) {
    return posts.value.find(p => p.id === id)
  }
  function getPostBySlug(slug: string) {
    return posts.value.find(p => p.slug === slug)
  }
  async function createPost(post: Post) {
    return await adminFetch<Post>('/api/admin/posts', { method: 'POST', body: post })
  }
  async function updatePost(id: string, patch: Partial<Post>) {
    await adminFetch(`/api/admin/posts/${id}`, { method: 'PATCH', body: patch })
  }
  async function deletePost(id: string) {
    await adminFetch(`/api/admin/posts/${id}`, { method: 'DELETE' })
  }
  function slugify(title: string) {
    return title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  }

  return { posts, loading, publishedPosts, getPostById, getPostBySlug, createPost, updatePost, deletePost, slugify }
}
