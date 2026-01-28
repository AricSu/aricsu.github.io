import type { Route } from "./+types/lang-layout";
import { Outlet, redirect, useLoaderData } from "react-router";
import { supportedLngs, defaultLng, detectUserLanguage } from "@/i18n/config";
import { createI18nInstance } from "@/i18n/i18n";
import { I18nextProvider } from "react-i18next";
import { useMemo } from "react";

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

  return { lang };
}

export default function LangLayout() {
  const { lang } = useLoaderData<typeof loader>();
  const i18n = useMemo(() => createI18nInstance(lang), [lang]);

  return (
    <I18nextProvider i18n={i18n} key={lang}>
      <Outlet />
    </I18nextProvider>
  );
}
