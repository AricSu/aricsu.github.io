<script setup lang="ts">
import type { NuxtError } from '#app'
import { useLocalePath } from '#imports'
import { useI18n } from 'vue-i18n'

defineProps({
  error: {
    type: Object as PropType<NuxtError>,
    required: true
  }
})

useHead({
  htmlAttrs: {
    lang: 'en'
  }
})

useSeoMeta({
  title: 'Page not found',
  description: 'We are sorry but this page could not be found.'
})

const localePath = useLocalePath()
const { locale } = useI18n()
const docsCollection = locale.value === 'zh-cn' ? 'docsZh' : 'docsEn'
const docsPath = localePath('/docs')
const { data: navigation } = await useAsyncData('navigation', () => queryCollectionNavigation(docsCollection), {
  transform: data => data.find(item => item.path === docsPath)?.children || []
})
const { data: files } = useLazyAsyncData('search', () => queryCollectionSearchSections(docsCollection), {
  server: false
})

const links = [
  {
    label: 'Docs',
    icon: 'i-lucide-book',
    to: localePath('/docs/getting-started')
  },
  {
    label: 'Pricing',
    icon: 'i-lucide-credit-card',
    to: localePath('/pricing')
  },
  {
    label: 'Blog',
    icon: 'i-lucide-pencil',
    to: localePath('/blog')
  }
]
</script>

<template>
  <div>
    <AppHeader />

    <UMain>
      <UContainer>
        <UPage>
          <UError :error="error" />
        </UPage>
      </UContainer>
    </UMain>

    <AppFooter />

    <ClientOnly>
      <LazyUContentSearch
        :files="files"
        shortcut="meta_k"
        :navigation="navigation"
        :links="links"
        :fuse="{ resultLimit: 42 }"
      />
    </ClientOnly>

    <UToaster />
  </div>
</template>
