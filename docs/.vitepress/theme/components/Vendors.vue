<script setup lang="ts">
</script>

<template>
  <div class="container">
    <div class="text-content">
      <div class="title">快来 “Aric 的小红书”</div>
      <div class="tagline">扫描或点击右侧二维码，唠唠生活趣事！</div>
    </div>
    <div class="vendor-logos">
      <a href="https://www.instagram.com/aricsu36" target="_blank"><img class="logo" src="/aricsu36_qr.png" /></a>
    </div>
  </div>
</template>

<style scoped>
.container {
  margin: 0 auto;
  text-align: center!important;
  max-width: 1152px;
  display: flex;
  padding: 30px 0;
  flex-direction: column;
}

.text-content {
  margin: auto;
  max-width: 50%;
  min-width: 350px;
}

.title {
  font-family: 'Ma Shan Zheng', cursive;
  font-size: 32px;
  margin-bottom: 30px;
}

.tagline {
  font-size: 18px;
}

.vendor-logos {
  display: block;
  max-width: 50%;
  margin-left: auto;
  margin-right: auto;
}

.logo {
  padding: 1px 0;
  max-height: 36px;
}

@media (min-width: 640px) {
  .title {
    font-size: 48px;
  }
  .tagline {
    font-size: 20px;
  }
  .logo {
    padding: 3px 0;
    max-height: 40px;
  }
}

@media (min-width: 960px) {
  .container {
    flex-direction: row;
  }
  .title {
    font-size: 56px;
  }
  .tagline {
    font-size: 24px;
  }
  .logo {
    padding: 5px 0;
    max-height: 1000px;
  }
  .logo.anna {
    height: 50px;
    max-width: 2000px;
  }
}
</style>
