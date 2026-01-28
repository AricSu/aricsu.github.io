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
import { redirect } from "react-router";
import { baseOptions } from "@/lib/layout.shared";
import { getTidbSourceForLang } from "@/lib/source.tidb";
import { Footer } from "@/components/common/Footer";
import { Header } from "@/components/common/Header";
import { DocsMobileHeader } from "@/components/common/DocsMobileHeader";
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
  let page = source.getPage(slugs);
  if (!page) {
    const fallbackLang = lang === "en" ? defaultLng : "en";
    if (fallbackLang !== lang) {
      const fallbackSource = getTidbSourceForLang(fallbackLang);
      const fallbackPage = fallbackSource.getPage(slugs);
      if (fallbackPage) {
        const suffix = slugs.length ? `/${slugs.map(encodeURIComponent).join("/")}` : "";
        return redirect(`/${fallbackLang}/tidb${suffix}`);
      }
    }
    throw new Response("Not found", { status: 404 });
  }

  return {
    lang,
    path: page.path,
    pageTree: await source.serializePageTree(source.getPageTree()),
  };
}

const clientLoaderZh = browserCollections.tidb.createClientLoader({
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

const clientLoaderEn = browserCollections.tidbEn.createClientLoader({
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
  const clientLoader = loaderData.lang === "en" ? clientLoaderEn : clientLoaderZh;
  const Content = clientLoader.getComponent(loaderData.path);
  const { pageTree } = useFumadocsLoader(loaderData);
  const layoutOptions = baseOptions();

  return (
    <>
      <Header className="hidden md:block" />
      <div className="flex-1">
        <DocsLayout
          key={loaderData.lang}
          {...layoutOptions}
          nav={{
            ...layoutOptions.nav,
            component: <DocsMobileHeader lang={loaderData.lang} title="AskAric" />,
          }}
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
