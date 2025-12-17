import fs from "fs";
import path from "path";

const contentRoot = path.resolve(__dirname, "../../content");
const publicRoot = path.resolve(__dirname, "../../public");

function parseFrontmatter(md: string): { title?: string; date?: string; summary?: string; content: string } {
  const match = md.match(/^---([\s\S]*?)---/);
  let meta: Record<string, string> = {};
  let content = md;
  if (match) {
    const fm = match[1];
    content = md.slice(match[0].length).trim();
    fm.split("\n").forEach(line => {
      const [k, ...v] = line.split(":");
      if (k && v.length) meta[k.trim()] = v.join(":").trim();
    });
  }
  return {
    title: meta.title,
    date: meta.date,
    summary: meta.summary,
    content,
  };
}

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function generateForLang(lang: string) {
  const postsDir = path.join(contentRoot, lang, "posts");
  const outDir = path.join(publicRoot, lang, "blog");
  ensureDir(outDir);
  const files = fs.readdirSync(postsDir).filter(f => f.endsWith(".md"));
  const metas: Array<{slug: string; title: string; date: string; summary: string}> = [];
  for (const file of files) {
    const src = path.join(postsDir, file);
    const dest = path.join(outDir, file);
    const md = fs.readFileSync(src, "utf-8");
    fs.writeFileSync(dest, md, "utf-8");
    const meta = parseFrontmatter(md);
    const slug = file.replace(/\.md$/, "");
    metas.push({
      slug,
      title: meta.title || slug,
      date: meta.date || "",
      summary: meta.summary || "",
    });
  }
  fs.writeFileSync(path.join(outDir, "index.json"), JSON.stringify(metas, null, 2), "utf-8");
}

export function generateBlogStatic() {
  const langs = fs.readdirSync(contentRoot).filter(f => fs.statSync(path.join(contentRoot, f)).isDirectory());
  langs.forEach(generateForLang);
  // eslint-disable-next-line no-console
  console.log("Blog content generated to public/{lang}/blog/");
}
