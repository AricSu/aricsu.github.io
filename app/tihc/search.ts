import type { Route } from "./+types/search";
import { createFromSource } from "fumadocs-core/search/server";
import { getTihcSourceForLang } from "@/lib/source.tihc";
import { defaultLng, supportedLngs } from "@/i18n/config";

const servers = new Map<string, ReturnType<typeof createFromSource>>();

function getServer(lang: string) {
  const cached = servers.get(lang);
  if (cached) return cached;
  const source = getTihcSourceForLang(lang);
  const created = createFromSource(source, {
    // https://docs.orama.com/docs/orama-js/supported-languages
    language: "english",
  });
  servers.set(lang, created);
  return created;
}

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const maybeLang = url.pathname.split("/").filter(Boolean)[0];
  const lang =
    typeof maybeLang === "string" &&
    supportedLngs.includes(maybeLang as (typeof supportedLngs)[number])
      ? maybeLang
      : defaultLng;
  return getServer(lang).GET(request);
}
