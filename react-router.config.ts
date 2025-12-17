
import type { Config } from "@react-router/dev/config";
import fs from "fs";
import path from "path";

/**
 * 递归扫描目录，收集所有 .md 文件的相对路径
 */
function walkMarkdownFiles(dir: string, callback: (rel: string) => void, relPath = ""): void {
  for (const entry of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, entry);
    const rel = relPath ? path.join(relPath, entry) : entry;
    if (fs.statSync(fullPath).isDirectory()) {
      walkMarkdownFiles(fullPath, callback, rel);
    } else if (entry.endsWith(".md")) {
      callback(rel);
    }
  }
}

/**
 * 自动生成所有静态化路由
 * 支持 /{lang}/{type}/.../{slug}，多级 slug
 */

export default {
  ssr: false,
  prerender: async () => {
    const langs = fs.readdirSync(path.join(process.cwd(), "content"))
      .filter(f => fs.statSync(path.join(process.cwd(), "content", f)).isDirectory());
    const routes = ["/", "/zh", "/en"];
    for (const lang of langs) {
      const langDir = path.join(process.cwd(), "content", lang);
      const types = fs.readdirSync(langDir).filter(type => fs.statSync(path.join(langDir, type)).isDirectory());
      for (const type of types) {
        const typeDir = path.join(langDir, type);
        // 递归扫描 typeDir 下所有 md 文件
        walkMarkdownFiles(typeDir, (rel: string) => {
          const slugPath = rel.replace(/\.md$/, "").split(path.sep).map(encodeURIComponent).join("/");
          routes.push(`/${lang}/${type}/${slugPath}`);
        });
        routes.push(`/${lang}/${type}`);
      }
    }
    return routes;
  }
} satisfies Config;

