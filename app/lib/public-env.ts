export type PublicEnv = {
  gaMeasurementId?: string;
  gtmContainerId?: string;
};

export function getPublicEnv(): PublicEnv {
  return {
    gaMeasurementId: import.meta.env.VITE_GA_MEASUREMENT_ID,
    gtmContainerId: import.meta.env.VITE_GTM_CONTAINER_ID,
  };
}
