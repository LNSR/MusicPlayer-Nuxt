// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  css: [
    '~/assets/css/style.css',
  ],
  devtools: { enabled: true },

  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@nuxt/image',
    '@nuxt/icon',
    '@nuxt/fonts',
    '@prisma/nuxt',
    '@sidebase/nuxt-auth',
  ]
})