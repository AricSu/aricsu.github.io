# askaric

This is a React Router application generated with
[Create Fumadocs](https://github.com/fuma-nama/fumadocs).

Run development server:

```bash
npm run dev
# or
pnpm dev
# or
yarn dev
```

## Local preview

```bash
npm run build
npm run start:server # SSR (build/server)
npm run start:client # static prerender output (build/client)
```

Notes:
- Static search uses `build/client/search-index.json` (generated at build time, includes CJK tokenizer), no server API required.

## Google Analytics (GA4)

Set `VITE_GA_MEASUREMENT_ID` (example: `G-XXXXXXXXXX`) to enable GA4 pageview tracking (SPA navigations included).

## Google Search Console

- If you're using a Domain property (DNS verification), no extra HTML meta tag is needed.
- `GET /sitemap.xml` and `GET /robots.txt` are available for Search Console discovery.

Tip: start from `askaric/.env.example`.

## Analytics events

Events are sent via GA4 `gtag()` when `VITE_GA_MEASUREMENT_ID` is configured.

- `cta_clicked`: add `data-analytics-event="cta_clicked"` and optional `data-analytics-location="..."` on a clickable element.
- `site_search`: auto-tracked when the client calls `/api/search/*?query=...` (includes `results_count` when available).
- `file_downloaded`: auto-tracked for `<a download>` or links ending with common archive/binary extensions.
- `outbound_link_clicked`: auto-tracked for links pointing to a different origin.
