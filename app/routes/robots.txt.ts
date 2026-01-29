import type { Route } from "./+types/robots.txt";

export function loader({ request }: Route.LoaderArgs) {
  const origin = new URL(request.url).origin;

  return new Response(`User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

// Resource route: no default export.
