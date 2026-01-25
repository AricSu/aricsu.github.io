import * as React from "react";
import { useParams } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast-provider";
import { defaultLng, supportedLngs } from "@/i18n/config";
import { trackCtaClicked } from "@/lib/analytics/track";

export function Footer() {
  const { lang: paramLang } = useParams();
  const lang =
    typeof paramLang === "string" &&
    supportedLngs.includes(paramLang as (typeof supportedLngs)[number])
      ? paramLang
      : defaultLng;
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const { toast } = useToast();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    trackCtaClicked({ text: "Subscribe", location: "footer_newsletter" });
    toast({
      title: "Subscribed!",
      description: "You've been subscribed to our newsletter.",
    });
    setLoading(false);
    setEmail("");
  }

  return (
    <footer className="w-full bg-black text-white border-t border-border">
      <div className="max-w-[80%] mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row md:justify-between gap-8">
          {/* Columns */}
          <div className="flex flex-col sm:flex-row gap-8">
            <div>
              <div className="font-semibold mb-2">Resources</div>
              <ul className="space-y-1">
                <li>
                  <a
                    href={`/${lang}/posts`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline text-sm"
                  >
                    Aric&apos;s Blog
                  </a>
                </li>
                <li>
                  <a
                    href={`/${lang}/tihc`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline text-sm"
                  >
                    TiHC Docs
                  </a>
                </li>
                <li>
                  <a
                    href={`/${lang}/tidb`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline text-sm"
                  >
                    TiDB Notes
                  </a>
                </li>
                <li>
                  <a
                    href={`/${lang}/posts`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline text-sm"
                  >
                    Posts
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <div className="font-semibold mb-2">Personal Info</div>
              <ul className="space-y-1">
                <li>
                  <a
                    href="https://github.com/AricSu"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline text-sm"
                  >
                    Github
                  </a>
                </li>
                <li>
                  <a
                    href="https://space.bilibili.com/318184941"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline text-sm"
                  >
                    Bilibili
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.youtube.com/@askaric"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline text-sm"
                  >
                    Youtube
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.instagram.com/aricsu36/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline text-sm"
                  >
                    Instagram
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Newsletter form */}
          <form onSubmit={onSubmit} className="w-full max-w-xs space-y-2">
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Subscribe to our newsletter
            </label>
            <div className="flex gap-2">
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1"
                required
                disabled={loading}
              />
              <Button type="submit" size="sm" disabled={loading || !email}>
                Subscribe
              </Button>
            </div>
          </form>
        </div>

        <div className="flex flex-col md:flex-row md:justify-between items-center mt-10 gap-4 border-t border-border pt-6">
          <p className="text-muted-foreground text-xs">
            Powered By AricSu • © {new Date().getFullYear()}
          </p>
          <div className="flex gap-2">
            <Button asChild variant="ghost" size="icon" aria-label="Youtube">
              <a
                href="https://www.youtube.com/@askaric"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="i-simple-icons-youtube text-lg" />
              </a>
            </Button>
            <Button asChild variant="ghost" size="icon" aria-label="Bilibili">
              <a
                href="https://space.bilibili.com/318184941"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="i-simple-icons-bilibili text-lg" />
              </a>
            </Button>
            <Button asChild variant="ghost" size="icon" aria-label="Instagram">
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
            >
              <a
                href="https://www.xiaohongshu.com/user/profile/5bcff8128f5d1e0001d6f9ce"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="i-simple-icons-xiaohongshu text-lg" />
              </a>
            </Button>
            <Button asChild variant="ghost" size="icon" aria-label="GitHub">
              <a
                href="https://github.com/AricSu"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="i-simple-icons-github text-lg" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
}
