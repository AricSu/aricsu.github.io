import { Link } from "react-router";
import { SidebarTrigger } from "fumadocs-ui/components/sidebar/base";
import { useSearchContext } from "fumadocs-ui/contexts/search";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";

export function DocsMobileHeader({
  lang,
  title,
}: {
  lang: string;
  title: string;
}) {
  const { setOpenSearch } = useSearchContext();

  return (
    <header
      className="[grid-area:header] sticky top-(--fd-docs-row-1) z-30 flex h-(--fd-header-height) items-center border-b border-white/10 bg-black text-white backdrop-blur md:hidden max-md:layout:[--fd-header-height:--spacing(14)]"
      aria-label="Docs header"
    >
      <div className="flex w-full items-center gap-2 px-4 py-3">
        <Link
          to={`/${lang}`}
          className="flex min-w-0 items-center gap-2 font-semibold"
        >
          <span className="shrink-0">🚀</span>
          <span className="truncate">{title}</span>
        </Link>

        <div className="ms-auto flex items-center gap-1">
          <button
            type="button"
            aria-label="Search"
            onClick={() => setOpenSearch(true)}
            className="inline-flex items-center justify-center rounded-md p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m21 21-4.34-4.34"
              />
              <circle cx="11" cy="11" r="8" strokeWidth="2" />
            </svg>
          </button>

          <SidebarTrigger
            aria-label="Open Sidebar"
            className="inline-flex items-center justify-center rounded-md p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" />
              <path d="M9 3v18" />
            </svg>
          </SidebarTrigger>

          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
