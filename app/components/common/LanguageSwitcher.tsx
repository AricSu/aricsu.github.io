import { useState, useRef, useEffect } from "react";
import { supportedLngs } from "@/i18n/config";
import { useI18n } from "@/i18n/i18n";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLocation, useNavigate } from "react-router";

// 语言配置：名称 + 国旗 emoji
const languageConfig: Record<string, { name: string; flag: string }> = {
  zh: { name: "中文", flag: "🇨🇳" },
  en: { name: "English", flag: "🇺🇸" },
};

export function LanguageSwitcher() {
  const { i18n, setLanguage } = useI18n();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLang = languageConfig[i18n.language] || languageConfig.en;

  const handleSelect = (lng: string) => {
    setLanguage(lng);
    // 替换 URL 前缀
    const pathParts = location.pathname.split("/").filter(Boolean);
    if (supportedLngs.includes(pathParts[0] as typeof supportedLngs[number])) {
      pathParts[0] = lng;
    } else {
      pathParts.unshift(lng);
    }
    const newPath = "/" + pathParts.join("/") + location.search + location.hash;
    navigate(newPath, { replace: true });
    setOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(!open)}
        className="gap-2 border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
      >
        <span className="text-base leading-none">{currentLang.flag}</span>
        <span>{currentLang.name}</span>
        <svg
          className={cn("w-4 h-4 transition-transform", open && "rotate-180")}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </Button>

      {open && (
        <div className="absolute right-0 mt-1 w-36 rounded-md border border-white/20 bg-black p-1 shadow-md z-50">
          {supportedLngs.map((lng) => (
            <button
              key={lng}
              onClick={() => handleSelect(lng)}
              className={cn(
                "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm transition-colors text-white",
                i18n.language === lng
                  ? "bg-white/20"
                  : "hover:bg-white/10"
              )}
            >
              <span className="text-base leading-none">{languageConfig[lng]?.flag}</span>
              <span>{languageConfig[lng]?.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
