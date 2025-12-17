import type { Config } from "@react-router/dev/config";
// Import 'prerender' from its correct module if available, or define it here if needed

export default {
  // return a list of URLs to prerender at build time
  async prerender() {
    return ["/", "/en", "/zh", "/en/docs", "/zh/docs"];
  },
} satisfies Config;
