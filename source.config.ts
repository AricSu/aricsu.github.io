import {
  defineConfig,
  defineCollections,
  defineDocs,
  frontmatterSchema,
} from "fumadocs-mdx/config";
import { z } from "zod";

export const tihc = defineDocs({
  dir: 'content/docs/tihc-zh',
});

export const tihcEn = defineDocs({
  dir: 'content/docs/tihc-en',
});

export const tidb = defineDocs({
  dir: 'content/docs/tidb',
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

export default defineConfig();
