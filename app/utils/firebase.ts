import type { FirebaseServices } from '~/plugins/firebase.client'

// Plugin-nya client-only, jadi di SSR semua helper ini mengembalikan null.
// Composable memakai pola: `const db = useFirestore(); if (!db) return`.

export function useFirebase(): FirebaseServices | null {
  if (import.meta.server) return null
  return (useNuxtApp().$firebase as FirebaseServices | undefined) ?? null
}

export function useFirestore() {
  return useFirebase()?.db ?? null
}

export function useFirebaseAuth() {
  return useFirebase()?.auth ?? null
}
