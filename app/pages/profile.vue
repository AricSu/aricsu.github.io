<template>
  <div
    :style="mainBgStyle"
    :class="[
      'relative mx-auto my-[4vh] rounded-2xl overflow-hidden flex items-center justify-center shadow-[0_0.5vw_2vw_rgba(0,0,0,0.07)] bg-white',
      isMobile ? 'w-screen h-screen' : 'w-[75vw] h-[80vh]'
    ]"
  >
    <!-- 移动端逻辑（可后续补充） -->
    <template v-if="isMobile">
      <!-- 左右切换按钮 -->
      <button
        v-if="currentGroup > 0"
        class="absolute left-2 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 shadow-lg flex items-center justify-center z-30"
        @click="selectGroup(currentGroup - 1)"
      >
        <svg
          width="28"
          height="28"
          viewBox="0 0 28 28"
          fill="none"
        >
          <circle
            cx="14"
            cy="14"
            r="13"
            fill="#f6f7fa"
          />
          <path
            d="M17 9L12 14L17 19"
            stroke="#888"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
      <button
        v-if="currentGroup < groups.length - 1"
        class="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 shadow-lg flex items-center justify-center z-30"
        @click="selectGroup(currentGroup + 1)"
      >
        <svg
          width="28"
          height="28"
          viewBox="0 0 28 28"
          fill="none"
        >
          <circle
            cx="14"
            cy="14"
            r="13"
            fill="#f6f7fa"
          />
          <path
            d="M11 9L16 14L11 19"
            stroke="#222"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
      <!-- 底部悬浮卡片 -->
      <div
        class="absolute left-1/2 bottom-6 -translate-x-1/2 z-[101] bg-white/90 rounded-2xl shadow-xl px-6 py-5 flex flex-col items-center justify-center backdrop-blur-xl text-[1.08rem] pointer-events-auto w-[90vw] max-w-[420px]"
        style="width:100%;"
      >
        <div class="w-full flex flex-col items-center justify-center">
          <div class="font-bold text-[1.1rem] mb-2">
            {{ groups[currentGroup]?.detail?.title }}
          </div>
          <div class="text-[#222] leading-[1.6] text-center">
            {{ groups[currentGroup]?.detail?.desc }}
          </div>
          <img
            v-if="groups[currentGroup]?.detail?.img"
            :src="groups[currentGroup]?.detail?.img"
            class="w-full rounded-[1vw] mt-2 object-cover"
            alt="detail"
          >
        </div>
      </div>
    </template>
    <!-- 桌面端逻辑 -->
    <template v-else>
      <div class="flex flex-row items-center justify-center gap-[1vw] min-w-[22vw] max-w-[28vw] h-full pl-[2vw]">
        <div
          class="flex flex-col items-center justify-center gap-[2vw] h-full min-w-[3vw] max-w-[3vw]"
          :class="{ visible: showNav }"
        >
          <button
            v-if="showNav"
            class="w-[3vw] h-[3vw] min-w-[40px] min-h-[40px] max-w-[56px] max-h-[56px] rounded-full border-none bg-[#f6f7fa] shadow-[0_2px_16px_rgba(0,0,0,0.04)] flex items-center justify-center transition-all outline-none m-[0.6vw_0] p-0 disabled:opacity-45 disabled:cursor-not-allowed"
            :disabled="currentGroup === 0"
            @click="selectGroup(currentGroup - 1)"
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 28 28"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="14"
                cy="14"
                r="13"
                fill="#f6f7fa"
              />
              <path
                d="M9 16L14 11L19 16"
                stroke="#888"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
          <button
            v-if="showNav"
            class="w-[3vw] h-[3vw] min-w-[40px] min-h-[40px] max-w-[56px] max-h-[56px] rounded-full border-none bg-[#f6f7fa] shadow-[0_2px_16px_rgba(0,0,0,0.04)] flex items-center justify-center transition-all outline-none m-[0.6vw_0] p-0 disabled:opacity-45 disabled:cursor-not-allowed"
            :disabled="currentGroup === groups.length - 1"
            @click="selectGroup(currentGroup + 1)"
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 28 28"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="14"
                cy="14"
                r="13"
                fill="#f6f7fa"
              />
              <path
                d="M9 12L14 17L19 12"
                stroke="#222"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
        </div>
        <div class="flex flex-col mt-[10vh] gap-[1vw] items-start justify-center w-full">
          <transition-group
            name="sidebar-fade"
            tag="div"
          >
            <div
              v-for="(group, idx) in groups"
              :key="group.label"
              class="flex flex-col gap-[1vw] items-start w-full m-auto"
            >
              <transition
                name="card-fade"
                mode="out-in"
              >
                <button
                  v-if="idx !== currentGroup"
                  :key="'btn-' + idx"
                  class="bg-gradient-to-r from-[#f5f5f7] to-[#f4f5f7] my-[10px] border-none rounded-[1.5rem] text-[1.2rem] text-[#222] font-medium cursor-pointer flex items-center gap-[0.7rem] transition-all shadow-[0_0.2vw_0.8vw_rgba(0,0,0,0.04)] min-h-[3.2rem] px-[1.1rem] py-[0.7rem] w-fit max-w-full hover:bg-gradient-to-r hover:from-[#eaf2fb] hover:to-[#f5f5f7] hover:text-[#0071e3] hover:shadow-[0_6px_24px_rgba(0,113,227,0.10)] hover:scale-105"
                  :class="{ bgGradient: idx === currentGroup }"
                  @click="selectGroup(idx); showNav = true"
                >
                  <span
                    class="flex items-center justify-center w-[2.1rem] h-[2.1rem] rounded-full bg-gradient-to-br from-[#eaf2fb] to-[#f5f5f7] shadow-[0_2px_8px_rgba(0,113,227,0.08)] transition-all"
                  >
                    <span class="text-[1.3rem] font-bold text-[#0071e3] leading-none select-none">+</span>
                  </span>
                  <span class="sidebar-label">{{ group.label }}</span>
                </button>
                <div
                  v-else-if="group.detail && group.detail.desc"
                  :key="'desc-' + idx"
                  class="bg-[#f4f5f7] rounded-[1.5rem] shadow-[0_0.2vw_1vw_rgba(0,0,0,0.07)] px-[1.5vw] py-[1.2vw] my-[0.5vw] text-[#222] text-[1.08rem] flex flex-col gap-[0.8vw]"
                >
                  <div
                    v-if="group.detail.colors"
                    class="flex flex-col gap-2"
                  >
                    <div class="font-bold text-[1.1rem] mb-1">
                      Colors.
                      <span class="text-[#222] font-normal leading-[1.6] block">
                        Available in four breathtaking colors.<br>
                        iPhone Air shown in <b>{{ group.detail.colors?.[currentColorIdx]?.name
                        }}</b>.
                      </span>
                    </div>
                    <div class="flex gap-[1.2vw] mt-[1vw] justify-start">
                      <button
                        v-for="(color, cidx) in group.detail.colors"
                        :key="color.name"
                        class="w-[1.4vw] h-[1.4vw] rounded-full border-[2px] border-[#eaeaea] shadow-[0_0.15vw_0.5vw_rgba(0,0,0,0.08)] cursor-pointer transition-all bg-white flex items-center justify-center"
                        :class="{ 'border-[#979da3] shadow-[0_0_0_0.15vw_#fff,0_0.15vw_0.8vw_rgba(0,0,0,0.12)]': cidx === currentColorIdx }"
                        :style="{ background: color.hex }"
                        @click.stop="selectColor(cidx)"
                      />
                    </div>
                  </div>
                  <div v-else>
                    <div
                      v-if="group.detail.title"
                      class="font-bold text-[1.1rem] mb-1"
                    >
                      {{ group.detail.title }}
                    </div>
                    <div class="text-[#222] leading-[1.6]">
                      {{ group.detail.desc }}
                    </div>
                    <img
                      v-if="group.detail.img"
                      :src="group.detail.img"
                      class="w-full rounded-[1vw] mt-[0.8vw] object-cover"
                      alt="detail"
                    >
                  </div>
                </div>
              </transition>
            </div>
          </transition-group>
        </div>
      </div>
      <div class="flex flex-1 h-[90%] max-w-[70vw] relative box-border overflow-hidden" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

