import { useLoaderData, useParams } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import ReactMarkdown from "react-markdown";
import { getPostBySlug } from "~/utils/blog.server";
import type { BlogPost } from "~/utils/blog.server";

export function loader({ params }: LoaderFunctionArgs) {
  const post = getPostBySlug(params.slug!, params.lang || "zh");
  if (!post) {
    throw new Response("Not Found", { status: 404 });
  }
  return post;
}

export default function BlogPost() {
  const post = useLoaderData() as BlogPost;
  const { lang } = useParams();
  return (
    <article className="max-w-2xl mx-auto py-16">
      <h1 className="text-3xl font-bold mb-2 text-foreground">{post.title}</h1>
      <div className="text-xs text-muted-foreground mb-6">{post.date}</div>
      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <ReactMarkdown>{post.content}</ReactMarkdown>
      </div>
      <div className="mt-8 text-sm text-muted-foreground">当前语言: {lang || "默认"}</div>
    </article>
  );
}
