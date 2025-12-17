import { Link, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "~/components/LanguageSwitcher";

export function Header() {
  const { t } = useTranslation();
  const { lang = "zh" } = useParams();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black text-white backdrop-blur">
      <div className="container mx-auto flex items-center justify-between px-4 py-5">
        <div className="flex items-center gap-6">
          <Link to={`/${lang}`} className="flex items-center gap-2 font-bold text-xl">
            <span>🚀</span>
            <span>AskAric</span>
          </Link>
          <nav className="hidden md:flex items-center gap-4 text-sm">
            <Link
              to={`/${lang}`}
              className="text-white/60 hover:text-white transition-colors"
            >
              {t("common.home")}
            </Link>
            <Link
              to={`/${lang}/docs`}
              className="text-white/60 hover:text-white transition-colors"
            >
              {t("common.docs", "Docs")}
            </Link>
            <Link
              to={`/${lang}/posts`}
              className="text-white/60 hover:text-white transition-colors"
            >
              {t("common.posts", "Posts")}
            </Link>
            <Link
              to={`/${lang}/changelog`}
              className="text-white/60 hover:text-white transition-colors"
            >
              {t("common.changelog", "Changelog")}
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
