import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  vite: {
    plugins: [tailwindcss()],
  },
  runtimeConfig: {
    // Private — server only. Isi dengan JSON service account (satu baris) di .env.
    // Kalau kosong, admin SDK jatuh ke GOOGLE_APPLICATION_CREDENTIALS / ADC.
    firebaseServiceAccount: '',
    public: {
      useFirebaseEmulator: false,
      firebase: {
        apiKey: '',
        authDomain: '',
        projectId: '',
        storageBucket: '',
        messagingSenderId: '',
        appId: '',
        measurementId: '',
      },
    },
  },
  app: {
    head: {
      title: 'Laskar Nol Derajat',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'description', content: 'Open trip pendakian gunung — Laskar Nol Derajat' },
      ],
    },
  },
})
