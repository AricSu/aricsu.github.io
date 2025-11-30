<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

const localeOptions = [
  { label: 'English', value: 'en' },
  { label: '简体中文', value: 'zh-cn' }
]

const route = useRoute()
const router = useRouter()
const { t, locale, setLocale } = useI18n()
const localePath = useLocalePath()
const currentLocale = ref(locale.value)

watch(currentLocale, (val) => {
  if (locale.value !== val) {
    setLocale(val)
    const path = route.fullPath.replace(/^\/(en|zh-cn)/, '')
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur()
    }
    router.push(localePath(path))
  }
})

const items = computed(() => [
  {
    label: t('nav.docs'),
    to: localePath('/docs'),
    active: route.path.startsWith('/docs')
  },
  // {
  //   label: t('nav.pricing'),
  //   to: localePath('/pricing')
  // },
  {
    label: t('nav.blog'),
    to: localePath('/blog')
  },
  {
    label: t('nav.changelog'),
    to: localePath('/changelog')
  }
])
</script>

<template>
  <UHeader class="bg-black text-white  border-none">
    <template #left>
      <NuxtLink to="/">
        <AppLogo class="w-auto h-6 shrink-0" />
      </NuxtLink>
      <!-- <TemplateMenu /> -->
    </template>

    <UNavigationMenu
      :items="items"
      variant="link"
    />

    <template #right>
      <!-- <UColorModeButton /> -->

      <USelect
        v-model="currentLocale"
        icon="i-lucide-globe"
        color="neutral"
        variant="outline"
        :items="localeOptions"
      />
      <!--
      <UButton
        icon="i-lucide-log-in"
        color="neutral"
        variant="ghost"
        :to="localePath('/login')"
        class="lg:hidden"
      />

      <UButton
        label="Sign in"
        color="neutral"
        variant="outline"
        :to="localePath('/login')"
        class="hidden lg:inline-flex"
      />

      <UButton
        label="Sign up"
        color="neutral"
        trailing-icon="i-lucide-arrow-right"
        class="hidden lg:inline-flex"
        :to="localePath('/signup')"
      /> -->
    </template>

    <template #body>
      <!-- <UNavigationMenu
        :items="items"
        orientation="vertical"
        class="-mx-2.5"
      />

      <USeparator class="my-6" />

      <UButton
        label="Sign in"
        color="neutral"
        variant="subtle"
        :to="localePath('/login')"
        block
        class="mb-3"
      />
      <UButton
        label="Sign up"
        color="neutral"
        :to="localePath('/signup')"
        block
      /> -->
    </template>
  </UHeader>
</template>
