<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const route = useRoute()

const { locale } = useI18n()
const indexCollection = locale.value === 'zh-cn' ? 'indexZh' : 'indexEn'
const { data: page } = await useAsyncData('changelog', () => queryCollection(indexCollection).first())
const versionsCollection = locale.value === 'zh-cn' ? 'versionsZh' : 'versionsEn'
const { data: versions } = await useAsyncData(route.path, () => queryCollection(versionsCollection).order('date', 'DESC').all())

const title = page.value?.seo?.title || page.value?.title
const description = page.value?.seo?.description || page.value?.description

useSeoMeta({
  title,
  ogTitle: title,
  description,
  ogDescription: description
})

// defineOgImageComponent('Saas')
</script>

<template>
  <UContainer>
    <UPageHeader
      v-bind="page"
      class="py-[50px]"
    />

    <UPageBody>
      <UChangelogVersions>
        <UChangelogVersion
          v-for="(version, index) in versions"
          :key="index"
          v-bind="version"
        >
          <template #body>
            <ContentRenderer :value="version.body" />
          </template>
        </UChangelogVersion>
      </UChangelogVersions>
    </UPageBody>
  </UContainer>
</template>
