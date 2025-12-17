import * as React from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useToast } from "./ui/use-toast";

const columns = [
  {
    label: "Resources",
    children: [
      { label: "Aric's Blog", to: "/blog", target: "_blank" },
      { label: "TiHC Docs", to: "/docs", target: "_blank" },
      { label: "Changelog", to: "/changelog", target: "_blank" },
    ],
  },
  {
    label: "Personal Info",
    children: [
      { label: "Github", to: "https://github.com/AricSu", target: "_blank" },
      {
        label: "Bilibili",
        to: "https://space.bilibili.com/318184941",
        target: "_blank",
      },
      {
        label: "Youtube",
        to: "https://www.youtube.com/@askaric",
        target: "_blank",
      },
      {
        label: "Instagram",
        to: "https://www.instagram.com/aricsu36/",
        target: "_blank",
      },
    ],
  },
];

export function Footer() {
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const { toast } = useToast();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    toast({
      title: "Subscribed!",
      description: "You've been subscribed to our newsletter.",
    });
    setLoading(false);
    setEmail("");
  }

  return (
    <footer className="w-full bg-black text-white border-t border-border mt-8">
      <div className="max-w-[80%] mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row md:justify-between gap-8">
          {/* Columns */}
          <div className="flex flex-col sm:flex-row gap-8">
            {columns.map((col) => (
              <div key={col.label}>
                <div className="font-semibold mb-2">{col.label}</div>
                <ul className="space-y-1">
                  {col.children.map((item) => (
                    <li key={item.label}>
                      <a
                        href={item.to}
                        target={item.target}
                        rel="noopener noreferrer"
                        className="hover:underline text-sm"
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
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
