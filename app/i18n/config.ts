// 支持的语言列表
export const supportedLngs = ["zh", "en"] as const;

// 默认语言
export const defaultLng = "zh";

// 语言名称映射（用于语言切换器显示）
export const languageNames: Record<string, string> = {
  zh: "简体中文",
  en: "English",
};

function normalizeLanguageTag(input: string) {
  return input.trim().toLowerCase();
}

function parseCookie(header: string) {
  const out: Record<string, string> = {};
  for (const part of header.split(";")) {
    const [rawKey, ...rawValueParts] = part.trim().split("=");
    if (!rawKey) continue;
    const rawValue = rawValueParts.join("=");
    try {
      out[rawKey] = decodeURIComponent(rawValue ?? "");
    } catch {
      out[rawKey] = rawValue ?? "";
    }
  }
  return out;
}

function parseAcceptLanguage(header: string) {
  // Example: "en-US,en;q=0.9,zh;q=0.8"
  return header
    .split(",")
    .map((part, index) => {
      const [rawTag, ...params] = part.trim().split(";");
      const tag = normalizeLanguageTag(rawTag ?? "");
      let q = 1;
      for (const param of params) {
        const trimmed = param.trim();
        if (!trimmed.startsWith("q=")) continue;
        const value = Number.parseFloat(trimmed.slice(2));
        if (!Number.isNaN(value)) q = value;
      }
      return { tag, q, index };
    })
    .filter((item) => item.tag.length > 0);
}

function pickSupportedLanguageFromHeader(acceptLanguage: string) {
  const candidates = parseAcceptLanguage(acceptLanguage);
  let best: { lang: (typeof supportedLngs)[number]; q: number; index: number } | undefined;

  for (const { tag, q, index } of candidates) {
    const base = tag.split("-")[0] ?? tag;
    const lang = supportedLngs.includes(base as (typeof supportedLngs)[number])
      ? (base as (typeof supportedLngs)[number])
      : supportedLngs.includes(tag as (typeof supportedLngs)[number])
        ? (tag as (typeof supportedLngs)[number])
        : undefined;
    if (!lang) continue;

    if (!best || q > best.q || (q === best.q && index < best.index)) {
      best = { lang, q, index };
    }
  }

  return best?.lang;
}

export function detectUserLanguage(request: Request): (typeof supportedLngs)[number] {
  // 1. Try cookie (if you want to support user preference)
  const cookieHeader = request.headers.get("cookie") ?? "";
  const cookies = parseCookie(cookieHeader);
  const cookieLang = normalizeLanguageTag(cookies.lang ?? "");
  const cookieBase = cookieLang.split("-")[0] ?? cookieLang;
  if (supportedLngs.includes(cookieBase as (typeof supportedLngs)[number]))
    return cookieBase as (typeof supportedLngs)[number];
  if (supportedLngs.includes(cookieLang as (typeof supportedLngs)[number]))
    return cookieLang as (typeof supportedLngs)[number];

  // 2. Try Accept-Language header
  const accept = request.headers.get("accept-language") ?? "";
  const headerLang = pickSupportedLanguageFromHeader(accept);
  if (headerLang) return headerLang;
  // 3. Fallback
  return defaultLng;
}
