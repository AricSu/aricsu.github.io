import {
  defineConfig,
  defineCollections,
  defineDocs,
  frontmatterSchema,
} from "fumadocs-mdx/config";
import { remarkMdxMermaid } from "fumadocs-core/mdx-plugins";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { z } from "zod";

export const tihc = defineDocs({
  dir: 'content/docs/tihc-zh',
});

export const tihcEn = defineDocs({
  dir: 'content/docs/tihc-en',
});

export const tidb = defineDocs({
  dir: 'content/docs/tidb-zh',
});

export const tidbEn = defineDocs({
  dir: 'content/docs/tidb-en',
});

const postFrontmatterSchema = frontmatterSchema.extend({
  author: z.string().optional(),
  date: z.string().date().or(z.date()).optional(),
  tags: z.array(z.string()).optional(),
});

export const postsZh = defineCollections({
  dir: "content/posts/zh",
  schema: postFrontmatterSchema,
  type: "doc",
});

export const postsEn = defineCollections({
  dir: "content/posts/en",
  schema: postFrontmatterSchema,
  type: "doc",
});

export default defineConfig({
  mdxOptions: {
    remarkPlugins: (plugins) => [remarkMath, remarkMdxMermaid, ...plugins],
    rehypePlugins: (plugins) => [rehypeKatex, ...plugins],
  },
});
