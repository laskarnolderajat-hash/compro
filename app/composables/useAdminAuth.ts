import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth'

// Admin = user Firebase Auth dengan custom claim `admin: true`
// (di-set oleh scripts/seed.ts, atau manual lewat Admin SDK).
const ADMIN_EMAIL = 'admin@laskarnolderajat.id'

const isLoggedIn = ref(false)
// false selama onAuthStateChanged belum melapor — dipakai layout admin supaya
// tidak keburu redirect ke /admin saat sesi sebenarnya masih valid.
const authReady = ref(false)
let subscribed = false

export function useAdminAuth() {
  async function login(email: string, password: string) {
    const auth = useFirebaseAuth()
    if (!auth) return false
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password)
      const { claims } = await cred.user.getIdTokenResult()
      if (claims.admin !== true) {
        await signOut(auth)
        isLoggedIn.value = false
        return false
      }
      isLoggedIn.value = true
      return true
    } catch {
      return false
    }
  }

  async function logout() {
    const auth = useFirebaseAuth()
    if (auth) await signOut(auth)
    isLoggedIn.value = false
  }

  function checkSession() {
    const auth = useFirebaseAuth()
    if (!auth || subscribed) return
    subscribed = true
    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        isLoggedIn.value = false
      } else {
        const { claims } = await user.getIdTokenResult()
        isLoggedIn.value = claims.admin === true
      }
      authReady.value = true
    })
  }

  async function getIdToken() {
    return (await useFirebaseAuth()?.currentUser?.getIdToken()) ?? null
  }

  return { isLoggedIn, authReady, login, logout, checkSession, getIdToken, ADMIN_EMAIL }
}
