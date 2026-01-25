declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    __analyticsFetchPatched?: boolean;
  }
}

export {};
