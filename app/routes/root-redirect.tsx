import type { Route } from "./+types/root-redirect";
import { useEffect } from "react";
import { redirect, useLocation, useNavigate } from "react-router";
import { defaultLng, detectUserLanguage, supportedLngs } from "@/i18n/config";

export function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const lang = detectUserLanguage(request);
  return redirect(`/${lang}${url.search}${url.hash}`);
}

export default function RootRedirect() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const normalizeToSupported = (input: string | undefined) => {
      if (!input) return undefined;
      const lowered = input.toLowerCase();
      const base = lowered.split("-")[0] ?? lowered;
      const candidate = supportedLngs.includes(base as (typeof supportedLngs)[number])
        ? base
        : supportedLngs.includes(lowered as (typeof supportedLngs)[number])
          ? lowered
          : undefined;
      return candidate as (typeof supportedLngs)[number] | undefined;
    };

    const getCookieLang = () => {
      const cookies = document.cookie.split(";").map((c) => c.trim());
      for (const cookie of cookies) {
        if (!cookie.startsWith("lang=")) continue;
        return normalizeToSupported(decodeURIComponent(cookie.slice("lang=".length)));
      }
      return undefined;
    };

    const cookieLang = getCookieLang();
    let storageValue: string | null = null;
    try {
      storageValue = localStorage.getItem("i18nextLng");
    } catch {
      storageValue = null;
    }
    const storageLang = normalizeToSupported(storageValue ?? undefined);
    const browserLang =
      normalizeToSupported(navigator.languages?.[0]) ??
      normalizeToSupported(navigator.language) ??
      undefined;

    const lang = cookieLang ?? storageLang ?? browserLang ?? defaultLng;
    navigate(`/${lang}${location.search}${location.hash}`, { replace: true });
  }, [location.hash, location.search, navigate]);

  return null;
}
