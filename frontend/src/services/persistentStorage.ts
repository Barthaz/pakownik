import { AUTH_TOKEN_KEY, GUEST_STORAGE_KEY } from '@/models/constants';
import { getCookieConsent, hasFunctionalConsent } from './cookieConsent';

function usePersistentStorage(): boolean {
  return hasFunctionalConsent();
}

export function getStoredItem(key: string): string | null {
  if (typeof window === 'undefined') return null;

  if (usePersistentStorage()) {
    return localStorage.getItem(key) ?? sessionStorage.getItem(key);
  }

  const session = sessionStorage.getItem(key);
  if (session) return session;

  // Istniejąca sesja zapisana przed banerem cookies
  if (getCookieConsent() === null) {
    return localStorage.getItem(key);
  }

  return null;
}

export function setStoredItem(key: string, value: string): void {
  if (usePersistentStorage()) {
    localStorage.setItem(key, value);
    sessionStorage.removeItem(key);
    return;
  }
  sessionStorage.setItem(key, value);
}

export function removeStoredItem(key: string): void {
  localStorage.removeItem(key);
  sessionStorage.removeItem(key);
}

export function migrateSessionToPersistent(): void {
  for (const key of [AUTH_TOKEN_KEY, GUEST_STORAGE_KEY]) {
    const value = sessionStorage.getItem(key);
    if (value !== null) {
      localStorage.setItem(key, value);
      sessionStorage.removeItem(key);
    }
  }
}

export function clearPersistentFunctionalData(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(GUEST_STORAGE_KEY);
}
