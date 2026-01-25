import type { Route } from "./+types/lang-layout";
import { Outlet, redirect, useLoaderData } from "react-router";
import { supportedLngs, defaultLng, detectUserLanguage } from "@/i18n/config";
import i18n from "@/i18n/i18n";
import { useEffect } from "react";

function normalizeLang(input: unknown): string {
  if (typeof input !== "string") return "";
  if (supportedLngs.includes(input as (typeof supportedLngs)[number])) return input;
  return "";
}

export async function loader({ params, request }: Route.LoaderArgs) {
  const paramLang = params.lang;
  const detected = detectUserLanguage(request);
  const lang = normalizeLang(paramLang) || detected || defaultLng;

  if (paramLang !== lang) {
    const url = new URL(request.url);
    const rest = url.pathname.replace(/^\/[^/]+/, "");
    return redirect(`/${lang}${rest}${url.search}${url.hash}`);
  }

  if (i18n.language !== lang) {
    await i18n.changeLanguage(lang);
  }

  return { lang };
}

export default function LangLayout() {
  const { lang } = useLoaderData<typeof loader>();

  useEffect(() => {
    if (i18n.language !== lang) {
      void i18n.changeLanguage(lang);
    }
  }, [lang]);

  return <Outlet />;
}
