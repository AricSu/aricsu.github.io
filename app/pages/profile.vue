<template>
  <div class="product-viewer-bg">
    <div
      class="product-viewer-sidebar"
      :class="{ mobile: isMobile }"
    >
      <div
        v-if="!isMobile"
        class="sidebar-nav"
        :class="{ visible: showNav }"
      >
        <button
          v-if="showNav"
          class="nav-btn up"
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
          class="nav-btn down"
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
      <div
        v-if="!isMobile"
        class="sidebar-content"
      >
        <transition-group
          name="sidebar-fade"
          tag="div"
        >
          <div
            v-for="(group, idx) in groups"
            :key="group.label"
            class="sidebar-group"
          >
            <transition
              name="card-fade"
              mode="out-in"
            >
              <button
                v-if="idx !== currentGroup"
                :key="'btn-' + idx"
                class="sidebar-btn"
                :class="{ active: idx === currentGroup }"
                @click="selectGroup(idx); showNav = true"
              >
                <span
                  v-if="idx === 0"
                  class="dot"
                />
                <span
                  v-else
                  class="plus"
                >+</span>
                <span class="sidebar-label">{{ group.label }}</span>
              </button>
              <div
                v-else-if="group.detail && group.detail.desc"
                :key="'desc-' + idx"
                class="detail-card"
              >
                <div
                  v-if="group.detail.colors"
                  class="color-detail"
                >
                  <div class="detail-title">
                    Colors.
                    <span class="detail-desc">
                      Available in four breathtaking colors.<br>
                      iPhone Air shown in <b>{{ group.detail.colors?.[currentColorIdx]?.name }}</b>.
                    </span>
                  </div>
                  <div class="color-options">
                    <button
                      v-for="(color, cidx) in group.detail.colors"
                      :key="color.name"
                      class="color-circle"
                      :class="{ selected: cidx === currentColorIdx }"
                      :style="{ background: color.hex }"
                      @click.stop="selectColor(cidx)"
                    />
                  </div>
                </div>
                <div v-else>
                  <div
                    v-if="group.detail.title"
                    class="detail-title"
                  >
                    {{ group.detail.title }}
                  </div>
                  <div class="detail-desc">
                    {{ group.detail.desc }}
                  </div>
                  <img
                    v-if="group.detail.img"
                    :src="group.detail.img"
                    class="detail-img"
                    alt="detail"
                  >
                </div>
              </div>
            </transition>
          </div>
        </transition-group>
      </div>
      <!-- 小屏幕时 sidebar-content-mobile 区域不显示分组按钮 -->
      <div
        v-else
        class="sidebar-content-mobile"
      />
    </div>
    <div
      class="product-viewer-main"
      :class="{ mobile: isMobile }"
    >
      <transition
        name="fade-slide"
        mode="out-in"
      >
        <img
          v-if="groups[currentGroup]?.detail?.colors"
          :key="groups[currentGroup]?.detail?.colors?.[currentColorIdx]?.img || groups[currentGroup]?.image"
          :src="groups[currentGroup]?.detail?.colors?.[currentColorIdx]?.img || groups[currentGroup]?.image"
          :class="['phone-image', isMobile ? 'phone-image-mobile-bg' : '']"
          alt="Product"
        >
        <img
          v-else
          :key="groups[currentGroup]?.image"
          :src="groups[currentGroup]?.image"
          :class="['phone-image', isMobile ? 'phone-image-mobile-bg' : '']"
          alt="Product"
        >
      </transition>
      <!-- 小屏幕时主图左右显示分组切换按钮 -->
      <button
        v-if="isMobile && currentGroup > 0"
        class="nav-btn-mobile left"
        @click="selectGroup(currentGroup - 1)"
      >
        <svg
          width="32"
          height="32"
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
            d="M17 9L12 14L17 19"
            stroke="#888"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
      <button
        v-if="isMobile && currentGroup < groups.length - 1"
        class="nav-btn-mobile right"
        @click="selectGroup(currentGroup + 1)"
      >
        <svg
          width="32"
          height="32"
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
            d="M11 9L16 14L11 19"
            stroke="#222"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
    </div>
    <!-- 小屏幕时 mobile-bottom-bar 区域不显示分组按钮，只显示 detail -->
    <div
      v-if="isMobile"
      class="mobile-bottom-bar"
    >
      <div class="mobile-detail">
        <div v-if="groups[currentGroup]?.detail?.colors">
          <div class="detail-title">
            {{ groups[currentGroup]?.detail?.title }}
          </div>
          <div class="detail-desc">
            {{ groups[currentGroup]?.detail?.desc }}
          </div>
          <div class="color-options-mobile">
            <button
              v-for="(color, cidx) in groups[currentGroup]?.detail?.colors"
              :key="color.name"
              class="color-circle-mobile"
              :class="{ selected: cidx === currentColorIdx }"
              :style="{ background: color.hex }"
              @click.stop="selectColor(cidx)"
            />
          </div>
        </div>
        <div v-else>
          <div
            v-if="groups[currentGroup]?.detail?.title"
            class="detail-title"
          >
            {{ groups[currentGroup]?.detail?.title }}
          </div>
          <div class="detail-desc">
            {{ groups[currentGroup]?.detail?.desc }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

type ColorOption = { name: string, hex: string, img?: string }
type GroupDetail = { title: string, desc: string, img?: string, colors?: ColorOption[] }
type Group = { label: string, image: string, detail: GroupDetail }

const groups: Group[] = [
  {
    label: 'Colors',
    image: '/images/Product_1_white.jpg',
    detail: {
      title: 'Colors',
      desc: 'Choose your favorite iPhone Air color.',
      img: '',
      colors: [
        { name: 'Blue', hex: '#A3C1DA', img: '/images/Product_1_white.jpg' },
        { name: 'Black', hex: '#222', img: '/images/pro_display__etmtieo96ga6_large_2x.jpg' },
        { name: 'White', hex: '#F5F5F7', img: '/images/titanium__foo5831yt2my_large_2x.jpg' },
        { name: 'Natural', hex: '#E3D9C6', img: '/images/titanium__foo5831yt2my_large_2x.jpg' }
      ]
    }
  },
  {
    label: 'Titanium frame',
    image: '/images/plateau__el50ekod2vo2_large_2x.jpg',
    detail: {
      title: 'Titanium frame.',
      desc: 'A Grade 5 titanium frame built with 80 percent recycled titanium makes iPhone Air as strong as it is stunning.',
      img: ''
    }
  },
  {
    label: 'Innovative internal design',
    image: '/images/pro_display__etmtieo96ga6_large_2x.jpg',
    detail: {
      title: 'Innovative internal design.',
      desc: 'Multiple technologies are housed in the plateau of iPhone Air, maximizing performance and creating space for a large, high-density battery.',
      img: '/images/pro_display__etmtieo96ga6_large_2x.jpg'
    }
  },
  {
    label: 'Immersive pro display',
    image: '/images/ceramic_shield__d9whr6dqa2qa_large_2x.jpg',
    detail: {
      title: 'Immersive pro display.',
      desc: 'Experience vibrant colors and sharp details with the advanced pro display.',
      img: ''
    }
  },
  {
    label: 'Ceramic Shield',
    image: '/images/ceramic_shield_endframe__eyng7rczq6aa_large_2x.jpg',
    detail: {
      title: 'Ceramic Shield.',
      desc: 'Ceramic Shield provides industry-leading durability and protection.',
      img: ''
    }
  },
  {
    label: 'Camera Control',
    image: '/images/camera_control__esza1ddn4tm6_large_2x.jpg',
    detail: {
      title: 'Camera Control.',
      desc: 'Take stunning photos and videos with advanced camera controls.',
      img: ''
    }
  },
  {
    label: 'Action button',
    image: '/images/action_button__d10zlvf0n78m_large_2x.jpg',
    detail: {
      title: 'Action button.',
      desc: 'Quickly access your favorite features with the customizable action button.',
      img: ''
    }
  },
  {
    label: 'Accessories',
    image: '/images/accessories__fu66ojv5pf2a_large_2x.jpg',
    detail: {
      title: 'Accessories.',
      desc: 'Enhance your experience with a range of accessories designed for iPhone Air.',
      img: ''
    }
  }
]
const currentGroup = ref(0)
const currentColorIdx = ref(0)
const showNav = ref(false)
let navTimeout: number | null = null
const isMobile = ref(false)
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
  .nav-btn-mobile {
    position: fixed;
    top: 50%;
    transform: translateY(-50%);
    width: 3.8rem;
    height: 3.8rem;
    min-width: 44px;
    min-height: 44px;
    max-width: 56px;
    max-height: 56px;
    border-radius: 50%;
    border: none;
    background: #f6f7fa;
    box-shadow: 0 2px 16px rgba(0, 0, 0, 0.08);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
    transition: background 0.2s, box-shadow 0.2s;
    outline: none;
    margin: 0;
    padding: 0;
  }
  .nav-btn-mobile.left {
    left: 2vw;
  }
  .nav-btn-mobile.right {
    right: 2vw;
  }
  @media (min-width: 901px) {
    .nav-btn-mobile {
      display: none !important;
    }
  }
.product-viewer-bg {
  background: #fff;
  border-radius: 2rem;
  width: 80vw;
  height: 70vh;
  margin: 2vh auto;
  box-sizing: border-box;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0.5vw 2vw rgba(0, 0, 0, 0.07);
}

.product-viewer-sidebar {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 1vw;
  min-width: 22vw;
  max-width: 28vw;
  height: 100%;
  padding-left: 2vw;
  padding-top: 0;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2vw;
  margin-bottom: 0;
  height: 100%;
  min-width: 3vw;
  max-width: 3vw;
}

.sidebar-nav:not(.visible) {
  visibility: hidden;
}

.nav-btn {
  width: 3vw;
  height: 3vw;
  min-width: 40px;
  min-height: 40px;
  max-width: 56px;
  max-height: 56px;
  border-radius: 50%;
  border: none;
  background: #f6f7fa;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.04);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s, box-shadow 0.2s;
  outline: none;
  margin: 0.6vw 0;
  padding: 0;
}

.nav-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  background: #f6f7fa;
  color: #b0b0b0;
}

