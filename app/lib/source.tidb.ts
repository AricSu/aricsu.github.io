import { loader } from "fumadocs-core/source";
import { tidb, tidbEn } from "fumadocs-mdx:collections/server";

export function createTidbSource(baseUrl: string) {
  return loader({
    source: tidb.toFumadocsSource(),
    baseUrl,
  });
}

export function getTidbSourceForLang(lang: string) {
  const docs = lang === "en" ? tidbEn : tidb;
  return loader({
    source: docs.toFumadocsSource(),
    baseUrl: `/${lang}/tidb`,
  });
}
