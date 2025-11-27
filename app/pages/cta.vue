<template>
  <section
    ref="sectionRef"
    class="relative w-full min-h-screen flex items-center justify-end bg-black overflow-hidden"
  >
    <!-- 背景图及蒙层 -->
    <div class="absolute inset-0 w-full h-full">
      <img
        src="https://cdn.prod.website-files.com/66a9c740991eb3085d336d83/66a9c740991eb3085d336dc9_bg_cta.avif"
        alt="cta bg"
        class="object-cover w-full h-full"
      >
      <div class="absolute inset-0 bg-black/80" />
    </div>
    <!-- 左下角产品图 -->
    <div
      ref="imgRef"
      class="absolute left-0 bottom-0 m-4 md:m-8 w-56 md:w-80 rounded-lg overflow-hidden shadow-xl z-10"
    >
      <img
        src="https://cdn.prod.website-files.com/66a9c740991eb3085d336d83/66a9c740991eb3085d336dbb_img_cta.avif"
        alt="cta product"
        class="object-cover w-full h-full"
      >
    </div>
    <!-- 右侧内容 -->
    <div class="relative z-10 flex flex-col items-end max-w-2xl w-full pr-8 md:pr-24">
      <h2
        ref="titleRef"
        class="font-serif text-white text-[64px] leading-[1.05] font-normal text-right mb-8 tracking-tight cta-title"
        style="letter-spacing:-0.02em;"
      >
        WEAR<br>THE<br>LEGACY
      </h2>
      <p
        ref="descRef"
        class="font-mono text-gray-200 text-base md:text-lg text-right mb-12 max-w-xl tracking-wide cta-desc"
      >
        Every Nagara watch is a journey through time, combining the legacy of the past with the precision of the present. Embrace this unique blend of heritage and craftsmanship. Pre-order now to own a piece of history and wear the legacy.
      </p>
      <button
        ref="btnRef"
        class="px-12 py-3 rounded-full bg-[#cbb89d] text-black font-mono text-base md:text-lg font-normal shadow-lg tracking-widest transition hover:bg-[#b8a47d] cta-btn"
      >
        ORDER NOW
      </button>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import gsap from 'gsap'
import SplitType from 'split-type'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const sectionRef = ref(null)
const titleRef = ref(null)
const descRef = ref(null)
const btnRef = ref(null)
const imgRef = ref(null)
const imgStyle = ref('')

let splitTitle = null
let splitDesc = null
let titleAnim = null
let descAnim = null
let btnAnim = null

