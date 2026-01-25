import type { Tokenizer } from "@orama/orama";

const cjkChar =
  /[\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF\u3040-\u30FF]/u;

function isCjkChar(char: string): boolean {
  return cjkChar.test(char);
}

function isLatinTokenChar(char: string): boolean {
  const code = char.charCodeAt(0);
  if (code >= 48 && code <= 57) return true; // 0-9
  if (code >= 65 && code <= 90) return true; // A-Z
  if (code >= 97 && code <= 122) return true; // a-z
  return char === "_" || char === "-" || char === "'";
}

function addCjkTokens(segment: string, out: string[]) {
  if (segment.length === 0) return;
  for (let i = 0; i < segment.length; i++) out.push(segment[i]);
  for (let i = 0; i < segment.length - 1; i++) out.push(segment.slice(i, i + 2));
}

export function createCjkTokenizer(): Tokenizer {
  return {
    language: "cjk",
    normalizationCache: new Map(),
    tokenize(raw) {
      if (typeof raw !== "string") return [String(raw)];
      const input = raw.toLowerCase();
      const tokens: string[] = [];

      let latin = "";
      let cjk = "";

      const flushLatin = () => {
        if (latin.length === 0) return;
        tokens.push(latin);
        latin = "";
      };

      const flushCjk = () => {
        if (cjk.length === 0) return;
        addCjkTokens(cjk, tokens);
        cjk = "";
      };

      for (const char of input) {
        if (isCjkChar(char)) {
          flushLatin();
          cjk += char;
          continue;
        }

        if (isLatinTokenChar(char)) {
          flushCjk();
          latin += char;
          continue;
        }

        flushLatin();
        flushCjk();
      }

      flushLatin();
      flushCjk();

      return Array.from(new Set(tokens.filter(Boolean)));
    },
  };
}

