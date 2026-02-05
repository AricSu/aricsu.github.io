import { useEffect } from "react";
import { useLocation } from "react-router";
import { AnalyticsEvent } from "@/lib/analytics/events";
import { track } from "@/lib/analytics/track";

export function GoogleAnalytics() {
  const location = useLocation();
  const pagePath = `${location.pathname}${location.search}`;

  useEffect(() => {
    if (typeof window === "undefined") return;

    track(AnalyticsEvent.PageView, {
      page_title: document.title,
      page_location: window.location.href,
      page_path: pagePath,
    });
  }, [pagePath]);

  return null;
}
