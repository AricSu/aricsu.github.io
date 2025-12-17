import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useParams,
} from "react-router";
import type { LinksFunction } from "react-router";
import { Header } from "~/components/Header";
import { Footer } from "~/components/Footer";
import { ToastProvider } from "./components/ui/toast-provider";
import { useEffect } from "react";
import i18n from "~/i18n/i18n";
import stylesheet from "./assets/tailwind.css?url";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
];

export default function App() {
  const params = useParams();
  useEffect(() => {
    if (params.lang && i18n.language !== params.lang) {
      i18n.changeLanguage(params.lang);
    }
  }, [params.lang]);
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Title/meta handled by <Meta /> from route meta exports */}
        <link rel="icon" href="data:image/x-icon;base64,AA" />
        <Meta />
        <Links />
      </head>
      <body className="min-h-screen flex flex-col bg-background text-foreground">
        <ToastProvider>
          <Header />
          <main className="flex-1">
            <Outlet />
          </main>
          <Footer />
        </ToastProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
