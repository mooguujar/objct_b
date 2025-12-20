// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    '@element-plus/nuxt',
    '@pinia/nuxt',
  ],
  css: ['~/assets/styles/main.scss'],
  runtimeConfig: {
    public: {
      apiBase: process.env.API_BASE_URL || 'http://localhost:3000/api/v1',
    },
  },
  ssr: true,
  compatibilityDate: '2024-01-01',
})

