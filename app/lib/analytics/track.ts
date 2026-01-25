import { getPublicEnv } from "@/lib/public-env";
import { AnalyticsEvent, type AnalyticsEventName } from "./events";

type Params = Record<string, unknown>;

export function track(eventName: AnalyticsEventName, params: Params = {}) {
  const { gaMeasurementId } = getPublicEnv();
  if (!gaMeasurementId) return;
  if (typeof window === "undefined") return;
  if (typeof window.gtag !== "function") return;

  window.gtag("event", eventName, params);
}

export function trackCtaClicked(params: {
  text?: string;
  location?: string;
  href?: string;
}) {
  track(AnalyticsEvent.CtaClicked, {
    ...params,
  });
}

export function trackOutboundLinkClicked(params: {
  link_url: string;
  link_text?: string;
  location?: string;
}) {
  track(AnalyticsEvent.OutboundLinkClicked, params);
}

export function trackFileDownloaded(params: {
  file_url: string;
  file_name?: string;
  link_text?: string;
  location?: string;
}) {
  track(AnalyticsEvent.FileDownloaded, params);
}

export function trackSiteSearch(params: {
  search_term: string;
  results_count?: number;
  scope?: string;
  tag?: string;
  locale?: string;
  mode?: "full" | "vector";
}) {
  track(AnalyticsEvent.SiteSearch, params);
}

