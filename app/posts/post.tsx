import type { Route } from "./+types/post";
import { Footer } from "@/components/common/Footer";
import { Header } from "@/components/common/Header";
import { mdxComponents } from "@/components/mdx/mdx-components";
import { defaultLng, supportedLngs } from "@/i18n/config";
import { getPostsSourceForLang } from "@/lib/source.posts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import browserCollections from "fumadocs-mdx:collections/browser";
import type { TOCItemType } from "fumadocs-core/toc";
import { InlineTOC } from "fumadocs-ui/components/inline-toc";
import { TOCProvider, TOCScrollArea } from "@fumadocs/ui/components/toc/index";
import { TOCItems } from "@fumadocs/ui/components/toc/default";
import { useTranslation } from "react-i18next";
import type { ReactNode } from "react";
import { Link } from "react-router";

type PostFrontmatter = {
  title: string;
  description?: string;
  date?: string | Date;
  author?: string;
  tags?: string[];
};

function formatDate(value: unknown, lang: string) {
  if (!value) return undefined;
  const date = value instanceof Date ? value : new Date(value as string);
  if (Number.isNaN(date.getTime())) return undefined;
  const locale = lang === "zh" ? "zh-CN" : "en-US";
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(date);
}

function PostLayout({
  lang,
  toc,
  children,
}: {
  lang: string;
  toc: TOCItemType[];
  children: ReactNode;
}) {
  const tocTitle = lang === "zh" ? "目录" : "On this page";

  return (
    <TOCProvider toc={toc}>
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_280px]">
        <div className="min-w-0">
          {toc.length ? (
            <div className="mb-6 xl:hidden">
              <InlineTOC items={toc}>{tocTitle}</InlineTOC>
            </div>
          ) : null}
          {children}
        </div>

        {toc.length ? (
          <aside className="hidden xl:block">
            <div className="sticky top-24">
              <div className="mb-3 text-sm font-medium text-fd-muted-foreground">
                {tocTitle}
              </div>
              <TOCScrollArea className="h-[calc(100vh-8rem)] pr-2">
                <TOCItems />
              </TOCScrollArea>
            </div>
          </aside>
        ) : null}
      </div>
    </TOCProvider>
  );
}

function PostCard({
  lang,
  backHref,
  backLabel,
  frontmatter,
  children,
}: {
  lang: string;
  backHref: string;
  backLabel: string;
  frontmatter: PostFrontmatter;
  children: ReactNode;
}) {
  const dateLabel = formatDate(frontmatter.date, lang);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="gap-3">
        <div className="flex items-center justify-between gap-4">
          <Button asChild variant="ghost" size="sm" className="-ml-2">
            <Link to={backHref}>← {backLabel}</Link>
          </Button>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-balance">
            {frontmatter.title}
          </h1>
          {frontmatter.description ? (
            <p className="text-fd-muted-foreground">{frontmatter.description}</p>
          ) : null}

          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-fd-muted-foreground">
            {dateLabel ? <span className="whitespace-nowrap">{dateLabel}</span> : null}
            {frontmatter.author ? (
              <>
                <span className="opacity-40">•</span>
                <span className="whitespace-nowrap">{frontmatter.author}</span>
              </>
            ) : null}
          </div>

          {frontmatter.tags?.length ? (
            <div className="flex flex-wrap gap-2">
              {frontmatter.tags.map((tag) => (
                <Badge key={tag}>{tag}</Badge>
              ))}
            </div>
          ) : null}
        </div>
      </CardHeader>

      <Separator />

      <CardContent className="pt-6">
        <article className="prose prose-neutral dark:prose-invert max-w-none">
          {children}
        </article>
      </CardContent>
    </Card>
  );
}

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
  component({ default: Mdx, frontmatter, toc }) {
    return (
      <>
        <title>{frontmatter.title}</title>
        <meta name="description" content={frontmatter.description} />
        <PostLayout lang="zh" toc={toc}>
          <PostCard
            lang="zh"
            backHref="/zh/posts"
            backLabel="返回 Posts"
            frontmatter={frontmatter as PostFrontmatter}
          >
            <Mdx components={mdxComponents} />
          </PostCard>
        </PostLayout>
      </>
    );
  },
});

const clientLoaderEn = browserCollections.postsEn.createClientLoader({
  id: "postsEn",
  component({ default: Mdx, frontmatter, toc }) {
    return (
      <>
        <title>{frontmatter.title}</title>
        <meta name="description" content={frontmatter.description} />
        <PostLayout lang="en" toc={toc}>
          <PostCard
            lang="en"
            backHref="/en/posts"
            backLabel="Back to Posts"
            frontmatter={frontmatter as PostFrontmatter}
          >
            <Mdx components={mdxComponents} />
          </PostCard>
        </PostLayout>
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
      <Header />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-7xl px-4 py-10">
          <Content />
        </div>
      </main>
      <Footer />
    </>
  );
}
