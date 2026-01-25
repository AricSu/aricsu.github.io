import type { Route } from "./+types/sitemap.xml";
import { supportedLngs } from "@/i18n/config";
import { getPostsSourceForLang } from "@/lib/source.posts";
import { getTihcSourceForLang } from "@/lib/source.tihc";
import { getTidbSourceForLang } from "@/lib/source.tidb";

function escapeXml(input: string) {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function asPath(input: string) {
  if (input.startsWith("/")) return input;
  return `/${input}`;
}

export async function loader({ request }: Route.LoaderArgs) {
  const origin = new URL(request.url).origin;

  const paths = new Set<string>();
  for (const lang of supportedLngs) {
    paths.add(`/${lang}`);
    paths.add(`/${lang}/about`);

    const tihcSource = getTihcSourceForLang(lang);
    for (const page of tihcSource.getPages()) paths.add(asPath(page.url));

    const tidbSource = getTidbSourceForLang(lang);
    for (const page of tidbSource.getPages()) paths.add(asPath(page.url));

    const postsSource = getPostsSourceForLang(lang);
    paths.add(`/${lang}/posts`);
    for (const page of postsSource.getPages()) paths.add(asPath(page.url));
  }

  const urls = [...paths]
    .sort()
    .map((path) => `<url><loc>${escapeXml(`${origin}${path}`)}</loc></url>`)
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

export default function SitemapXml() {
  return null;
}
