import { loader } from "fumadocs-core/source";
import { tidb } from "fumadocs-mdx:collections/server";

export function createTidbSource(baseUrl: string) {
  return loader({
    source: tidb.toFumadocsSource(),
    baseUrl,
  });
}

export function getTidbSourceForLang(lang: string) {
  return createTidbSource(`/${lang}/tidb`);
}
