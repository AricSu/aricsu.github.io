import { useLoaderData, useParams } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import ReactMarkdown from "react-markdown";

export interface ChangelogPost {
  slug: string;
  title: string;
  date: string;
  summary?: string;
  content: string;
}

function parseFrontmatter(md: string): ChangelogPost {
  const match = md.match(/^---([\s\S]*?)---/);
  let meta: any = {};
  let content = md;
  if (match) {
    const fm = match[1];
    content = md.slice(match[0].length).trim();
    fm.split("\n").forEach((line) => {
      const [k, ...v] = line.split(":");
      if (k && v.length) meta[k.trim()] = v.join(":").trim();
    });
  }
  return {
    slug: meta.slug || "",
    title: meta.title || "",
    date: meta.date || "",
    summary: meta.summary || "",
    content,
  };
}

export async function clientLoader({ params }: LoaderFunctionArgs) {
  const lang = params.lang || "zh";
  const slug = params.slug!;
  const res = await fetch(`/changelog/${lang}/${slug}.md`);
  if (!res.ok) throw new Response("Not Found", { status: 404 });
  const md = await res.text();
  return parseFrontmatter(md);
}

export default function ChangelogPost() {
  const post = useLoaderData() as ChangelogPost;
  const { lang } = useParams();
  return (
    <article className="max-w-2xl mx-auto py-16">
      <h1 className="text-3xl font-bold mb-2 text-foreground">{post.title}</h1>
      <div className="text-xs text-muted-foreground mb-6">{post.date}</div>
      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <ReactMarkdown>{post.content}</ReactMarkdown>
      </div>
      <div className="mt-8 text-sm text-muted-foreground">
        当前语言: {lang || "默认"}
      </div>
    </article>
  );
}
