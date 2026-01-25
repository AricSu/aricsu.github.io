export const AnalyticsEvent = {
  CtaClicked: "cta_clicked",
  OutboundLinkClicked: "outbound_link_clicked",
  FileDownloaded: "file_downloaded",
  SiteSearch: "site_search",
} as const;

export type AnalyticsEventName =
  (typeof AnalyticsEvent)[keyof typeof AnalyticsEvent];