onMounted(() => {
  // 按钮与产品图中线对齐
  nextTick(() => {
    if (btnRef.value && imgRef.value && sectionRef.value) {
      const btnRect = btnRef.value.getBoundingClientRect()
      const sectionRect = sectionRef.value.getBoundingClientRect()
      const btnCenter = btnRect.top - sectionRect.top + btnRef.value.offsetHeight / 2
      imgStyle.value = `top: ${btnCenter}px; bottom: auto; transform: translateY(-50%);`
    }
  })
  // 背景淡入+parallax
  const bgImg = document.querySelector('.cta_bg img')
  if (bgImg) {
    bgAnim = gsap.fromTo(
      bgImg,
      { opacity: 0, y: '-10%' },
      {
        opacity: 1,
        y: '30%',
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.value || '.cta_wrap',
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        }
      }
    )
  }
  // 图片淡入
  const img = document.querySelector('.cta_image')
  if (img) {
    imgAnim = gsap.fromTo(
      img,
      { opacity: 0, filter: 'blur(20px)', y: 40 },
      {
        opacity: 1,
        filter: 'blur(0px)',
        y: 0,
        duration: 1,
        scrollTrigger: {
          trigger: img,
          start: 'top 80%',
          toggleActions: 'play none none reset'
        }
      }
    )
  }
  // 标题动画
  if (titleRef.value) {
    splitTitle = new SplitType(titleRef.value, { types: 'chars', tagName: 'span' })
    titleAnim = gsap.timeline({
      scrollTrigger: {
        trigger: titleRef.value,
        start: 'top 85%',
        toggleActions: 'play none none reset'
      }
    })
    titleAnim.from(
      titleRef.value.querySelectorAll('.char'),
      {
        yPercent: 30,
        opacity: 0,
        filter: 'blur(20px)',
        duration: 1.1,
        ease: 'power2.out',
        stagger: { amount: 0.7 }
      }
    )
  }
  // 正文动画
  if (descRef.value) {
    splitDesc = new SplitType(descRef.value, { types: 'words', tagName: 'span' })
    descAnim = gsap.timeline({
      scrollTrigger: {
        trigger: descRef.value,
        start: 'top 90%',
        toggleActions: 'play none none reset'
      }
    })
    descAnim.from(
      descRef.value.querySelectorAll('.word'),
      {
        yPercent: 100,
        filter: 'blur(10px)',
        opacity: 0,
        duration: 0.7,
        ease: 'power3.out',
        stagger: { each: 0.02 }
      }
    )
  }
  // 按钮动画
  const btn = document.querySelector('.btn_main_wrap')
  if (btn) {
    btnAnim = gsap.timeline({
      scrollTrigger: {
        trigger: btn,
        start: 'top 95%',
        toggleActions: 'play none none reset'
      }
    })
    btnAnim.from(btn, {
      opacity: 0,
      y: 40,
      filter: 'blur(10px)',
      duration: 0.7,
      ease: 'power3.out'
    })
  }
})

onBeforeUnmount(() => {
  if (splitTitle) splitTitle.revert()
  if (splitDesc) splitDesc.revert()
  ScrollTrigger.getAll().forEach(t => t.kill())
  gsap.globalTimeline.clear()
})
</script>

<style scoped>
.cta_wrap {
    position: relative;
    width: 100%;
    background: #181818;
    overflow: hidden;
}

.cta_bg {
    position: absolute;
    inset: 0;
    z-index: 0;
    width: 100%;
    height: 100%;
}

.g_visual_wrap.u-cover-absolute {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
}

.g_visual_img.u-cover-absolute {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.g_visual_background.u-cover-absolute {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    background: #181818;
    opacity: 0.7;
}

.g_visual_overlay.u-cover-absolute {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    background: #181818;
    opacity: 0.8;
}

.cta_contain.u-container {
    position: relative;
    z-index: 1;
    max-width: 1200px;
    margin: 0 auto;
    padding: 4rem 2rem;
}

.cta_layout.u-grid-custom {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 3rem;
    align-items: center;
}

.cta_image.u-column-2 {
    grid-column: 1 / 2;
}

.cta_content.u-column-4 {
    grid-column: 2 / 3;
}

.cta_text_title .g_heading_plain.u-text-h3 {
    font-size: 2.25rem;
    font-weight: 700;
    margin-bottom: 1.5rem;
    color: #fff;
}

.w-richtext p {
    color: #e5e5e5;
    font-size: 1.125rem;
    line-height: 1.7;
}

.btn_main_wrap.w-inline-block {
    display: inline-block;
    background: #fff;
    color: #181818;
    border-radius: 9999px;
    padding: 0.75rem 2.5rem;
    font-weight: 600;
    font-size: 1.125rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    transition: background 0.2s, color 0.2s;
    text-decoration: none;
}

.btn_main_wrap.w-inline-block:hover {
    background: #e5e5e5;
    color: #181818;
}

@media (max-width: 991px) {
    .cta_layout.u-grid-custom {
        grid-template-columns: 1fr;
        gap: 2rem;
    }

    .cta_image.u-column-2,
    .cta_content.u-column-4 {
        grid-column: auto;
    }
}

@media (max-width: 767px) {
    .cta_contain.u-container {
        padding: 2rem 1rem;
    }

    .cta_text_title .g_heading_plain.u-text-h3 {
        font-size: 1.5rem;
    }

    .w-richtext p {
        font-size: 1rem;
    }
}
</style>
