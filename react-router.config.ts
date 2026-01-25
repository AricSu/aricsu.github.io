import type { Config } from '@react-router/dev/config';
import { readFile, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createGetUrl, getSlugs } from 'fumadocs-core/source';
import { supportedLngs } from './app/i18n/config';

async function listFilesRecursively(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await listFilesRecursively(fullPath)));
    else files.push(fullPath);
  }

  return files;
}

async function listMdxEntries(relativeDir: string): Promise<string[]> {
  const baseDir = path.join(process.cwd(), relativeDir);
  const files = await listFilesRecursively(baseDir);
  return files
    .filter((f) => f.toLowerCase().endsWith('.mdx'))
    .map((f) => path.relative(baseDir, f).split(path.sep).join('/'));
}

async function patchRedirectPages(clientBuildDir: string) {
  let patchedCount = 0;
  const files = await listFilesRecursively(clientBuildDir);

  for (const file of files) {
    if (!file.endsWith(".html")) continue;
    const html = await readFile(file, "utf8");
    if (!html.includes('http-equiv="refresh" content="2;url=')) continue;

    const next = html.replaceAll(
      'http-equiv="refresh" content="2;url=',
      'http-equiv="refresh" content="0;url=',
    );
    if (next === html) continue;

    await writeFile(file, next, "utf8");
    patchedCount++;
  }

  if (patchedCount > 0) {
    console.log(`[buildEnd] Patched ${patchedCount} redirect page(s) to be instant.`);
  }
}

async function writeStaticSearchIndex(clientBuildDir: string) {
  const { loader } = await import('./app/routes/search-index.json');
  const response = await loader({} as never);
  const json = await response.text();

  const outputPath = path.join(clientBuildDir, 'search-index.json');
  await rm(outputPath, { recursive: true, force: true });
  await writeFile(outputPath, json, 'utf8');

  console.log(`[buildEnd] Wrote ${path.relative(process.cwd(), outputPath)}`);
}

export default {
  ssr: true,
  routeDiscovery: { mode: "initial" },
  async buildEnd({ reactRouterConfig }) {
    const clientBuildDir = path.join(reactRouterConfig.buildDirectory, 'client');
    await patchRedirectPages(clientBuildDir);
    await writeStaticSearchIndex(clientBuildDir);
  },
  async prerender({ getStaticPaths }) {
    const paths: string[] = [];
    const excluded = new Set<string>(['/api/search/tihc', '/api/search/tidb']);
    excluded.add('/search-index.json');
    excluded.add('/:lang');
    excluded.add('/:lang/api/search/tihc');
    excluded.add('/:lang/api/search/tidb');
    for (const lang of supportedLngs) {
      excluded.add(`/${lang}/api/search/tihc`);
      excluded.add(`/${lang}/api/search/tidb`);
    }

    for (const path of getStaticPaths()) {
      if (path.includes(":")) continue;
      if (!excluded.has(path)) paths.push(path);
    }

    const [tihcZhEntries, tihcEnEntries, tidbEntries, postsZhEntries, postsEnEntries] =
      await Promise.all([
        listMdxEntries('content/docs/tihc-zh'),
        listMdxEntries('content/docs/tihc-en'),
        listMdxEntries('content/docs/tidb'),
        listMdxEntries('content/posts/zh'),
        listMdxEntries('content/posts/en'),
      ]);

    for (const lang of supportedLngs) {
      paths.push(`/${lang}`);
      paths.push(`/${lang}/about`);

      const getTihcUrl = createGetUrl(`/${lang}/tihc`);
      const getTidbUrl = createGetUrl(`/${lang}/tidb`);
      const getPostsUrl = createGetUrl(`/${lang}/posts`);

      const tihcEntries = lang === "en" ? tihcEnEntries : tihcZhEntries;
      for (const entry of tihcEntries) {
        paths.push(getTihcUrl(getSlugs(entry)));
      }
      for (const entry of tidbEntries) {
        paths.push(getTidbUrl(getSlugs(entry)));
      }

      paths.push(getPostsUrl([]));
      const postsEntries = lang === "en" ? postsEnEntries : postsZhEntries;
      for (const entry of postsEntries) {
        paths.push(getPostsUrl(getSlugs(entry)));
      }
    }

    return paths;
  },
} satisfies Config;
