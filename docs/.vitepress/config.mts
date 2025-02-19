import { defineConfig } from 'vitepress'
import { figure } from '@mdit/plugin-figure'

import  { tidbDocSideBarZh }  from './sidebar_tidb_zh';
import { tidbDocSideBarEn } from './sidebar_tidb_en';
import { englishDocEnSideBar } from './sidebar_english_en';
import { englishDocZhSideBar } from './sidebar_english_zh';
import {lifeEnDropDown, lifeZhDropDown, DocEnDropDown, DocZhDropDown} from './dropDownBar';

// For RSS
import { RssPlugin, RSSOptions } from 'vitepress-plugin-rss'
const baseUrl = 'https://askaric.com'
const RSS: RSSOptions = {
  title: 'Ask Aric',
  baseUrl,
  copyright: 'Copyright (c) 2016-present, Ask Aric',
}



export default defineConfig({
  head: [['link', {rel: 'icon', href: '/logo.png'}]],
  themeConfig: {
    logo: '/logo.png',
    search: {
      provider: 'local'
    },
    socialLinks: [
        { icon: "github", link: "https://github.com/jansu-dev/Jan-Blog" },
        { icon: "linkedin", link: "https://www.linkedin.com/in/zhipeng-su-2282b3217/"},
        { icon: "youtube", link: "https://www.youtube.com/@askaric"},
        { icon: "bilibili", link: "https://space.bilibili.com/318184941"},
    ],
  },
  locales: {
    en: {
        lang: 'en',
        label: 'English',
        title: 'AskAric',
        themeConfig: { 
            nav: [
                { text: 'Home', link: '/en/index'},
                DocEnDropDown,
                { text: 'TiHC Doc', link: '/en/tihc/index'},
                lifeEnDropDown,
                { text: 'About', link: '/en/about'},
                // languageEnDropDown
                ],
            sidebar: {
                  '/en/tidb/': tidbDocSideBarEn,
                  '/en/english/': englishDocEnSideBar
              },
        }
    },
    zh: {
        lang: 'zh',
        title: 'AskAric',
        label: '简体中文',
        themeConfig: {
            nav: [
                { text: '首页', link: '/zh/index'},
                DocZhDropDown,
                { text: 'TiHC 文档', link: '/zh/tihc/index'},
                lifeZhDropDown,
                { text: '关于 Aric', link: '/zh/about'},
            ],
            sidebar: {
                '/zh/tidb/': tidbDocSideBarZh,
                // '/zh/oracle/': oracleZHDocSidebar,
                // '/zh/sqlserver/': sqlServerZHDocSideBar,
                '/zh/english/': englishDocZhSideBar
            },
        }
      }
  },

  // For PIC css
  markdown: {
    config: (md) => { 
      md.use(figure, { figcaption: 'alt', copyAttrs: '^class$', lazy: true }) 
    } 
  },

  // For RSS
  vite: {
    plugins: [RssPlugin(RSS)]
  }
});

