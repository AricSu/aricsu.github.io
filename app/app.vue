<script setup lang="ts">
import { en, zh_cn } from '@nuxt/ui/locale'

const localePath = useLocalePath()
const colorMode = useColorMode()
const color = computed(() => colorMode.value === 'dark' ? '#020618' : 'white')

const { locale, t } = useI18n()

useHead({
  meta: [
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { key: 'theme-color', name: 'theme-color', content: color }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' }
  ],
  htmlAttrs: {
    lang: locale.value
  }
})

useSeoMeta({
  titleTemplate: 'AskAric',
  ogImage: 'https://ui.nuxt.com/assets/templates/nuxt/saas-light.png',
  twitterImage: 'https://ui.nuxt.com/assets/templates/nuxt/saas-light.png',
  twitterCard: 'summary_large_image'
})

const routeLocale = useRoute().params.locale || 'en'
const indexCollection = routeLocale === 'zh-cn' ? 'docsZh' : 'docsEn'

const { data: navigation } = await useAsyncData('navigation', () => queryCollectionNavigation(indexCollection), {
  transform: data => data.find(item => item.path === '/docs')?.children || []
})
const { data: files } = useLazyAsyncData('search', () => queryCollectionSearchSections(indexCollection), {
  server: false
})

const links = [
  { label: t('nav.docs'), icon: 'i-lucide-book', to: localePath('/docs/1.getting-started') },
  { label: t('nav.pricing'), icon: 'i-lucide-credit-card', to: localePath('/pricing') },
  { label: t('nav.blog'), icon: 'i-lucide-pencil', to: localePath('/blog') },
  { label: t('nav.changelog'), icon: 'i-lucide-history', to: localePath('/changelog') }
]

provide('navigation', navigation)
</script>

<template>
  <UApp
    :locale="locale === 'zh-cn' ? zh_cn : en"
  >
    <NuxtLoadingIndicator />

    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>

    <ClientOnly>
      <LazyUContentSearch
        :files="
          files"
        shortcut="meta_k"
        :navigation="navigation"
        :links="links"
        :fuse="{ resultLimit: 42 }"
      />
    </ClientOnly>
  </UApp>
</template>
