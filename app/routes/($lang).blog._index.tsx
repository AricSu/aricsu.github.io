import { Link, useLoaderData, useParams } from "react-router";
import type { BlogPostMeta } from "~/utils/blog.server";
import { getAllPosts } from "~/utils/blog.server";

export function loader({ params }: { params: { lang?: string } }) {
  return getAllPosts(params.lang || "zh");
}

export default function BlogIndex() {
  const posts = useLoaderData() as BlogPostMeta[];
  const { lang } = useParams();
  return (
    <section className="max-w-2xl mx-auto py-16">
      <h1 className="text-3xl font-bold mb-8">{lang === "en" ? "Blog" : lang === "zh" ? "博客" : "Blog"}</h1>
      <div className="space-y-6">
        {posts.map((post) => (
          <Link
            key={post.slug}
            to={`/${lang ? lang + "/" : ""}blog/${post.slug}`}
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
