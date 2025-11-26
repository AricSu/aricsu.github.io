<template>
  <!-- 完整复刻原始 NAGARA home 区域 - 使用 Tailwind CSS + GSAP -->
  <section
    id="home"
    data-theme="inherit"
    class="relative min-h-screen bg-black text-white overflow-hidden font-inter"
  >
    <div class="hero_contain px-10 pt-20 pb-10 relative h-screen lg:px-10 md:px-5 sm:px-4">
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Roboto+Mono:wght@400;700&display=swap"
      >
      <!-- 主标题 -->
      <div class="absolute left-0 bottom-30 z-20 px-[2vw] pb-[2vw] select-none pointer-events-none">
        <h1
          class="nagara-hero-title font-normal text-white uppercase m-0 p-0"
          style="font-family: 'Playfair Display', serif; font-size: clamp(6rem,13vw,12rem); line-height: 0.85; letter-spacing: -0.04em; font-weight: 400; text-shadow: 0 2px 8px rgba(0,0,0,0.12); opacity:0; filter:blur(20px); transform:translateY(80px);"
        >
          &nbsp;&nbsp;WHO THE<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;HELL AM I?
        </h1>
      </div>
      <div class="absolute right-0 bottom-0 z-20 px-[2vw] pb-[2vw] text-right select-none pointer-events-none">
        <div
          class="nagara-hero-sub"
          style="font-family: 'Roboto Mono', 'Menlo', 'Monaco', 'Consolas', monospace; font-size: 1rem; letter-spacing: 0.25em; color: rgba(255,255,255,0.85); text-transform: uppercase; line-height: 1.4; font-weight: 400; text-shadow: 0 2px 8px rgba(0,0,0,0.12); opacity:0; filter:blur(20px); transform:translateY(60px);"
        >
          TIMELESS DESIGN,<br>RICH HERITAGE.
        </div>
      </div>
      <div class="hero_img absolute inset-y-0 right-0 w-[45vh] h-full mr-[8vw] z-10 py-30 sm:left-1/2 sm:translate-x-[-50%] sm:right-auto sm:mr-0 md:right-0 md:translate-x-0 md:left-auto md:mr-[8vw]">
        <img
          src="/hero.jpg"
          loading="eager"
          alt="Nagara Watch"
          class="hero-img-el w-full h-full object-cover object-center"
          style="opacity:0; filter:blur(20px); transform:translateY(60px);"
        >
        <div
          class="img-mask pointer-events-none absolute inset-0 bg-black"
          style="opacity:1;"
        />
      </div>
    </div>
  </section>
</template>

<script setup>
import { onMounted, nextTick } from 'vue'

onMounted(async () => {
  await nextTick()
  // 统一调节动画速度（秒）
  const animationDuration = 3.2
  // 所有延迟、同步、stagger 也用该变量派生
  const syncDelay = animationDuration * 0.09
  if (window.gsap) {
    // 入场动画
    const tl = window.gsap.timeline()
    tl.fromTo(
      '.nagara-hero-title',
      { y: 80, opacity: 0, filter: 'blur(20px)' },
      { y: 0, opacity: 1, filter: 'blur(0px)', duration: animationDuration, ease: 'expo.out' }
    )
    tl.fromTo(
      '.nagara-hero-sub',
      { y: 60, opacity: 0, filter: 'blur(20px)' },
      { y: 0, opacity: 1, filter: 'blur(0px)', duration: animationDuration, ease: 'expo.out' },
      `<+${syncDelay}`
    )
    tl.fromTo(
      '.hero-img-el',
      { y: 60, opacity: 0, filter: 'blur(20px)' },
      { y: 0, opacity: 1, filter: 'blur(0px)', duration: animationDuration, ease: 'expo.out' },
      `<+${syncDelay}`
    )
    // 遮罩渐隐与内容淡入完全同步
    tl.to('.img-mask', { opacity: 0, duration: animationDuration, ease: 'expo.out' }, '<')
    // 入场动画结束后再启用滚动动画
    tl.call(() => {
      if (window.ScrollTrigger) {
        window.gsap.fromTo('.nagara-hero-title',
          { y: 0, opacity: 1, filter: 'blur(0px)' },
          {
            y: -80,
            opacity: 0,
            filter: 'blur(20px)',
            scrollTrigger: {
              trigger: '.hero_contain',
              start: 'top top',
              end: 'bottom top',
              scrub: true
            },
            ease: 'power1.out'
          }
        )
        window.gsap.fromTo('.nagara-hero-sub',
          { y: 0, opacity: 1, filter: 'blur(0px)' },
          {
            y: -60,
            opacity: 0,
            filter: 'blur(20px)',
            scrollTrigger: {
              trigger: '.hero_contain',
              start: 'top top',
              end: 'bottom top',
              scrub: true
            },
            ease: 'power1.out'
          }
        )
        window.gsap.fromTo('.hero-img-el',
          { y: 0, opacity: 1, filter: 'blur(0px)' },
          {
            y: '20vh',
            opacity: 0,
            filter: 'blur(20px)',
            scrollTrigger: {
              trigger: '.hero_contain',
              start: 'top top',
              end: 'bottom top',
              scrub: true
            },
            ease: 'power1.out'
          }
        )
      }
    })
  }
})
</script>

<style scoped>
/* 按照原图样式调整 */
.hero_img {
    aspect-ratio: 100/110; /* 保持手表的纵向比例 */
}

/* 确保文字在移动端的可读性 */
@media (max-width: 991px) {
    .hero_img {
        width: 35vh;
        margin-right: 5vw;
    }
}

@media (max-width: 767px) {
    .hero_img {
        width: 30vh;
        margin-right: 2vw;
    }
}

.img-mask {
  z-index: 2;
  transition: opacity 0.3s;
}
</style>
