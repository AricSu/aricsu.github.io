<script setup lang="ts">
</script>

<template>
  <div class="media-logos">
    <!-- tidb community CN -->
    <a href="https://asktug.com/u/aric/summary" target="_blank"><img class="logo"
        src="/tidb-community-logo.png"  style="height: 36px; margin-top: 40px;"/></a>
    <!-- 萌宠店 -->
    <a href="https://tknixodl2xm7gz3wo19hhihfe3f92f4.taobao.com/" target="_blank"><img class="logo"
        src="/logo.png" style="height: 36px; margin-top: 40px;" /></a>
  </div>
</template>

<style scoped>
.container {
  margin: 0 auto;
  text-align: center!important;
  max-width: 1152px;
}

.title {
  font-family: 'ZCOOL KuaiLe', cursive;
  font-size: 32px;
  margin-bottom: 30px;
}

.media-logos {
  margin-bottom: -150px;
  max-height: 120px;
  display: flex;
  flex-direction: row;
  justify-content: center;
}

.logo {
  margin-left: 10px;
  margin-right: 10px;
}

@media (min-width: 256px) {
  .media-logos {
    margin-bottom: -120px;
  }
}
</style>
