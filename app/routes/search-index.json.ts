import type { Route } from "./+types/search-index.json";
import { createSearchAPI, type Index } from "fumadocs-core/search/server";
import path from "node:path";
import { promises as fs } from "node:fs";
import { createCjkTokenizer } from "../lib/search/cjk-tokenizer";

type Frontmatter = {
  title?: string;
  description?: string;
};

async function walkFiles(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const results: string[] = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) results.push(...(await walkFiles(fullPath)));
    else results.push(fullPath);
  }
  return results;
}

function parseFrontmatter(markdown: string): { frontmatter: Frontmatter; body: string } {
  const trimmed = markdown.trimStart();
  if (!trimmed.startsWith("---")) return { frontmatter: {}, body: markdown };
  const end = trimmed.indexOf("\n---", 3);
  if (end === -1) return { frontmatter: {}, body: markdown };

  const header = trimmed.slice(3, end).trim();
  const body = trimmed.slice(end + "\n---".length);

  const frontmatter: Frontmatter = {};
  for (const line of header.split("\n")) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim().replace(/^"|"$/g, "");
    if (key === "title") frontmatter.title = value;
    if (key === "description") frontmatter.description = value;
  }
  return { frontmatter, body };
}

function stripMarkdown(input: string) {
  return (
    input
      // code blocks
      .replace(/```[\s\S]*?```/g, " ")
      // inline code
      .replace(/`[^`]*`/g, " ")
      // md links/images -> text
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      // headings/quotes/list markers
      .replace(/^\s{0,3}#{1,6}\s+/gm, "")
      .replace(/^\s{0,3}>\s+/gm, "")
      .replace(/^\s*[-*+]\s+/gm, "")
      .replace(/^\s*\d+\.\s+/gm, "")
      // html tags
      .replace(/<[^>]+>/g, " ")
      // collapse whitespace
      .replace(/\s+/g, " ")
      .trim()
  );
}

function slugsFromAbsolutePath(absPath: string, baseDir: string) {
  const rel = path.relative(baseDir, absPath).replaceAll(path.sep, "/");
  const withoutExt = rel.replace(/\.(mdx|md)$/i, "");
  const parts = withoutExt.split("/").filter(Boolean);
  if (parts.length === 1 && parts[0] === "index") return [];
  if (parts.at(-1) === "index") return parts.slice(0, -1);
  return parts;
}

function urlFor(baseUrl: string, slugs: string[]) {
  if (slugs.length === 0) return baseUrl;
  return `${baseUrl}/${slugs.map(encodeURIComponent).join("/")}`;
}

async function buildIndexes(): Promise<Index[]> {
  const root = process.cwd();

  const plan: Array<{
    baseDir: string;
    baseUrl: string;
  }> = [];

  plan.push({
    baseDir: path.join(root, "content", "docs", "tihc-zh"),
    baseUrl: "/zh/tihc",
  });
  plan.push({
    baseDir: path.join(root, "content", "docs", "tihc-en"),
    baseUrl: "/en/tihc",
  });
  plan.push({
    baseDir: path.join(root, "content", "docs", "tidb-zh"),
    baseUrl: "/zh/tidb",
  });
  plan.push({
    baseDir: path.join(root, "content", "docs", "tidb-en"),
    baseUrl: "/en/tidb",
  });
  plan.push({
    baseDir: path.join(root, "content", "posts", "zh"),
    baseUrl: "/zh/posts",
  });
  plan.push({
    baseDir: path.join(root, "content", "posts", "en"),
    baseUrl: "/en/posts",
  });

  const indexes: Index[] = [];
  const seen = new Set<string>();

  for (const { baseDir, baseUrl } of plan) {
    const files = (await walkFiles(baseDir)).filter((f) => /\.(mdx|md)$/i.test(f));
    for (const file of files) {
      const markdown = await fs.readFile(file, "utf8");
      const { frontmatter, body } = parseFrontmatter(markdown);
      const slugs = slugsFromAbsolutePath(file, baseDir);
      const url = urlFor(baseUrl, slugs);
      if (seen.has(url)) continue;
      seen.add(url);

      const title =
        frontmatter.title ??
        slugs.at(-1) ??
        url.split("/").filter(Boolean).at(-1) ??
        url;
      const description = frontmatter.description;

      indexes.push({
        title,
        description,
        breadcrumbs: undefined,
        url,
        content: stripMarkdown(body),
        keywords: undefined,
      });
    }
  }

  return indexes;
}

export async function loader({}: Route.LoaderArgs) {
  const search = createSearchAPI("simple", {
    indexes: buildIndexes,
    tokenizer: createCjkTokenizer(),
  });
  return search.staticGET();
}

export default function SearchIndexJson() {
  return null;
}
