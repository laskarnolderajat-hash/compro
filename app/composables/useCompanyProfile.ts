import { doc, onSnapshot } from 'firebase/firestore'
import type { CompanyProfile } from '~/types/models'

const emptyProfile: CompanyProfile = {
  companyName: '',
  tagline: '',
  about: '',
  vision: '',
  mission: [],
  contact: { phone: '', email: '', whatsapp: '', address: '' },
  gallery: [],
  updatedAt: '',
}

const profile = ref<CompanyProfile>({ ...emptyProfile })
const loading = ref(true)
let subscribed = false

function subscribe() {
  if (subscribed || import.meta.server) return
  const db = useFirestore()
  if (!db) return
  subscribed = true
  onSnapshot(
    doc(db, 'settings', 'companyProfile'),
    (snap) => {
      if (snap.exists()) profile.value = { ...emptyProfile, ...(snap.data() as CompanyProfile) }
      loading.value = false
    },
    (err) => {
      console.error('[useCompanyProfile] gagal memuat profil:', err)
      loading.value = false
    },
  )
}

export function useCompanyProfile() {
  subscribe()

  async function updateProfile(patch: Partial<CompanyProfile>) {
    await adminFetch('/api/admin/profile', { method: 'PATCH', body: patch })
  }

  return { profile, loading, updateProfile }
}
