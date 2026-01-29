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

function normalizeSiteOrigin(input: string) {
  const trimmed = input.trim().replace(/\/+$/, "");
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  return `https://${trimmed}`;
}

async function resolveSiteOrigin() {
  const fromEnv =
    process.env.SITE_URL ??
    process.env.PUBLIC_SITE_URL ??
    process.env.VITE_SITE_URL ??
    process.env.VITE_PUBLIC_SITE_URL ??
    undefined;
  if (fromEnv) return normalizeSiteOrigin(fromEnv);

  try {
    const cnamePath = path.join(process.cwd(), "CNAME");
    const cname = (await readFile(cnamePath, "utf8")).trim();
    const host = cname.split(/\r?\n/)[0]?.trim();
    if (host) return normalizeSiteOrigin(host);
  } catch {
    // ignore missing CNAME
  }

  return "http://localhost";
}

async function replaceLocalhostOriginInFile(filePath: string, siteOrigin: string) {
  let contents: string;
  try {
    contents = await readFile(filePath, "utf8");
  } catch {
    return;
  }

  const next = contents.replace(
    /https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?/g,
    siteOrigin,
  );
  if (next === contents) return;

  await writeFile(filePath, next, "utf8");
  console.log(`[buildEnd] Patched ${path.relative(process.cwd(), filePath)}`);
}

export default {
  ssr: true,
  routeDiscovery: { mode: "initial" },
  async buildEnd({ reactRouterConfig }) {
    const clientBuildDir = path.join(reactRouterConfig.buildDirectory, 'client');
    await patchRedirectPages(clientBuildDir);
    await writeStaticSearchIndex(clientBuildDir);

    const siteOrigin = await resolveSiteOrigin();
    await replaceLocalhostOriginInFile(path.join(clientBuildDir, "sitemap.xml"), siteOrigin);
    await replaceLocalhostOriginInFile(path.join(clientBuildDir, "sitemap.xml.data"), siteOrigin);
    await replaceLocalhostOriginInFile(path.join(clientBuildDir, "robots.txt"), siteOrigin);
    await replaceLocalhostOriginInFile(path.join(clientBuildDir, "robots.txt.data"), siteOrigin);
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

    const [tihcZhEntries, tihcEnEntries, tidbZhEntries, tidbEnEntries, postsZhEntries, postsEnEntries] =
      await Promise.all([
        listMdxEntries('content/docs/tihc-zh'),
        listMdxEntries('content/docs/tihc-en'),
        listMdxEntries('content/docs/tidb-zh'),
        listMdxEntries('content/docs/tidb-en'),
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
      const tidbEntries = lang === "en" ? tidbEnEntries : tidbZhEntries;
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
