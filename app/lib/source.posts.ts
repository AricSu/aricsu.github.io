import { loader } from "fumadocs-core/source";
import { toFumadocsSource } from "fumadocs-mdx/runtime/server";
import { postsEn, postsZh } from "fumadocs-mdx:collections/server";

export function getPostsSourceForLang(lang: string) {
  const posts = lang === "en" ? postsEn : postsZh;
  return loader({
    baseUrl: `/${lang}/posts`,
    source: toFumadocsSource(posts, []),
  });
}
