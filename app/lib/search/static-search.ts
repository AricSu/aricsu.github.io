import { createContentHighlighter, type SortedResult } from "fumadocs-core/search";
import { create, load, search as oramaSearch, type RawData } from "@orama/orama";
import { createCjkTokenizer } from "./cjk-tokenizer";

type ExportedSearchData = RawData & { type: "simple" };

const simpleSchema = {
  url: "string",
  title: "string",
  breadcrumbs: "string[]",
  description: "string",
  content: "string",
  keywords: "string",
} as const;

const dbCache = new Map<string, Promise<unknown>>();

async function loadSimpleDb(from: string): Promise<unknown> {
  const cached = dbCache.get(from);
  if (cached) return cached;

  const promise = (async () => {
    const res = await fetch(from);
    if (!res.ok) {
      throw new Error(
        `failed to fetch exported search indexes from ${from} (status: ${res.status})`,
      );
    }

    const data = (await res.json()) as unknown as ExportedSearchData;
    if ((data as { type?: unknown }).type !== "simple") {
      throw new Error(
        `unsupported search index type: ${String((data as { type?: unknown }).type)}`,
      );
    }

    const db = create({
      schema: simpleSchema,
      components: {
        tokenizer: createCjkTokenizer(),
      },
    });
    await load(db as any, data);
    return db;
  })();

  dbCache.set(from, promise);
  return promise;
}

export async function searchStaticDocs(
  query: string,
  {
    from,
    limit = 20,
  }: {
    from: string;
    limit?: number;
  },
): Promise<SortedResult[]> {
  const db = (await loadSimpleDb(from)) as any;
  const highlighter = createContentHighlighter(query);

  const result = await oramaSearch(db, {
    term: query,
    tolerance: 1,
    limit,
    boost: {
      title: 2,
    },
  });

  return result.hits.map((hit) => {
    const doc = hit.document as unknown as {
      url: string;
      title: string;
      breadcrumbs?: string[];
    };
    return {
      id: doc.url,
      url: doc.url,
      type: "page",
      content: doc.title,
      breadcrumbs: doc.breadcrumbs,
      contentWithHighlights: highlighter.highlight(doc.title),
    };
  });
}