.nav-btn svg {
  width: 2.2rem;
  height: 2.2rem;
}

.nav-btn:disabled svg path {
  stroke: #b0b0b0;
}

.nav-btn span {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.2rem;
  font-weight: bold;
  line-height: 1;
}

.sidebar-content {
  display: flex;
  flex-direction: column;
  margin: 10vh 10px;
  gap: 1vw;
  align-items: flex-start;
  justify-content: center;
  width: 100%;
}

.sidebar-content-mobile {
  width: 100vw;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  position: fixed;
  left: 0;
  bottom: 0;
  z-index: 100;
  background: none;
  pointer-events: none;
}

.sidebar-group {
  display: flex;
  flex-direction: column;
  gap: 1vw;
  align-items: flex-start;
  width: 100%;
  margin: auto;
}

.mobile-bottom-bar {
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100vw;
  z-index: 100;
  background: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  pointer-events: auto;
}

.mobile-groups {
  display: flex;
  flex-direction: row;
  gap: 2vw;
  justify-content: center;
  align-items: center;
  width: 100vw;
  padding: 2vw 0 0.5vw 0;
}

.mobile-detail {
  width: 92vw;
  max-width: 95vw;
  min-width: 0;
  min-height: 0;
  height: auto;
  box-shadow: 0 0.2vw 1vw rgba(0, 0, 0, 0.10);
  z-index: 101;
  border-radius: 2vw;
  padding: 1.2vw 1.5vw;
  background: rgba(255, 255, 255, 0.85);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(12px);
  font-size: 1.08rem;
  pointer-events: auto;
  margin-bottom: 2vw;
}

