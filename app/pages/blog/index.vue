<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const route = useRoute()

const { locale } = useI18n()
console.log('Locale:', locale.value)

const blogCollection = locale.value === 'zh-cn' ? 'blogZh' : 'blogEn'
const postsCollection = locale.value === 'zh-cn' ? 'postsZh' : 'postsEn'

const { data: page } = await useAsyncData('blog', () => queryCollection(blogCollection).first())
const { data: posts } = await useAsyncData(route.path, () => queryCollection(postsCollection).all())

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
      <UBlogPosts>
        <UBlogPost
          v-for="(post, index) in posts"
          :key="index"
          :to="post.path"
          :title="post.title"
          :description="post.description"
          :image="post.image"
          :date="new Date(post.date).toLocaleDateString('en', { year: 'numeric', month: 'short', day: 'numeric' })"
          :authors="post.authors"
          :badge="post.badge"
          :orientation="index === 0 ? 'horizontal' : 'vertical'"
          :class="[index === 0 && 'col-span-full']"
          variant="naked"
          :ui="{
            description: 'line-clamp-2'
          }"
        />
      </UBlogPosts>
    </UPageBody>
  </UContainer>
</template>
