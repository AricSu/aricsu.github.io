// .vitepress/data/footerData.ts
import type { FooterData } from '@theojs/lumen'

export const Footer_Data: FooterData = {
  beian: { icp: '备案号 : 辽ICP备19006373号-3', police: '公网安备号', showIcon: true },
  author: { name: 'Aric', link: 'https://github.com/aricSu' },
  group: [
    {
      title: '外部链接',
      icon: 'bx:link', // `iconify`图标
      style: 'rgba(255, 87, 51, 1)',
      links: [
        { name: '示例1', href: 'https://', icon: 'solar:book-bold' },
        { name: '示例2', href: 'https://' }
      ]
    },
    {
      title: '内部链接',
      target: '_self', // `target`默认打开方式为 _blank , 为 _self 时不会显示外部链接图标
      icon: 'bx:link',
      style: 'rgba(255, 87, 51, 1)',
      links: [
        { name: '示例1', icon: 'solar:book-bold', href: '/docs' },
        { name: '示例2', href: '/page' }
      ]
    }
  ]
}