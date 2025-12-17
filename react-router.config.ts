import type { Config } from "@react-router/dev/config";

export default {
  // 启用 SSR 以支持预渲染
  ssr: true,
  // 预渲染的路由列表 - SEO 友好！
  prerender: ["/", "/zh", "/en"],
} satisfies Config;