.sidebar-groups-mobile {
  display: flex;
  flex-direction: row;
  gap: 1vw;
  justify-content: center;
  align-items: center;
  width: 100vw;
  padding: 1vw 0 0.5vw 0;
  pointer-events: auto;
}

.sidebar-btn {
  background: linear-gradient(90deg, #f5f5f7 0%, #f4f5f7 100%);
  margin: 10px 0;
  border: none;
  border-radius: 1.5rem;
  font-size: 1.2rem;
  color: #222;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: background 0.4s, color 0.3s, box-shadow 0.3s, transform 0.2s;
  box-shadow: 0 0.2vw 0.8vw rgba(0, 0, 0, 0.04);
  min-height: 3.2rem;
  will-change: background, color, box-shadow, transform;
}

  .sidebar-btn-mobile {
    background: linear-gradient(90deg, #f5f5f7 0%, #f4f5f7 100%);
    border: none;
    border-radius: 1.5rem;
    padding: 0.7rem 2vw;
    font-size: 1.2rem;
    color: #222;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.8vw;
    box-shadow: 0 0.2vw 0.8vw rgba(0, 0, 0, 0.04);
    min-height: 3.2rem;
    will-change: background, color, box-shadow, transform;
    transition: background 0.4s, color 0.3s, box-shadow 0.3s, transform 0.2s;
  }
  @media (max-width: 900px) {
    .sidebar-label {
      display: none !important;
    }
  }

.sidebar-btn.active {
  background: linear-gradient(90deg, #eaf2fb 0%, #e3eafc 100%);
  color: #0071e3;
  box-shadow: 0 4px 16px rgba(0, 113, 227, 0.10);
  transform: scale(1.04);
}

.sidebar-btn-mobile.active {
  background: linear-gradient(90deg, #eaf2fb 0%, #e3eafc 100%);
  color: #0071e3;
  box-shadow: 0 4px 16px rgba(0, 113, 227, 0.10);
  transform: scale(1.04);
}

.sidebar-btn:hover {
  background: linear-gradient(90deg, #eaf2fb 0%, #f5f5f7 100%);
  color: #0071e3;
  box-shadow: 0 6px 24px rgba(0, 113, 227, 0.10);
  transform: scale(1.03);
}

.detail-card {
  background: #f4f5f7;
  border-radius: 1.5rem;
  box-shadow: 0 0.2vw 1vw rgba(0, 0, 0, 0.07);
  padding: 1.2vw 1.5vw 1.5vw 1.5vw;
  margin: 0.5vw 0 0.5vw 0;
  overflow: hidden;
  color: #222;
  font-size: 1.08rem;
  display: flex;
  flex-direction: column;
  gap: 0.8vw;
  backface-visibility: hidden;
}

.detail-card-mobile {
  position: fixed;
  left: 50%;
  bottom: 2vw;
  transform: translateX(-50%);
  width: 92vw;
  max-width: 95vw;
  min-width: 0;
  min-height: 0;
  height: auto;
  box-shadow: 0 0.2vw 1vw rgba(0, 0, 0, 0.10);
  z-index: 101;
  border-radius: 2vw;
  padding: 1.2vw 1.5vw;
  background: rgba(255, 255, 255, 0.85);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(12px);
  font-size: 1.08rem;
  pointer-events: auto;
}

.detail-title {
  font-weight: bold;
  font-size: 1.1rem;
  margin-bottom: 0.3rem;
}

.detail-desc {
  color: #222;
  line-height: 1.6;
}

.detail-img {
  width: 100%;
  border-radius: 1vw;
  margin-top: 0.8vw;
  object-fit: cover;
}

.product-viewer-main {
  flex: 1;
  display: flex;
  height: 90%;
  max-width: 70vw;
  position: relative;
  box-sizing: border-box;
}

  .phone-image {
    width: 90vw;
    max-width: 50vw;
    height: auto;
    object-fit: contain;
    border-radius: 2vw;
    box-shadow: 0 0.5vw 2vw rgba(0, 0, 0, 0.18);
    background: #fff;
    border: 0.1vw solid #eaeaea;
    display: block;
    margin: 0 auto;
  }
  .phone-image-mobile-bg {
    position: fixed;
    left: 0;
    top: 0;
    width: 100vw;
    height: 100vh;
    max-width: 100vw;
    max-height: 100vh;
    min-width: 100vw;
    min-height: 100vh;
    object-fit: cover;
    border-radius: 0;
    box-shadow: none;
    background: #fff;
    border: none;
    z-index: 0;
    margin: 0;
  }

.color-options {
  display: flex;
  gap: 1.2vw;
  margin-top: 1vw;
  justify-content: flex-start;
}

.color-options-mobile {
  display: flex;
  gap: 2vw;
  margin-top: 1vw;
  justify-content: center;
}

.color-circle {
  width: 1.4vw;
  height: 1.4vw;
  border-radius: 50%;
  border: 0.18vw solid #eaeaea;
  box-shadow: 0 0.15vw 0.5vw rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: border 0.2s, box-shadow 0.2s;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  outline: none;
  border-width: 2px;
  min-width: 1.4vw;
  min-height: 1.4vw;
  max-width: 2vw;
  max-height: 2vw;
}

.color-circle-mobile {
  width: 6vw;
  height: 6vw;
  border-radius: 50%;
  border: 0.2vw solid #eaeaea;
  box-shadow: 0 0.2vw 0.8vw rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: border 0.2s, box-shadow 0.2s;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.color-circle.selected {
  border: 0.22vw solid #0071e3;
  box-shadow: 0 0 0 0.15vw #fff, 0 0.15vw 0.8vw rgba(0, 0, 0, 0.12);
}

.color-circle-mobile.selected {
  border: 0.25vw solid #222;
  box-shadow: 0 0 0 0.2vw #fff, 0 0.2vw 1.2vw rgba(0, 0, 0, 0.12);
}

@media (max-width: 900px) {
  .product-viewer-bg {
    width: 100vw;
    height: 100vh;
    min-width: unset;
    min-height: unset;
    max-width: unset;
    max-height: unset;
    border-radius: 0;
    padding: 0;
    overflow: hidden;
    background: #fff;
  }

  .product-viewer-flex {
    flex-direction: column;
    gap: 0;
    align-items: center;
    justify-content: flex-start;
    height: 100vh;
  }

  .product-viewer-sidebar {
    flex-direction: column;
    padding-left: 0;
    padding-top: 0;
  }

  .sidebar-nav {
    display: none;
  }

  .product-viewer-main {
    width: 100vw;
    height: 100vh;
    min-width: 0;
    min-height: 0;
    max-width: 100vw;
    max-height: 100vh;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    background: #fff;
  }

  .phone-frame {
    width: 90vw;
    height: 80vh;
    min-width: 220px;
    min-height: 320px;
    max-width: 95vw;
    max-height: 80vh;
    margin: 0 auto;
    border-radius: 2rem;
    box-shadow: none;
    background: transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 1;
  }

  .phone-image {
    width: 100%;
    height: 100%;
    object-fit: contain;
    border-radius: 2vw;
    box-shadow: none;
    background: transparent;
    border: none;
  }

  .detail-card {
    position: fixed;
    left: 50%;
    bottom: 2.5vw;
    transform: translateX(-50%);
    width: 92vw;
    max-width: 95vw;
    min-width: 0;
    min-height: 0;
    height: auto;
    box-shadow: 0 0.2vw 1vw rgba(0, 0, 0, 0.10);
    z-index: 100;
    border-radius: 2vw;
    padding: 1.2vw 1.5vw;
    background: rgba(255, 255, 255, 0.85);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(12px);
    font-size: 1.08rem;
  }

  .color-options {
    display: flex;
    gap: 1.2vw;
    margin-top: 1vw;
    justify-content: center;
  }

  .color-circle {
    width: 4vw;
    height: 4vw;
    border-radius: 50%;
    border: 0.2vw solid #eaeaea;
    box-shadow: 0 0.2vw 0.8vw rgba(0, 0, 0, 0.08);
    cursor: pointer;
    transition: border 0.2s, box-shadow 0.2s;
    background: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .color-circle-mobile {
    width: 6vw;
    height: 6vw;
    border-radius: 50%;
    border: 0.2vw solid #eaeaea;
    box-shadow: 0 0.2vw 0.8vw rgba(0, 0, 0, 0.08);
    cursor: pointer;
    transition: border 0.2s, box-shadow 0.2s;
    background: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .detail-title {
    font-weight: bold;
    font-size: 1.12rem;
    margin-bottom: 0.2vw;
    text-align: left;
    width: 100%;
  }

  .detail-desc {
    font-weight: normal;
    font-size: 1rem;
    color: #222;
    margin-left: 0.2vw;
    text-align: left;
    width: 100%;
  }
}

/* Apple 官网风格 sidebar-fade transition-group 动画美化 */
.sidebar-fade-enter-active,
.sidebar-fade-leave-active {
  transition:
    opacity 0.8s cubic-bezier(0.22, 1, 0.36, 1),
    filter 0.8s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.8s cubic-bezier(0.22, 1, 0.36, 1);
  will-change: opacity, transform, filter;
}
.sidebar-fade-enter-from {
  opacity: 0;
  filter: blur(24px);
  transform: scale(0.96) translateY(4vh) skewY(2deg);
}
.sidebar-fade-enter-to {
  opacity: 1;
  transform: translateY(0) scale(1) skewY(0deg);
  filter: blur(0);
}
.sidebar-fade-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1) skewY(0deg);
  filter: blur(0);
}
.sidebar-fade-leave-to {
  opacity: 0;
  filter: blur(24px);
  transform: scale(1.04) translateY(-4vh) skewY(-2deg);
}
.btn-slide-enter-active,
.btn-slide-leave-active {
  transition: all 0.4s cubic-bezier(.4,0,.2,1);
}
.btn-slide-enter-from,
.btn-slide-leave-to {
  opacity: 0;
  transform: translateX(-32px) scale(0.92);
}
.btn-slide-enter-to,
.btn-slide-leave-from {
  opacity: 1;
  transform: translateX(0) scale(1.04);
}
.btn-slide-x-enter-active,
.btn-slide-x-leave-active {
  transition: all 0.4s cubic-bezier(.4,0,.2,1);
}
.btn-slide-x-enter-from,
.btn-slide-x-leave-to {
  opacity: 0;
  transform: translateY(32px) scale(0.92);
}
.btn-slide-x-enter-to,
.btn-slide-x-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1.04);
}
.card-fade-enter-active,
.card-fade-leave-active {
  transition: opacity 0.5s cubic-bezier(.4,0,.2,1), transform 0.5s cubic-bezier(.4,0,.2,1);
}
.card-fade-enter-from,
.card-fade-leave-to {
  opacity: 0;
  transform: translateY(24px);
}
.card-fade-enter-to,
.card-fade-leave-from {
  opacity: 1;
  transform: translateY(0);
}
</style>
