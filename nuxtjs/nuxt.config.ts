// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  
  modules: [
    '@element-plus/nuxt',
    '@pinia/nuxt'
  ],

  css: ['~/assets/styles/main.css'],

  runtimeConfig: {
    // 服务端私有配置（可通过环境变量覆盖）
    jwtSecret: '',
    jwtExpiresIn: '',
    dbHost: '',
    dbPort: '',
    dbUser: '',
    dbPassword: '',
    databaseUrl: '',
    ossBucket: '',
    ossEndpoint: '',
    ossRegion: '',
    ossAccessKeyId: '',
    ossAccessKeySecret: '',
    
    // 客户端公开配置
    public: {
      apiBase: '/api'
    }
  }
})
