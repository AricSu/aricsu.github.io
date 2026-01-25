export type PublicEnv = {
  gaMeasurementId?: string;
  gscSiteVerification?: string;
};

export function getPublicEnv(): PublicEnv {
  return {
    gaMeasurementId: import.meta.env.VITE_GA_MEASUREMENT_ID,
    gscSiteVerification: import.meta.env.VITE_GSC_SITE_VERIFICATION,
  };
}

