import { loader } from "fumadocs-core/source";
import { tihc, tihcEn } from "fumadocs-mdx:collections/server";

export function createTihcSource(baseUrl: string, lang: string) {
  const docs = lang === "en" ? tihcEn : tihc;
  return loader({
    source: docs.toFumadocsSource(),
    baseUrl,
  });
}

export function getTihcSourceForLang(lang: string) {
  return createTihcSource(`/${lang}/tihc`, lang);
}
