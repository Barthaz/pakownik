import { COOKIE_CONSENT_KEY } from '@/models/constants';

export type CookieConsentChoice = 'all' | 'necessary';

export interface CookieConsentState {
  choice: CookieConsentChoice;
  decidedAt: string;
}

export function getCookieConsent(): CookieConsentState | null {
  if (typeof window === 'undefined') return null;

  const raw = localStorage.getItem(COOKIE_CONSENT_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as CookieConsentState;
  } catch {
    return null;
  }
}

export function setCookieConsent(choice: CookieConsentChoice): CookieConsentState {
  const state: CookieConsentState = {
    choice,
    decidedAt: new Date().toISOString(),
  };
  localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(state));
  return state;
}

export function hasFunctionalConsent(): boolean {
  return getCookieConsent()?.choice === 'all';
}

export function hasAnalyticsConsent(): boolean {
  return getCookieConsent()?.choice === 'all';
}

export const CONSENT_CHANGED_EVENT = 'pakownik:consent-changed';

export function notifyConsentChanged(): void {
  window.dispatchEvent(new Event(CONSENT_CHANGED_EVENT));
}
