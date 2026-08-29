import type { DocumentSnapshot, QuerySnapshot } from 'firebase-admin/firestore'

export function mapDoc<T>(snap: DocumentSnapshot): T {
  return { id: snap.id, ...(snap.data() as object) } as T
}

export function mapDocs<T>(snap: QuerySnapshot): T[] {
  return snap.docs.map(d => mapDoc<T>(d))
}
