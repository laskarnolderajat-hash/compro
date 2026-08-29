// Model bersama — dipakai composable (client), server routes (Nitro), dan seed script.
// Struktur mengikuti dokumen Firestore apa adanya: field `id` = doc id.

export interface RegistrationConfig {
  requireKTP: boolean
  requireBirthPlace: boolean
  requireEmergencyContact: boolean
  minEmergencyContact: number
  requireKTPPhoto: boolean
}

export interface ItineraryDay {
  day: number
  title: string
  activities: string[]
}

export interface Trip {
  id: string
  title: string
  mountain: string
  location: string
  elevation: number // mdpl
  description: string
  itinerary: ItineraryDay[]
  include: string[]
  exclude: string[]
  requirements: string[]
  price: number
  quota: number
  slotsTaken: number
  dateStart: string
  dateEnd: string
  status: 'open' | 'closed' | 'full'
  images: string[]
  difficulty: 'Pemula' | 'Menengah' | 'Berpengalaman'
  registrationConfig: RegistrationConfig
  createdAt: string
}

export interface Member {
  id: string
  name: string
  phone: string
  email?: string
  createdAt: string
}

export interface EmergencyContact {
  name: string
  phone: string
  relation: string
}

export interface Participant {
  name: string
  domicileAddress: string
  hasPreExistingCondition: boolean
  preExistingConditionNote?: string
  phone: string
  email: string
  ktpNumber?: string
  birthPlace?: string
  birthDate?: string
  emergencyContacts?: EmergencyContact[]
  ktpPhotoUrl?: string
}

export interface Booking {
  id: string
  tripId: string
  memberId: string
  participants: Participant[]
  status: 'pending' | 'confirmed' | 'waitlist' | 'cancelled'
  notes?: string
  createdAt: string
}

export interface CompanyProfile {
  companyName: string
  tagline: string
  about: string
  vision: string
  mission: string[]
  contact: {
    phone: string
    email: string
    whatsapp: string
    address: string
    instagram?: string
  }
  gallery: string[]
  updatedAt: string
}

export interface Post {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  coverImage?: string
  author: string
  status: 'draft' | 'published'
  createdAt: string
  updatedAt: string
}
