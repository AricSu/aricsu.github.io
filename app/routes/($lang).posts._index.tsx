import { Link, useParams, useLoaderData } from "react-router";

export interface PostMeta {
  slug: string;
  title: string;
  date: string;
  summary?: string;
}

export async function clientLoader({ params }: { params: { lang?: string } }) {
  const lang = params.lang || "zh";
  const res = await fetch(`/posts/${lang}/index.json`);
  if (!res.ok) return [];
  return (await res.json()) as PostMeta[];
}

export default function PostsIndex() {
  const posts = useLoaderData() as PostMeta[];
  const { lang } = useParams();
  return (
    <section className="max-w-2xl mx-auto py-16">
      <h1 className="text-3xl font-bold mb-8">{lang === "en" ? "Posts" : lang === "zh" ? "文章" : "Posts"}</h1>
      <div className="space-y-6">
        {posts.map((post) => (
          <Link
            key={post.slug}
            to={`/${lang ? lang + "/" : ""}posts/${post.slug}`}
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
