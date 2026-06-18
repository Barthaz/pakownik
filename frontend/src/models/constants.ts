export const DEFAULT_CATEGORIES = [
  'Ubrania',
  'Higiena',
  'Elektronika',
  'Dokumenty',
  'Apteczka',
  'Inne',
] as const;

export const GUEST_STORAGE_KEY = 'pakownik_guest_list';

export const AUTH_TOKEN_KEY = 'pakownik_token';

export const COOKIE_CONSENT_KEY = 'pakownik_cookie_consent';

export const routes = {
  home: '/',
  login: '/logowanie',
  register: '/rejestracja',
  guest: '/gosc',
  terms: '/regulamin',
  privacy: '/polityka-prywatnosci',
  rodo: '/rodo',
  app: '/app',
} as const;

export const SHARE_PERMISSION_LABELS: Record<string, string> = {
  readonly: 'Tylko podgląd',
  checkoff: 'Podgląd i odznaczanie',
  full_edit: 'Pełna edycja',
};
