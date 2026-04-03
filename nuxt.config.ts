// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  
  // 明确启用 SSR 模式
  ssr: true,
  
  // 强制禁用客户端路由
  app: {
    head: {
      script: [
        {
          async: true,
          src: 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6686541399117634',
          crossorigin: 'anonymous'
        }
      ],
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      htmlAttrs: {
        lang: 'en'
      },
      meta: [
        { name: 'robots', content: 'index, follow' },
        { name: 'author', content: 'BLRSSCO' },
        { name: 'theme-color', content: '#667eea' },
        { property: 'og:site_name', content: 'BLRSSCO' },
        { property: 'og:locale', content: 'en_US' },
        { name: 'twitter:site', content: '@blrssco' },
        { name: 'twitter:creator', content: '@blrssco' }
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/icon.png' },
        { rel: 'apple-touch-icon', href: '/icon.png' },
        { rel: 'shortcut icon', href: '/icon.png' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://pagead2.googlesyndication.com' },
        { rel: 'dns-prefetch', href: 'https://games.blrssco.com' },
        { rel: 'preload', href: '/loading2.gif', as: 'image', type: 'image/gif' }
      ]
    }
  },
  
  // 禁用客户端路由
  router: {
    options: {
      hashMode: false
    }
  },
  
  nitro: {
    preset: 'cloudflare-pages',
    experimental: {
      wasm: true
    },
    // 确保 SSR 路由规则
    routeRules: {
      // 游戏页面使用 SSR
      '/games/**': { 
        ssr: true,
        headers: {
          'X-Frame-Options': 'ALLOWALL'
        }
      },
      // 分类页面使用 SSR
      '/category/**': { ssr: true },
      // 详情页面使用 SSR
      '/detail/**': { ssr: true }
    }
  },
  
  // 环境变量配置
  runtimeConfig: {
    // 服务端私有配置
    secretKey: process.env.NUXT_SECRET_KEY || '32RtmWrLtzlfEa163tKKFgCYY2Mi9rldzgRiR7qZQ8ZTDCvfI8HUBeCTPviqF8m8TyI5HRyphkhESdmp5fek5sVcYr35gATljh2wtyWoHGqhc8aD4vcJw019GEjzyVMI',
    
    // 公开配置（会暴露给客户端）
    public: {
      supabaseUrl: process.env.SUPABASE_URL || 'https://hsduzwtocjaqxwtlpkpd.supabase.co',
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzZHV6d3RvY2phcXh3dGxwa3BkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwNTI3MzQsImV4cCI6MjA2MDYyODczNH0.-z3VfIYbAJIZpKoFeREXUwZmJZkj-PQ0RV8x58vkkuc',
    }
  },
  
  // CSS 框架 (准备添加 Tailwind CSS)
  css: ['~/assets/css/main.css'],
  
  // 模块配置
  modules: [
    '@nuxthub/core',
    '@nuxthq/studio',
    '@nuxtjs/tailwindcss'
  ]
})
