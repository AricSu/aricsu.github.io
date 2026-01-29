export type PublicEnv = {
  gaMeasurementId?: string;
};

export function getPublicEnv(): PublicEnv {
  return {
    gaMeasurementId: import.meta.env.VITE_GA_MEASUREMENT_ID,
  };
}
