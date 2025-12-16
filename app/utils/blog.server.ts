import fs from "fs";
import path from "path";
import matter from "gray-matter";

export interface BlogPostMeta {
  slug: string;
  title: string;
  date: string;
  summary?: string;
}

export interface BlogPost extends BlogPostMeta {
  content: string;
}

function getBlogDir(lang: string) {
  return path.join(process.cwd(), "content", lang, "blog");
}

export function getAllPosts(lang: string): BlogPostMeta[] {
  const BLOG_DIR = getBlogDir(lang);
  if (!fs.existsSync(BLOG_DIR)) return [];
  const files = fs.readdirSync(BLOG_DIR);
  return files
    .filter((file) => file.endsWith(".md"))
    .map((file) => {
      const slug = file.replace(/\.md$/, "");
      const fullPath = path.join(BLOG_DIR, file);
      const fileContents = fs.readFileSync(fullPath, "utf8");
      const { data } = matter(fileContents);
      return {
        slug,
        title: data.title as string,
        date: typeof data.date === "string" ? data.date : data.date?.toISOString?.() ?? "",
        summary: data.summary as string,
      };
    });
}

export function getPostBySlug(slug: string, lang: string): BlogPost | null {
  const BLOG_DIR = getBlogDir(lang);
  const fullPath = path.join(BLOG_DIR, `${slug}.md`);
  if (!fs.existsSync(fullPath)) return null;
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);
  return {
    slug,
    title: data.title as string,
    date: typeof data.date === "string" ? data.date : data.date?.toISOString?.() ?? "",
    summary: data.summary as string,
    content,
  };
}
