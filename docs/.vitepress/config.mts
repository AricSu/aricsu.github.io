import { defineConfig } from 'vitepress'
import { figure } from '@mdit/plugin-figure'

import  { tidbDocSideBarZh }  from './sidebar_tidb_zh';
import { tidbDocSideBarEn } from './sidebar_tidb_en';
import { englishDocEnSideBar } from './sidebar_english_en';
import { englishDocZhSideBar } from './sidebar_english_zh';
import {lifeEnDropDown, lifeZhDropDown, DocEnDropDown, DocZhDropDown} from './dropDownBar';


export default defineConfig({
  themeConfig: {
    search: {
      provider: 'local'
    }
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
                { text: '首页', link: '/zh/about'},
                DocZhDropDown,
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
});

