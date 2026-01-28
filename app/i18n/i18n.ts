import i18next, { type i18n as I18nInstance } from "i18next";
import { initReactI18next } from "react-i18next";
import { defaultLng, supportedLngs } from "./config";
import zhTranslation from "./locales/zh.json";
import enTranslation from "./locales/en.json";

export const resources = {
  zh: { translation: zhTranslation },
  en: { translation: enTranslation },
} as const;

function normalizeLng(input: string): (typeof supportedLngs)[number] {
  return supportedLngs.includes(input as (typeof supportedLngs)[number])
    ? (input as (typeof supportedLngs)[number])
    : defaultLng;
}

export function createI18nInstance(lng: string): I18nInstance {
  const instance = i18next.createInstance();
  instance.use(initReactI18next);

  instance.init({
    resources,
    lng: normalizeLng(lng),
    fallbackLng: defaultLng,
    supportedLngs: [...supportedLngs],
    interpolation: { escapeValue: false },
    initImmediate: false,
    react: { useSuspense: false },
  });

  return instance;
}
