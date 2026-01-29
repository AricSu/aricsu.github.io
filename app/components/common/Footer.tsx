import { useParams } from "react-router";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { defaultLng, supportedLngs } from "@/i18n/config";
import { cn } from "@/lib/utils";

export function Footer() {
  const { lang: paramLang } = useParams();
  const lang =
    typeof paramLang === "string" &&
    supportedLngs.includes(paramLang as (typeof supportedLngs)[number])
      ? paramLang
      : defaultLng;

  const linkButtonClassName = cn(
    "h-8 justify-start px-2",
    "text-white/70 hover:bg-white/10 hover:text-white",
  );

  return (
    <footer className="w-full border-t border-white/10 bg-black text-white/80">
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white">
              <span aria-hidden className="text-base leading-none">
                🚀
              </span>
              <span className="font-semibold tracking-tight">AskAric</span>
            </div>
            <p className="text-sm text-white/60">
              Docs, notes, and posts — with a focus on TiDB and Life.
            </p>
          </div>

          <div className="space-y-3">
            <div className="text-sm font-semibold text-white">Resources</div>
            <div className="flex flex-col items-start">
              <Button asChild variant="ghost" className={linkButtonClassName}>
                <a href={`/${lang}/posts`} target="_blank" rel="noopener noreferrer">
                  Aric&apos;s Blog
                </a>
              </Button>
              <Button asChild variant="ghost" className={linkButtonClassName}>
                <a href={`/${lang}/tihc`} target="_blank" rel="noopener noreferrer">
                  TiHC Docs
                </a>
              </Button>
              <Button asChild variant="ghost" className={linkButtonClassName}>
                <a href={`/${lang}/tidb`} target="_blank" rel="noopener noreferrer">
                  TiDB Notes
                </a>
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-sm font-semibold text-white">Personal</div>
            <div className="flex flex-col items-start">
              <Button asChild variant="ghost" className={linkButtonClassName}>
                <a href="https://github.com/AricSu" target="_blank" rel="noopener noreferrer">
                  GitHub
                </a>
              </Button>
              <Button asChild variant="ghost" className={linkButtonClassName}>
                <a
                  href="https://space.bilibili.com/318184941"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Bilibili
                </a>
              </Button>
              <Button asChild variant="ghost" className={linkButtonClassName}>
                <a href="https://www.youtube.com/@askaric" target="_blank" rel="noopener noreferrer">
                  YouTube
                </a>
              </Button>
              <Button asChild variant="ghost" className={linkButtonClassName}>
                <a
                  href="https://www.instagram.com/aricsu36/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Instagram
                </a>
              </Button>
            </div>
          </div>
        </div>

        <Separator className="my-8 bg-white/10" />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/50 sm:flex-nowrap">
            <span className="whitespace-nowrap">
              Powered By AricSu • © {new Date().getFullYear()}
            </span>
            <span className="opacity-40">•</span>
            <a
              href="https://beian.miit.gov.cn"
              target="_blank"
              rel="nofollow noopener noreferrer"
              className="whitespace-nowrap hover:text-white hover:underline underline-offset-4"
            >
              备案号 : 辽ICP备19006373号-3
            </a>
            <span className="opacity-40">•</span>
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                className="h-3.5 w-3.5 text-white/60"
                fill="none"
              >
                <path
                  d="M12 2.5 20 6v6c0 5.2-3.4 9.8-8 11-4.6-1.2-8-5.8-8-11V6l8-3.5Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                <path
                  d="M9.5 12.2 11.4 14l3.6-4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>公网安备号</span>
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              asChild
              variant="ghost"
              size="icon"
              aria-label="Youtube"
              className="text-white/70 hover:bg-white/10 hover:text-white"
            >
              <a
                href="https://www.youtube.com/@askaric"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="i-simple-icons-youtube text-lg" />
              </a>
            </Button>
            <Button
              asChild
              variant="ghost"
              size="icon"
              aria-label="Bilibili"
              className="text-white/70 hover:bg-white/10 hover:text-white"
            >
              <a
                href="https://space.bilibili.com/318184941"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="i-simple-icons-bilibili text-lg" />
              </a>
            </Button>
            <Button
              asChild
              variant="ghost"
              size="icon"
              aria-label="Instagram"
              className="text-white/70 hover:bg-white/10 hover:text-white"
            >
              <a
                href="https://www.instagram.com/aricsu36/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="i-simple-icons-instagram text-lg" />
              </a>
            </Button>
            <Button
              asChild
              variant="ghost"
              size="icon"
              aria-label="Xiaohongshu"
              className="text-white/70 hover:bg-white/10 hover:text-white"
            >
              <a
                href="https://www.xiaohongshu.com/user/profile/5bcff8128f5d1e0001d6f9ce"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="i-simple-icons-xiaohongshu text-lg" />
              </a>
            </Button>
            <Button
              asChild
              variant="ghost"
              size="icon"
              aria-label="GitHub"
              className="text-white/70 hover:bg-white/10 hover:text-white"
            >
              <a href="https://github.com/AricSu" target="_blank" rel="noopener noreferrer">
                <i className="i-simple-icons-github text-lg" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
}
