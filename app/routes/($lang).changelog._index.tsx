import { Link, useParams, useLoaderData } from "react-router";

export interface ChangelogMeta {
  slug: string;
  title: string;
  date: string;
  summary?: string;
}

export async function clientLoader({ params }: { params: { lang?: string } }) {
  const lang = params.lang || "zh";
  const res = await fetch(`/changelog/${lang}/index.json`);
  if (!res.ok) return [];
  return (await res.json()) as ChangelogMeta[];
}

export default function ChangelogIndex() {
  const posts = useLoaderData() as ChangelogMeta[];
  const { lang } = useParams();
  return (
    <section className="max-w-2xl mx-auto py-16">
      <h1 className="text-3xl font-bold mb-8">{lang === "en" ? "Changelog" : lang === "zh" ? "更新日志" : "Changelog"}</h1>
      <div className="space-y-6">
        {posts.map((post) => (
          <Link
            key={post.slug}
            to={`/${lang ? lang + "/" : ""}changelog/${post.slug}`}
            className="block rounded-xl border bg-card p-6 shadow-sm hover:bg-accent/30 transition"
          >
            <h2 className="text-xl font-semibold mb-2 text-foreground">{post.title}</h2>
            <div className="text-xs text-muted-foreground mb-2">{post.date}</div>
            <p className="text-muted-foreground">{post.summary}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
