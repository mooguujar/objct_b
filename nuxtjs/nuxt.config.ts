// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false }, // 完全禁用 devtools（生产环境不需要）
  
  // SSR 配置，减少水合不匹配
  ssr: true,
  
  modules: [
    '@element-plus/nuxt',
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss'
  ],

  // CSS 会在组件中自动引入，或者在 app.vue 中引入
  // css: ['~/assets/styles/main.css'],

  // Vite 配置，允许隧道域名访问
  vite: {
    server: {
      hmr: process.env.NUXT_PUBLIC_HMR_PORT ? {
        clientPort: parseInt(process.env.NUXT_PUBLIC_HMR_PORT),
        protocol: process.env.NUXT_PUBLIC_HMR_PROTOCOL || 'ws',
        host: process.env.NUXT_PUBLIC_HMR_HOST || 'localhost'
      } : undefined,
      // 允许隧道域名（ngrok、Cloudflare Tunnel 等）
      allowedHosts: [
        '.ngrok-free.app',
        '.ngrok-free.dev',
        '.ngrok.io',
        '.ngrok.app',
        '.trycloudflare.com',
        'localhost'
      ]
    }
  },


  // 开发服务器配置
  devServer: {
    host: '0.0.0.0',
    port: 3000
  },

  runtimeConfig: {
    // 服务端私有配置（可通过环境变量覆盖）
    // Nuxt 3 会自动读取 .env 文件中的环境变量
    jwtSecret: process.env.JWT_SECRET || '',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    dbHost: process.env.DB_HOST || '',
    dbPort: process.env.DB_PORT || '',
    dbUser: process.env.DB_USER || '',
    dbPassword: process.env.DB_PASSWORD || '',
    databaseUrl: process.env.DATABASE_URL || '',
    ossBucket: process.env.OSS_BUCKET || '',
    ossEndpoint: process.env.OSS_ENDPOINT || '',
    ossRegion: process.env.OSS_REGION || '',
    ossAccessKeyId: process.env.OSS_ACCESS_KEY || process.env.OSS_ACCESS_KEY || '',
    ossAccessKeySecret: process.env.OSS_ACCESS_SECRET || process.env.OSS_ACCESS_SECRET || '',
    
    // 客户端公开配置
    public: {
      apiBase: '/api'
    }
  },

})
