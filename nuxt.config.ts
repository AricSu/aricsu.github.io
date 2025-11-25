// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxt/ui',
    '@nuxt/content',
    '@vueuse/nuxt',
    'nuxt-og-image',
    '@nuxtjs/i18n',
    '@nuxtjs/seo'
  ],

  ssr: false,

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  routeRules: {
    '/en/docs': { redirect: '/en/docs/getting-started', prerender: false },
    '/zh-cn/docs': { redirect: '/zh-cn/docs/getting-started', prerender: false }
  },
  compatibilityDate: '2024-07-11',
  nitro: {
    prerender: {
      routes: [
        '/'
      ],
      crawlLinks: true
    }
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },

  i18n: {
    locales: [
      {
        code: 'zh-cn',
        iso: 'zh-CN',
        name: '简体中文',
        file: 'zh-cn.json'
      },
      {
        code: 'en',
        iso: 'en-US',
        name: 'English',
        file: 'en.json'
      }
    ],
    defaultLocale: 'en',
    strategy: 'prefix',
    langDir: 'locales/'
  }
})
