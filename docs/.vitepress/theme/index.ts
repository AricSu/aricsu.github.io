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
import { toRefs, reactive } from "vue";

// For googleAnalytics
import { googleAnalytics } from '@theojs/lumen'
import { baiduAnalytics, trackPageview } from '@theojs/lumen'

// For home QA（unfinished）
import QandAList from './QandAList.vue'

// For homepage
import VendorsZH from './components/VendorsZH.vue'
import VendorsEN from './components/VendorsEN.vue'
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
    app.component('vendors-zh', VendorsZH)
    app.component('vendors-en', VendorsEN)
    app.component('panda-hr', PandaHR)
    app.component('media', Media)
  },
  setup() {
    const data = reactive(useData());
    const { frontmatter } = toRefs(data);
    const route = useRoute();

    // 动态设置 category 和 categoryId
    const getCategoryConfig = (path: string) => {
      if (path.includes('/tihc')) {
        return {
          category: 'AskAric[TiHC]',
          categoryId: 'DIC_kwDOE3Tswc4Crqyn' // 替换为实际的 TiHC category ID
        };
      } else if (path.includes('/motor')) {
        return {
          category: 'Motor',
          categoryId: 'DIC_kwDOE3Tswc4CskH9' // 替换为实际的 Motor category ID
        };
      } else if (path.includes('/skiing')) {
        return {
          category: 'Skiing',
          categoryId: 'DIC_kwDOE3Tswc4CskH2' // 替换为实际的 Skiing category ID
        };
      } else if (path.includes('/tennis')) {
        return {
          category: 'Tennis',
          categoryId: 'DIC_kwDOE3Tswc4CskHv' // 替换为实际的 Tennis category ID
        };
      } else if (path.includes('/coffee')) {
        return {
          category: 'Coffee',
          categoryId: 'DIC_kwDOE3Tswc4CskH-' // 替换为实际的 Coffee category ID
        };
      }
      return {
        category: 'Blog',
        categoryId: 'DIC_kwDOE3Tswc4CskIR'
      };
    };

    const categoryConfig = getCategoryConfig(route.path);

    // https://giscus.app/zh-CN
    giscusTalk(
      {
        repo: 'AricSu/aricsu.github.io',
        repoId: 'MDEwOlJlcG9zaXRvcnkzMjY0Mjk4ODk=',
        category: categoryConfig.category,
        categoryId: categoryConfig.categoryId,
        mapping: 'title', // 默认: `pathname`
        inputPosition: 'bottom', // 默认: `top`
        lang: 'en', // 默认: `zh-CN`
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