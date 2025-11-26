import { defineNuxtPlugin } from '#app'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

declare global {
  interface Window {
    gsap: typeof gsap
    ScrollTrigger: typeof ScrollTrigger
  }
}

gsap.registerPlugin(ScrollTrigger)

// 挂载到window，方便全局直接用window.gsap
if (typeof window !== 'undefined') {
  window.gsap = gsap
  window.ScrollTrigger = ScrollTrigger
}

export default defineNuxtPlugin(() => {
  // 可选：将gsap注入到Nuxt上下文
  return {
    provide: {
      gsap,
      ScrollTrigger
    }
  }
})
