<template>
  <div
    class="flex bg-[#f7f7fa] rounded-[2.5rem] w-full max-w-[80vw] mx-auto my-8 shadow-lg overflow-hidden min-h-[60vh] items-center justify-between px-2 md:px-8 py-8 relative"
    :style="{
      backgroundImage: `url(${groups[currentGroup]?.image})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }"
  >
    <!-- 左侧按钮区 -->
    <div class="flex flex-col gap-4 items-start justify-center px-2 py-2">
      <div
        v-for="(group, idx) in groups"
        :key="group.label"
        class="px-6 py-3"
      >
        <button
          v-if="idx !== currentGroup"
          :key="'btn-' + idx"
          class="flex items-center gap-2 px-6 py-3 rounded-full bg-[#f3f3f6] text-gray-800 font-medium text-lg shadow-sm hover:bg-[#eaf2fb] transition-all duration-200 w-full text-left"
          @click="selectGroup(idx)"
        >
          <span class="w-5 h-5 flex items-center justify-center">
            <span class="font-bold text-xl text-gray-500">+</span>
          </span>
          <span class="ml-2">{{ group.label }}</span>
        </button>
        <div
          v-else
          :key="'active-' + idx"
          class="flex items-center gap-2 px-6 py-3 rounded-full bg-blue-50 text-blue-700 font-semibold text-lg shadow-lg w-full border-2 border-blue-100"
        >
          <span class="w-5 h-5 flex items-center justify-center">
            <span class="rounded-full bg-blue-100 border border-blue-300 w-4 h-4" />
          </span>
          <span class="ml-2">{{ group.label }}</span>
        </div>
      </div>
    </div>
    <!-- 右侧占位区 -->
    <div class="flex-1 flex items-center justify-center">
      <!-- 可放内容或留空 -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

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
function selectGroup(idx: number) {
  currentGroup.value = idx
  if (groups[idx]?.detail?.colors) currentColorIdx.value = 0
}
</script>
