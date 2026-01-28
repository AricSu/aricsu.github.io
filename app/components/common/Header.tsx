import { Link, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { defaultLng, supportedLngs } from "@/i18n/config";

export function Header({ className = "" }: { className?: string }) {
  const { t } = useTranslation();
  const { lang: paramLang } = useParams();
  const lang =
    typeof paramLang === "string" &&
    supportedLngs.includes(paramLang as (typeof supportedLngs)[number])
      ? paramLang
      : defaultLng;

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b border-white/10 bg-black text-white backdrop-blur ${className}`}
    >
      <div className="container mx-auto flex items-center justify-between px-4 py-5">
        <div className="flex items-center gap-6">
          <Link
            to={`/${lang}`}
            className="flex items-center gap-2 font-bold text-xl"
          >
            <span>🚀</span>
            <span>AskAric</span>
          </Link>
          <nav className="hidden md:flex items-center gap-4 text-sm">
            <Link
              to={`/${lang}/`}
              className="text-white/60 hover:text-white transition-colors"
            >
              {t("common.home")}
            </Link>
            <Link
              to={`/${lang}/about`}
              className="text-white/60 hover:text-white transition-colors"
            >
              {t("common.about", "About")}
            </Link>
            <Link
              to={`/${lang}/tihc/`}
              className="text-white/60 hover:text-white transition-colors"
            >
              {t("common.tihcDocs", "TiHC Docs")}
            </Link>
            <Link
              to={`/${lang}/tidb/`}
              className="text-white/60 hover:text-white transition-colors"
            >
              {t("common.tidbNotes", "TiDB Notes")}
            </Link>
            <Link
              to={`/${lang}/posts`}
              className="text-white/60 hover:text-white transition-colors"
            >
              {t("common.posts", "Posts")}
            </Link>
            {/* <Link
              to={`/${lang}/changelog`}
              className="text-white/60 hover:text-white transition-colors"
            >
              {t("common.changelog", "Changelog")}
            </Link> */}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
