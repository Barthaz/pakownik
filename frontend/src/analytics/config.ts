export const GA_MEASUREMENT_ID =
  (import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined) ?? 'G-S5PBX0GJF9';

export const GA_ENABLED =
  Boolean(GA_MEASUREMENT_ID) &&
  (import.meta.env.PROD || import.meta.env.VITE_GA_ENABLED === 'true');
