// @vitest-environment node
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import katex from "katex";
import { describe, expect, it, vi } from "vitest";

type KatexWarning = {
  file: string;
  message: string;
};

async function listFilesRecursive(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];

  await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...(await listFilesRecursive(fullPath)));
        return;
      }
      files.push(fullPath);
    }),
  );

  return files;
}

function extractDisplayMathBlocks(markdown: string): string[] {
  const blocks: string[] = [];
  const lines = markdown.split("\n");

  let inCodeFence = false;
  let inMathBlock = false;
  let buffer: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith("```")) {
      inCodeFence = !inCodeFence;
      continue;
    }

    if (inCodeFence) continue;

    if (trimmed === "$$") {
      if (inMathBlock) {
        blocks.push(buffer.join("\n").trim());
        buffer = [];
        inMathBlock = false;
      } else {
        inMathBlock = true;
      }
      continue;
    }

    if (inMathBlock) buffer.push(line);
  }

  return blocks;
}

describe("katex strict-mode warnings", () => {
  it("has no newLineInDisplayMode or unicodeTextInMathMode warnings in content", async () => {
    const contentDir = path.join(process.cwd(), "content");
    const files = (await listFilesRecursive(contentDir)).filter((file) =>
      /\.(md|mdx)$/i.test(file),
    );

    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const capturedWarnings: KatexWarning[] = [];

    try {
      for (const file of files) {
        const text = await readFile(file, "utf8");
        const blocks = extractDisplayMathBlocks(text);

        for (const block of blocks) {
          const start = warnSpy.mock.calls.length;
          katex.renderToString(block, {
            displayMode: true,
            strict: "warn",
            throwOnError: false,
          });
          const end = warnSpy.mock.calls.length;
          for (let i = start; i < end; i++) {
            capturedWarnings.push({
              file: path.relative(process.cwd(), file),
              message: String(warnSpy.mock.calls[i]?.[0] ?? ""),
            });
          }
        }
      }
    } finally {
      warnSpy.mockRestore();
    }

    const disallowed = capturedWarnings.filter(
      (w) =>
        w.message.includes("[newLineInDisplayMode]") ||
        w.message.includes("[unicodeTextInMathMode]"),
    );

    expect(disallowed).toEqual([]);
  });
});

