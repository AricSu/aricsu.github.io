import type { Route } from "./+types/post";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { defaultLng, supportedLngs } from "@/i18n/config";
import { getPostsSourceForLang } from "@/lib/source.posts";
import defaultMdxComponents from "fumadocs-ui/mdx";
import browserCollections from "fumadocs-mdx:collections/browser";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";

export async function loader({ params }: Route.LoaderArgs) {
  const lang =
    typeof params.lang === "string" &&
    supportedLngs.includes(params.lang as (typeof supportedLngs)[number])
      ? params.lang
      : defaultLng;
  const slug = params.slug;
  if (typeof slug !== "string" || slug.length === 0)
    throw new Response("Not found", { status: 404 });

  const source = getPostsSourceForLang(lang);
  const page = source.getPage([slug]);
  if (!page) throw new Response("Not found", { status: 404 });

  return { lang, path: page.path };
}

const clientLoaderZh = browserCollections.postsZh.createClientLoader({
  id: "postsZh",
  component({ default: Mdx, frontmatter }) {
    return (
      <>
        <title>{frontmatter.title}</title>
        <meta name="description" content={frontmatter.description} />
        <div className="mb-6">
          <Link
            to="/zh/posts"
            className="text-sm text-fd-muted-foreground hover:text-fd-foreground"
          >
            ← 返回 Posts
          </Link>
        </div>
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">{frontmatter.title}</h1>
          {frontmatter.description ? (
            <p className="mt-3 text-fd-muted-foreground">{frontmatter.description}</p>
          ) : null}
          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-fd-muted-foreground">
            {frontmatter.date ? (
              <span className="whitespace-nowrap">
                {new Date(frontmatter.date).toDateString()}
              </span>
            ) : null}
            {frontmatter.author ? (
              <>
                <span className="opacity-40">•</span>
                <span className="whitespace-nowrap">{frontmatter.author}</span>
              </>
            ) : null}
            {frontmatter.tags?.length ? (
              <>
                <span className="opacity-40">•</span>
                <span className="flex flex-wrap gap-2">
                  {frontmatter.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-border bg-fd-accent px-2.5 py-1 text-xs text-fd-accent-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </span>
              </>
            ) : null}
          </div>
        </header>
        <article className="prose prose-neutral dark:prose-invert max-w-none">
          <Mdx components={{ ...defaultMdxComponents }} />
        </article>
      </>
    );
  },
});

const clientLoaderEn = browserCollections.postsEn.createClientLoader({
  id: "postsEn",
  component({ default: Mdx, frontmatter }) {
    return (
      <>
        <title>{frontmatter.title}</title>
        <meta name="description" content={frontmatter.description} />
        <div className="mb-6">
          <Link
            to="/en/posts"
            className="text-sm text-fd-muted-foreground hover:text-fd-foreground"
          >
            ← Back to Posts
          </Link>
        </div>
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">{frontmatter.title}</h1>
          {frontmatter.description ? (
            <p className="mt-3 text-fd-muted-foreground">{frontmatter.description}</p>
          ) : null}
          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-fd-muted-foreground">
            {frontmatter.date ? (
              <span className="whitespace-nowrap">
                {new Date(frontmatter.date).toDateString()}
              </span>
            ) : null}
            {frontmatter.author ? (
              <>
                <span className="opacity-40">•</span>
                <span className="whitespace-nowrap">{frontmatter.author}</span>
              </>
            ) : null}
            {frontmatter.tags?.length ? (
              <>
                <span className="opacity-40">•</span>
                <span className="flex flex-wrap gap-2">
                  {frontmatter.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-border bg-fd-accent px-2.5 py-1 text-xs text-fd-accent-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </span>
              </>
            ) : null}
          </div>
        </header>
        <article className="prose prose-neutral dark:prose-invert max-w-none">
          <Mdx components={{ ...defaultMdxComponents }} />
        </article>
      </>
    );
  },
});

export default function PostPage({ loaderData }: Route.ComponentProps) {
  useTranslation();
  const clientLoader = loaderData.lang === "en" ? clientLoaderEn : clientLoaderZh;
  const Content = clientLoader.getComponent(loaderData.path);

  return (
    <>
      <Header className="hidden md:block" />
      <main className="flex-1">
        <div className="container mx-auto max-w-4xl px-4 py-10">
          <div className="rounded-2xl border border-border bg-fd-card p-6 shadow-sm md:p-10">
            <Content />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
