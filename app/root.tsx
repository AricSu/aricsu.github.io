import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useLocation,
} from 'react-router';
import { RootProvider } from 'fumadocs-ui/provider/react-router';
import { ToastProvider } from './components/ui/toast-provider';
import type { Route } from './+types/root';
import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import { AnalyticsListener } from "@/components/analytics/analytics-listener";
import { getPublicEnv } from "@/lib/public-env";
import { StaticSearchDialog } from "@/components/search/StaticSearchDialog";
import { getCanonicalOrigin, normalizeCanonicalPath } from "@/lib/canonical";
import './app.css';
import "katex/dist/katex.min.css";

export const links: Route.LinksFunction = () => [
  { rel: 'icon', href: '/favicon.ico', type: 'image/x-icon', sizes: '48x48' },
  { rel: 'icon', href: '/favicon-48.png', type: 'image/png', sizes: '48x48' },
  { rel: 'icon', href: '/favicon-192.png', type: 'image/png', sizes: '192x192' },
  { rel: 'apple-touch-icon', href: '/apple-touch-icon.png', sizes: '180x180' },
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous',
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap',
  },
];

export async function loader({ request }: Route.LoaderArgs) {
  return { canonicalOrigin: getCanonicalOrigin(request) };
}

export function Layout({ children }: { children: React.ReactNode }) {
  const { gaMeasurementId, gscSiteVerification } = getPublicEnv();
  const rootLoaderData = useLoaderData<typeof loader>() as
    | { canonicalOrigin?: string }
    | undefined;
  const location = useLocation();
  const canonicalPath = normalizeCanonicalPath(location.pathname);
  const canonicalOrigin =
    rootLoaderData?.canonicalOrigin ??
    (typeof window !== "undefined" ? window.location.origin : undefined);
  const canonicalHref = canonicalOrigin ? `${canonicalOrigin}${canonicalPath}` : undefined;
  const isChinese = canonicalPath === "/zh" || canonicalPath.startsWith("/zh/");
  const htmlLang = isChinese ? "zh" : "en";

  const defaultTitle = "AskAric";
  const defaultDescription = "Docs, notes, and posts.";
  const ogImageUrl = canonicalOrigin
    ? `${canonicalOrigin}/images/hero/hero.jpg`
    : "/images/hero/hero.jpg";

  return (
    <html lang={htmlLang} suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {gscSiteVerification ? (
          <meta name="google-site-verification" content={gscSiteVerification} />
        ) : null}
        {gaMeasurementId ? (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
            />
            <script
              // biome-ignore lint/security/noDangerouslySetInnerHtml: Required for GA bootstrapping.
              dangerouslySetInnerHTML={{
                __html: [
                  "window.dataLayer = window.dataLayer || [];",
                  "function gtag(){window.dataLayer.push(arguments);}",
                  "window.gtag = window.gtag || gtag;",
                  "gtag('js', new Date());",
                  `gtag('config', '${gaMeasurementId}', { send_page_view: false });`,
                ].join("\n"),
              }}
            />
          </>
        ) : null}
        {canonicalHref ? <link rel="canonical" href={canonicalHref} /> : null}
        <meta property="og:site_name" content={defaultTitle} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={defaultTitle} />
        <meta property="og:description" content={defaultDescription} />
        {canonicalHref ? <meta property="og:url" content={canonicalHref} /> : null}
        <meta property="og:image" content={ogImageUrl} />
        <meta property="og:locale" content={isChinese ? "zh_CN" : "en_US"} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={defaultTitle} />
        <meta name="twitter:description" content={defaultDescription} />
        <meta name="twitter:image" content={ogImageUrl} />
        <Meta />
        <Links />
      </head>
      <body className="flex flex-col min-h-screen">
        <RootProvider
          search={{
            SearchDialog: StaticSearchDialog,
            options: { api: "/search-index.json" },
          }}
        >
          <ToastProvider>{children}</ToastProvider>
        </RootProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <>
      <GoogleAnalytics />
      <AnalyticsListener />
      <Outlet />
    </>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = 'Oops!';
  let details = 'An unexpected error occurred.';
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? '404' : 'Error';
    details =
      error.status === 404 ? 'The requested page could not be found.' : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 w-full max-w-[1400px] mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
