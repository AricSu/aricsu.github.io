import { useEffect } from "react";
import {
  trackCtaClicked,
  trackFileDownloaded,
  trackOutboundLinkClicked,
  trackSiteSearch,
} from "@/lib/analytics/track";

const downloadExtensions = [
  ".pdf",
  ".zip",
  ".tar",
  ".gz",
  ".tgz",
  ".7z",
  ".rar",
  ".dmg",
  ".pkg",
  ".exe",
] as const;

function isProbablyDownloadUrl(url: URL) {
  const pathname = url.pathname.toLowerCase();
  return downloadExtensions.some((ext) => pathname.endsWith(ext));
}

function getElementText(element: Element) {
  const explicit = element.getAttribute("aria-label")?.trim();
  if (explicit) return explicit;

  const text = element.textContent?.trim();
  if (text) return text.slice(0, 120);

  return undefined;
}

export function AnalyticsListener() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const custom = target.closest("[data-analytics-event]");
      if (custom) {
        const eventName = custom.getAttribute("data-analytics-event");
        const location = custom.getAttribute("data-analytics-location") ?? undefined;
        const text = getElementText(custom);

        if (eventName === "cta_clicked") {
          const anchor = custom.closest("a");
          const href = anchor?.getAttribute("href") ?? undefined;
          trackCtaClicked({ text, location, href });
        }
      }

      const anchor = target.closest("a[href]");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      let url: URL;
      try {
        url = new URL(href, window.location.href);
      } catch {
        return;
      }

      const location = anchor.getAttribute("data-analytics-location") ?? undefined;
      const linkText = getElementText(anchor);
      const isDownload = anchor.hasAttribute("download") || isProbablyDownloadUrl(url);

      if (isDownload) {
        const pathname = url.pathname;
        const fileName = pathname.split("/").filter(Boolean).at(-1);
        trackFileDownloaded({
          file_url: url.href,
          file_name: fileName,
          link_text: linkText,
          location,
        });
      }

      const isOutbound = url.origin !== window.location.origin;
      if (isOutbound) {
        trackOutboundLinkClicked({
          link_url: url.href,
          link_text: linkText,
          location,
        });
      }
    };

    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.__analyticsFetchPatched) return;

    const originalFetch = window.fetch.bind(window);
    window.__analyticsFetchPatched = true;

    window.fetch = async (input, init) => {
      const response = await originalFetch(input, init);

      try {
        const requestUrl =
          typeof input === "string"
            ? input
            : input instanceof URL
              ? input.toString()
              : input.url;
        const url = new URL(requestUrl, window.location.href);
        const pathname = url.pathname;

        if (!pathname.startsWith("/api/search/")) return response;
        if ((init?.method ?? "GET").toUpperCase() !== "GET") return response;

        const query = url.searchParams.get("query");
        if (!query) return response;

        const scope = pathname.split("/").filter(Boolean).at(-1);
        const tag = url.searchParams.get("tag") ?? undefined;
        const locale = url.searchParams.get("locale") ?? undefined;
        const mode = url.searchParams.get("mode") === "vector" ? "vector" : "full";

        const cloned = response.clone();
        const json = await cloned.json().catch(() => undefined);
        const resultsCount = Array.isArray(json) ? json.length : undefined;

        trackSiteSearch({
          search_term: query,
          results_count: resultsCount,
          scope,
          tag: tag ?? undefined,
          locale,
          mode,
        });
      } catch {
        // ignore tracking errors
      }

      return response;
    };
  }, []);

  return null;
}

