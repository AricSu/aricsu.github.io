import type { Route } from "./+types/page";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from "fumadocs-ui/layouts/docs/page";
import { useFumadocsLoader } from "fumadocs-core/source/client";
import browserCollections from "fumadocs-mdx:collections/browser";
import { baseOptions } from "@/lib/layout.shared";
import { getTidbSourceForLang } from "@/lib/source.tidb";
import { Footer } from "@/components/common/Footer";
import { Header } from "@/components/common/Header";
import { defaultLng, supportedLngs } from "@/i18n/config";
import { mdxComponents } from "@/components/mdx/mdx-components";

export async function loader({ params }: Route.LoaderArgs) {
  const lang =
    typeof params.lang === "string" &&
    supportedLngs.includes(params.lang as (typeof supportedLngs)[number])
      ? params.lang
      : defaultLng;
  const source = getTidbSourceForLang(lang);
  const raw = params["*"] ?? "";
  const slugs = raw.split("/").filter((v) => v.length > 0);
  const page = source.getPage(slugs);
  if (!page) throw new Response("Not found", { status: 404 });

  return {
    path: page.path,
    pageTree: await source.serializePageTree(source.getPageTree()),
  };
}

const clientLoader = browserCollections.tidb.createClientLoader({
  component({ toc, default: Mdx, frontmatter }) {
    return (
      <DocsPage toc={toc}>
        <title>{frontmatter.title}</title>
        <meta name="description" content={frontmatter.description} />
        <DocsTitle>{frontmatter.title}</DocsTitle>
        <DocsDescription>{frontmatter.description}</DocsDescription>
        <DocsBody>
          <Mdx components={mdxComponents} />
        </DocsBody>
      </DocsPage>
    );
  },
});

export default function Page({ loaderData }: Route.ComponentProps) {
  const Content = clientLoader.getComponent(loaderData.path);
  const { pageTree } = useFumadocsLoader(loaderData);

  return (
    <>
      <Header className="hidden md:block" />
      <div className="flex-1">
        <DocsLayout
          {...baseOptions()}
          tree={pageTree}
          sidebar={{
            enabled: true,
            collapsible: false,
          }}
        >
          <Content />
        </DocsLayout>
      </div>
      <Footer />
    </>
  );
}
