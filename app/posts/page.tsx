import type { Route } from "./+types/page";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { defaultLng, supportedLngs } from "@/i18n/config";
import { getPostsSourceForLang } from "@/lib/source.posts";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type PostListItem = {
  url: string;
  title: string;
  description?: string;
  date?: string;
  author?: string;
  tags?: string[];
};

function formatDate(value: string, lang: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const locale = lang === "zh" ? "zh-CN" : "en-US";
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(date);
}

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
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return loaderData.posts;
    return loaderData.posts.filter((p) => {
      const haystack = [
        p.title,
        p.description ?? "",
        ...(p.tags ?? []),
        p.author ?? "",
      ]
        .join("\n")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [loaderData.posts, query]);

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="container mx-auto max-w-5xl px-4 py-10">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <header>
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

            <div className="w-full sm:max-w-xs">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("posts.searchPlaceholder", "Search posts...")}
                aria-label={t("posts.searchPlaceholder", "Search posts...")}
              />
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-border bg-fd-card p-6 text-sm text-fd-muted-foreground">
              {t("posts.empty", "No posts found.")}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
              {filtered.map((post) => (
                <Link key={post.url} to={post.url} className="group block">
                  <Card className="transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md">
                    <CardHeader>
                      <CardTitle className="leading-snug group-hover:underline underline-offset-4">
                        {post.title}
                      </CardTitle>
                      {post.description ? (
                        <CardDescription className="line-clamp-2">
                          {post.description}
                        </CardDescription>
                      ) : null}
                    </CardHeader>

                    <CardContent className="pt-0">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-fd-muted-foreground">
                        {post.date ? (
                          <time dateTime={post.date} className="whitespace-nowrap">
                            {formatDate(post.date, loaderData.lang)}
                          </time>
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
                            <Badge key={tag} variant="default">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      ) : null}

                      <div className="mt-5 text-sm font-medium text-fd-primary">
                        {t("posts.readMore", "Read more")}{" "}
                        <span className="transition-transform group-hover:translate-x-0.5">
                          →
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
