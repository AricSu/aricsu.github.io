import i18n from "i18next";
import { initReactI18next, useTranslation as useTranslationBase } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { defaultLng, supportedLngs } from "./config";
import zhTranslation from "./locales/zh.json";
import enTranslation from "./locales/en.json";

const resources = {
  zh: { translation: zhTranslation },
  en: { translation: enTranslation },
};

const isClient = typeof window !== "undefined";
const i18nInstance = i18n.use(initReactI18next);
if (isClient) {
  i18nInstance.use(LanguageDetector);
}
i18nInstance.init({
  resources,
  lng: defaultLng,
  fallbackLng: defaultLng,
  supportedLngs: [...supportedLngs],
  interpolation: { escapeValue: false },
  initImmediate: false,
  react: { useSuspense: false },
});
if (isClient) {
  const storedLng = localStorage.getItem("i18nextLng");
  if (storedLng && supportedLngs.includes(storedLng as typeof supportedLngs[number])) {
    setTimeout(() => {
      i18n.changeLanguage(storedLng);
    }, 0);
  }
}

// 封装自定义 hook，统一用法
import { useCallback } from "react";
export function useI18n() {
  const { t, i18n } = useTranslationBase();
  // 统一切换语言逻辑
  const setLanguage = useCallback((lng: string) => {
    i18n.changeLanguage(lng);
    if (typeof window !== "undefined") {
      document.cookie = `lang=${lng};path=/;max-age=31536000`;
      localStorage.setItem("i18nextLng", lng);
    }
  }, [i18n]);
  return { t, i18n, setLanguage };
}

export default i18n;
