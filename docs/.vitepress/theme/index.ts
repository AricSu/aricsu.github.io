//.vitepress/theme/index.ts
import DefaultTheme from 'vitepress/theme'
import { h } from 'vue'

import { HomeFooter } from '@theojs/lumen'
import { Footer_Data } from '../data/footerData'

// theme/index.ts
import '@theojs/lumen/theme'

// For giscusTalk
import giscusTalk from 'vitepress-plugin-comment-with-giscus';
import { useData, useRoute } from 'vitepress';
import { toRefs } from "vue";

// For googleAnalytics
import { googleAnalytics } from '@theojs/lumen'
import { baiduAnalytics, trackPageview } from '@theojs/lumen'

// For home QA（unfinished）
import QandAList from './QandAList.vue'

// For homepage
import Vendors from './components/Vendors.vue'
import PandaHR from './components/PandaHR.vue'
import Media from './components/Media.vue'


export default {
  extends: DefaultTheme,
  // Layout: DoubanBookPlusLayout,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      'layout-bottom': () => h(HomeFooter, { Footer_Data }) 
    }) 
  },
  enhanceApp: ({ app }) => {
    baiduAnalytics({ baiduId: 'de9c366ed5b027175807f577a5213b69' }) 
    googleAnalytics({ id: 'G-564B92NP04' }) 
    if (typeof window !== 'undefined') { 
      trackPageview('de9c366ed5b027175807f577a5213b69', window.location.href) 
    }
    app.component('QandAList', QandAList);
    app.component('vendors', Vendors)
    app.component('panda-hr', PandaHR)
    app.component('media', Media)
  },
  setup() {
    const { frontmatter } = toRefs(useData());
    const route = useRoute();

    // https://giscus.app/zh-CN
    giscusTalk(
      {
        repo: 'AricSu/askAricComments',
        repoId: 'R_kgDONeqM7A',
        category: 'General', // 默认: `General`
        categoryId: 'DIC_kwDONeqM7M4ClSWa',
        mapping: 'pathname', // 默认: `pathname`
        inputPosition: 'bottom', // 默认: `top`
        lang: 'zh-CN', // 默认: `zh-CN`
        lightTheme: 'light', // 默认: `light`
        darkTheme: 'dark', // 默认: `transparent_dark`
        loading: 'eager',
      },
      {
        frontmatter,
        route,
      },
      // 是否全部页面启动评论区。
      // 默认为 true，表示启用，此参数可忽略；
      // 如果为 false，表示不启用。
      // 可以在页面使用 `comment: true` 前言单独启用
      true
    );
  },
}