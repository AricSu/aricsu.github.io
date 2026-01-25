import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from 'react-router';
import { RootProvider } from 'fumadocs-ui/provider/react-router';
import { ToastProvider } from './components/ui/toast-provider';
import type { Route } from './+types/root';
import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import { AnalyticsListener } from "@/components/analytics/analytics-listener";
import { getPublicEnv } from "@/lib/public-env";
import { StaticSearchDialog } from "@/components/search/StaticSearchDialog";
import './app.css';
import './i18n/i18n';

export const links: Route.LinksFunction = () => [
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

export function Layout({ children }: { children: React.ReactNode }) {
  const { gaMeasurementId, gscSiteVerification } = getPublicEnv();

  return (
    <html lang="en" suppressHydrationWarning>
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
