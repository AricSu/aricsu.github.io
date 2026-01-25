import { useEffect } from "react";
import { useLocation } from "react-router";
import { getPublicEnv } from "@/lib/public-env";

export function GoogleAnalytics() {
  const { gaMeasurementId } = getPublicEnv();
  const location = useLocation();
  const pagePath = `${location.pathname}${location.search}`;

  useEffect(() => {
    if (!gaMeasurementId) return;
    if (typeof window === "undefined") return;
    if (typeof window.gtag !== "function") return;

    window.gtag("event", "page_view", {
      page_title: document.title,
      page_location: window.location.href,
      page_path: pagePath,
    });
  }, [gaMeasurementId, pagePath]);

  return null;
}

