function resolveSiteUrl(): string {
  const fromEnv = import.meta.env.VITE_SITE_URL as string | undefined;
  const base =
    fromEnv ??
    (typeof window !== 'undefined' ? window.location.origin : 'https://pakownik.pl');

  return base.replace(/\/$/, '').replace(/^http:\/\//, 'https://');
}

export const SITE_URL = resolveSiteUrl();

export const SITE_NAME = 'Pakownik';

export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;

export const seo = {
  defaultTitle: 'Pakownik — aplikacja i lista pakowania na wyjazd | pakowanie walizki',
  defaultDescription:
    'Pakownik to darmowa aplikacja do pakowania walizki i szykowania się na wyjazd. Twórz listy pakowania dla całej rodziny, odhaczaj postęp i nie zapomnij niczego przed wakacjami, wyjazdem czy podróżą.',
  keywords:
    'pakownik, lista pakowania, pakowanie walizki, szykowanie się na wyjazd, aplikacja do pakowania, lista na wyjazd, pakowanie na wakacje, lista rzeczy do spakowania, pakowanie z dziećmi, checklista wyjazdowa, pakowanie rodzinne',
} as const;