type ColorOption = { name: string, hex: string, img?: string }
type GroupDetail = { title: string, desc: string, img?: string, colors?: ColorOption[] }
type Group = { label: string, image: string, imageMobile?: string, detail: GroupDetail }

const groups: Group[] = [
  {
    label: 'OCP Certified',
    image: '/images/hero/ocp.jpg',
    imageMobile: '/images/hero/ocp_mobile.jpg',
    detail: {
      title: 'OCP Certified',
      desc: 'Officially recognized OCP certification, demonstrating advanced expertise and professional standards in open compute technologies.',
      img: ''
    }
  },
  {
    label: 'PCTP Certified - Chinese Version',
    image: '/images/hero/pctp_chinese.jpg',
    imageMobile: '/images/hero/pctp_chinese_mobile.jpg',
    detail: {
      title: 'PCTP Certified (中文)',
      desc: '通过中文版本的 PCTP 认证，具备分布式平台技术的系统性能力，适用于本地化场景和中国市场需求。',
      img: '/images/hero/pctp_chinese_mobile.jpg'
    }
  },
  {
    label: 'PTCP Certified - English Version',
    image: '/images/hero/ptcp_english.jpg',
    imageMobile: '/images/hero/ptcp_english_mobile.jpg',
    detail: {
      title: 'PTCP Certified (English)',
      desc: 'Certified for PTCP in English, demonstrating global technical proficiency and readiness for international distributed platform projects.',
      img: ''
    }
  },
  {
    label: 'PTCA Certified',
    image: '/images/hero/ptca.jpg',
    imageMobile: '/images/hero/ptca_mobile.jpg',
    detail: {
      title: 'PTCA Certified',
      desc: 'PTCA 认证，代表在平台技术架构领域具备系统设计与实施能力，适合复杂系统集成项目。',
      img: ''
    }
  },
  {
    label: 'PGCE Certified',
    image: '/images/hero/pgce.jpg',
    imageMobile: '/images/hero/pgce_mobile.jpg',
    detail: {
      title: 'PGCE Certified',
      desc: 'PGCE 认证，证明在云平台和企业级架构方面具备专业能力，适用于大型企业云化转型。',
      img: ''
    }
  },
  {
    label: 'PGCA Certified',
    image: '/images/hero/pgca.jpg',
    imageMobile: '/images/hero/pgca_mobile.jpg',
    detail: {
      title: 'PGCA Certified',
      desc: 'PGCA 认证，专注于平台治理与合规，保障系统安全与稳定运行。',
      img: ''
    }
  },
  {
    label: 'Certified TiDB MVA',
    image: '/images/hero/mva.jpg',
    imageMobile: '/images/hero/mva_mobile.jpg',
    detail: {
      title: 'Certified TiDB MVA',
      desc: 'TiDB MVA 认证，代表在分布式数据库领域具备高可用架构与性能优化能力。',
      img: ''
    }
  }
]
const currentGroup = ref(0)
const currentColorIdx = ref(0)
const showNav = ref(false)
let navTimeout: number | null = null
const isMobile = ref(false)

const mainBgStyle = computed(() => {
  const group = groups[currentGroup.value]
  // 移动端优先 imageMobile，桌面端只用 image
  const bgImg = isMobile.value
    ? (group?.imageMobile || group?.image)
    : group?.image
  if (group?.detail?.colors) {
    return {
      backgroundImage: `url(${group.detail.colors?.[currentColorIdx.value]?.img || bgImg})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }
  }
  return {
    backgroundImage: `url(${bgImg})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  }
})

function checkMobile() {
  isMobile.value = window.innerWidth <= 900
}
onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})
onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})
function selectGroup(idx: number) {
  currentGroup.value = idx
  if (groups[idx]?.detail?.colors) currentColorIdx.value = 0
  if (navTimeout) clearTimeout(navTimeout)
  navTimeout = window.setTimeout(() => {
    showNav.value = true
  }, 350)
}
function selectColor(idx: number) {
  currentColorIdx.value = idx
}
</script>

<style scoped>
/* 可复用原有样式 */
</style>
