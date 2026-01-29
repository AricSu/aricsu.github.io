import { Link, useLocation, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { defaultLng, supportedLngs } from "@/i18n/config";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Header({ className = "" }: { className?: string }) {
  const { t } = useTranslation();
  const location = useLocation();
  const { lang: paramLang } = useParams();
  const lang =
    typeof paramLang === "string" &&
    supportedLngs.includes(paramLang as (typeof supportedLngs)[number])
      ? paramLang
      : defaultLng;

  const navItems = [
    { key: "home", to: `/${lang}/`, label: t("common.home") },
    { key: "tihc", to: `/${lang}/tihc/`, label: t("common.tihcDocs", "TiHC Docs") },
    { key: "tidb", to: `/${lang}/tidb/`, label: t("common.tidbNotes", "TiDB Notes") },
    { key: "posts", to: `/${lang}/posts`, label: t("common.posts", "Posts") },
    { key: "about", to: `/${lang}/about`, label: t("common.about", "About") },
  ] as const;

  const pathname = location.pathname;
  const isActive = (to: string) => {
    if (to === `/${lang}/`) return pathname === `/${lang}` || pathname === `/${lang}/`;
    return pathname === to || pathname.startsWith(to);
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b border-white/10 bg-black text-white/90 backdrop-blur",
        className,
      )}
    >
      <div className="container mx-auto px-4">
        <div className="grid h-16 grid-cols-[1fr_auto_1fr] items-center">
          <Link
            to={`/${lang}`}
            className="col-start-1 inline-flex items-center gap-2 font-semibold text-lg tracking-tight text-white"
          >
            <span aria-hidden className="text-base leading-none">
              🚀
            </span>
            <span>AskAric</span>
          </Link>

          <nav
            className="col-start-2 hidden md:flex items-center justify-center gap-1"
            aria-label="Primary"
          >
            {navItems.map((item) => (
              <Button
                key={item.key}
                asChild
                variant="ghost"
                size="sm"
                className={cn(
                  "text-white/70 hover:bg-white/10 hover:text-white",
                  isActive(item.to) && "bg-white/10 text-white",
                )}
              >
                <Link to={item.to} aria-current={isActive(item.to) ? "page" : undefined}>
                  {item.label}
                </Link>
              </Button>
            ))}
          </nav>

          <div className="col-start-3 flex items-center justify-end gap-3">
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </header>
  );
}
