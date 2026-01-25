import type { Route } from "./+types/page";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { defaultLng, supportedLngs } from "@/i18n/config";
import { getPostsSourceForLang } from "@/lib/source.posts";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";

type PostListItem = {
  url: string;
  title: string;
  description?: string;
  date?: string;
  author?: string;
  tags?: string[];
};

export async function loader({ params }: Route.LoaderArgs) {
  const lang =
    typeof params.lang === "string" &&
    supportedLngs.includes(params.lang as (typeof supportedLngs)[number])
      ? params.lang
      : defaultLng;

  const source = getPostsSourceForLang(lang);
  const posts = [...source.getPages()]
    .sort((a, b) => {
      const aValue = (a.data as { date?: unknown }).date;
      const bValue = (b.data as { date?: unknown }).date;
      const aDate = aValue ? new Date(aValue as string | number | Date).getTime() : 0;
      const bDate = bValue ? new Date(bValue as string | number | Date).getTime() : 0;
      return bDate - aDate;
    })
    .map(
      (post): PostListItem => ({
        url: post.url,
        title: (post.data as { title: string }).title,
        description: (post.data as { description?: string }).description,
        date: (() => {
          const value = (post.data as { date?: unknown }).date;
          if (value instanceof Date) return value.toISOString();
          if (typeof value === "string") return value;
          return undefined;
        })(),
        author: (post.data as { author?: string }).author,
        tags: (post.data as { tags?: string[] }).tags,
      }),
    );

  return { lang, posts };
}

export default function PostsIndex({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation();
  return (
    <>
      <Header className="hidden md:block" />
      <main className="flex-1">
        <div className="container mx-auto max-w-5xl px-4 py-10">
          <header className="mb-8">
            <p className="text-sm text-fd-muted-foreground">
              {t("common.posts", "Posts")}
            </p>
            <h1 className="text-3xl font-bold tracking-tight">
              {t("common.posts", "Posts")}
            </h1>
            <p className="mt-2 text-fd-muted-foreground">
              {t(
                "posts.description",
                "Short notes, troubleshooting writeups, and project updates.",
              )}
            </p>
          </header>

          <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
          {loaderData.posts.map((post) => (
            <Link
              key={post.url}
              to={post.url}
              className="group rounded-2xl border border-border bg-fd-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="font-semibold leading-snug group-hover:underline underline-offset-4">
                    {post.title}
                  </div>
                  {post.description ? (
                    <div className="text-sm text-fd-muted-foreground mt-2 line-clamp-2">
                      {post.description}
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-fd-muted-foreground">
                {post.date ? (
                  <span className="whitespace-nowrap">
                    {new Date(post.date).toDateString()}
                  </span>
                ) : null}
                {post.author ? (
                  <>
                    <span className="opacity-40">•</span>
                    <span className="whitespace-nowrap">{post.author}</span>
                  </>
                ) : null}
              </div>

              {post.tags?.length ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-border bg-fd-accent px-2.5 py-1 text-xs text-fd-accent-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}

              <div className="mt-5 text-sm font-medium text-fd-primary">
                {t("posts.readMore", "Read more")}{" "}
                <span className="transition-transform group-hover:translate-x-0.5">
                  →
                </span>
              </div>
            </Link>
          ))}
        </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
