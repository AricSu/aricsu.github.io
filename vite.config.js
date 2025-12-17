import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// // 自动同步 content 到 public/blog
// const callGenerateBlog = async () => {
//   try {
//     // 动态导入，避免 Vite 预构建问题
//     const mod = await import("./app/utils/generateBlog");
//     if (mod.generateBlogStatic) mod.generateBlogStatic();
//   } catch (e) {
//     // eslint-disable-next-line no-console
//     console.warn("[vite] generateBlogStatic failed", e);
//   }
// };

//     {
//       name: "generate-blog-content",
//       async buildStart() {
//         await callGenerateBlog();
//       },
//     },

export default defineConfig({
  plugins: [tailwindcss(), reactRouter()],
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "./app"),
    },
  },
});
