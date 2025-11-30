<script setup lang="ts">
import { en, zh_cn } from '@nuxt/ui/locale'

import type { ContentNavigationItem } from '@nuxt/content'

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

const routeLocale = computed(() => useRoute().params.locale || locale.value || 'en')
const indexCollection = computed(() => routeLocale.value === 'zh-cn' ? 'docsZh' : 'docsEn')
const navigation = ref<ContentNavigationItem[]>([])
async function loadNavigation() {
  const raw = await queryCollectionNavigation(indexCollection.value)
  const rootPath = routeLocale.value === 'zh-cn' ? '/zh-cn' : '/en'
  const root = raw.find(item => item.path === rootPath)
  const docsPath = `${rootPath}/docs`
  const docsNode = root?.children?.find(item => item.path === docsPath)
  const filtered = docsNode?.children || []
  navigation.value = filtered
}
watch([locale, routeLocale], loadNavigation, { immediate: true })
const { data: files } = useLazyAsyncData(
  () => `search-${routeLocale.value}`,
  () => queryCollectionSearchSections(indexCollection.value),
  {
    server: false,
    watch: [routeLocale]
  }
)

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
        :color-mode="false"
      />
    </ClientOnly>
  </UApp>
</template>
