import { index, route, type RouteConfig } from '@react-router/dev/routes';

export default [
  route("sitemap.xml", "routes/sitemap.xml.ts"),
  route("robots.txt", "routes/robots.txt.ts"),
  route("search-index.json", "routes/search-index.json.ts"),
  index('routes/root-redirect.tsx'),
  route(':lang', 'routes/lang-layout.tsx', [
    index('routes/home.tsx'),
    route('about', 'routes/about.tsx'),
    route('tihc/*', 'tihc/page.tsx'),
    route('tidb/*', 'tidb/page.tsx'),
    route('posts', 'posts/page.tsx'),
    route('posts/:slug', 'posts/post.tsx'),
    route('api/search/tihc', 'tihc/search.ts'),
    route('api/search/tidb', 'tidb/search.ts'),
  ]),
  route('tihc/*', 'routes/legacy-redirect-tihc.tsx'),
  route('tidb/*', 'routes/legacy-redirect-tidb.tsx'),
  route('posts/*', 'routes/legacy-redirect-posts.tsx'),
  route('about', 'routes/legacy-redirect-about.tsx'),
  route('api/search/tihc', 'routes/search-redirect-tihc.tsx'),
  route('api/search/tidb', 'routes/search-redirect-tidb.tsx'),
] satisfies RouteConfig;
