<script setup lang="ts">
const columns = [{
  label: 'Resources',
  children: [{
    label: 'Aric\'s Blog',
    to: '/blog',
    target: '_blank'
  }, {
    label: 'TiHC Docs',
    to: '/docs',
    target: '_blank'
  }, {
    label: 'Changelog',
    to: '/changelog',
    target: '_blank'
  }]
}, {
  label: 'Personal Info',
  children: [{
    label: 'Github',
    to: 'https://github.com/AricSu',
    target: '_blank'
  }, {
    label: 'Bilibili',
    to: 'https://space.bilibili.com/318184941',
    target: '_blank'
  }, {
    label: 'Youtube',
    to: 'https://www.youtube.com/@askaric',
    target: '_blank'
  }, {
    label: 'Instagram',
    to: 'https://www.instagram.com/aricsu36/',
    target: '_blank'
  }]
}, {
  label: 'Shop',
  children: [{
    label: 'Aric\'s Shop',
    to: 'https://shop.askaric.com/',
    target: '_blank'
  }, {
    label: 'About Shop',
    to: 'https://shop.askaric.com/pages/test',
    target: '_blank'
  }]
}]

const toast = useToast()

const email = ref('')
const loading = ref(false)

function onSubmit() {
  loading.value = true

  toast.add({
    title: 'Subscribed!',
    description: 'You\'ve been subscribed to our newsletter.'
  })
}
</script>

<template>
  <UFooter
    :ui="{ top: 'border-b border-default' }"
    class="bg-black text-white"
  >
    <template #top>
      <UContainer>
        <UFooterColumns :columns="columns">
          <template #right>
            <form @submit.prevent="onSubmit">
              <UFormField
                name="email"
                label="Subscribe to our newsletter"
                size="lg"
              >
                <UInput
                  v-model="email"
                  type="email"
                  class="w-full"
                  placeholder="Enter your email"
                >
                  <template #trailing>
                    <UButton
                      type="submit"
                      size="xs"
                      color="neutral"
                      label="Subscribe"
                    />
                  </template>
                </UInput>
              </UFormField>
            </form>
          </template>
        </UFooterColumns>
      </UContainer>
    </template>

    <template #left>
      <p class="text-muted text-sm">
        Powered By AricSu • © {{ new Date().getFullYear() }}
      </p>
    </template>

    <template #right>
      <UButton
        to="https://www.youtube.com/@askaric"
        target="_blank"
        icon="i-simple-icons-youtube"
        aria-label="Youtube"
        color="neutral"
        variant="ghost"
      />
      <UButton
        to="https://space.bilibili.com/318184941"
        target="_blank"
        icon="i-simple-icons-bilibili"
        aria-label="Bilibili"
        color="neutral"
        variant="ghost"
      />
      <UButton
        to="https://www.instagram.com/aricsu36/"
        target="_blank"
        icon="i-simple-icons-instagram"
        aria-label="Instagram"
        color="neutral"
        variant="ghost"
      />
      <UButton
        to="https://www.xiaohongshu.com/user/profile/5bcff8128f5d1e0001d6f9ce"
        target="_blank"
        icon="i-simple-icons-xiaohongshu"
        aria-label="Xiaohongshu"
        color="neutral"
        variant="ghost"
      />
      <UButton
        to="https://github.com/AricSu"
        target="_blank"
        icon="i-simple-icons-github"
        aria-label="GitHub"
        color="neutral"
        variant="ghost"
      />
    </template>
  </UFooter>
</template>
