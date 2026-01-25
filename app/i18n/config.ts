// 支持的语言列表
export const supportedLngs = ["zh", "en"] as const;

// 默认语言
export const defaultLng = "zh";

// 语言名称映射（用于语言切换器显示）
export const languageNames: Record<string, string> = {
  zh: "简体中文",
  en: "English",
};


export function detectUserLanguage(request: Request): string {
  // 1. Try cookie (if you want to support user preference)
  const cookie = request.headers.get("cookie") || "";
  const match = cookie.match(/(?:^|; )lang=([a-zA-Z-]+)/);
  if (
    match &&
    supportedLngs.includes(match[1] as typeof supportedLngs[number])
  ) {
    return match[1] as typeof supportedLngs[number];
  }
  // 2. Try Accept-Language header
  const accept = request.headers.get("accept-language") || "";
  for (const lang of supportedLngs) {
    if (accept.includes(lang)) return lang;
  }
  // 3. Fallback
  return "zh";
}
