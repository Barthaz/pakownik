import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import {
  CONSENT_CHANGED_EVENT,
  getCookieConsent,
  notifyConsentChanged,
  setCookieConsent,
  type CookieConsentState,
} from '@/services/cookieConsent';
import {
  clearPersistentFunctionalData,
  migrateSessionToPersistent,
} from '@/services/persistentStorage';

interface CookieConsentContextValue {
  consent: CookieConsentState | null;
  showBanner: boolean;
  acceptAll: () => void;
  acceptNecessaryOnly: () => void;
}

const CookieConsentContext = createContext<CookieConsentContextValue | null>(null);

export function CookieConsentProvider({ children }: { children: ReactNode }) {
  const [consent, setConsent] = useState<CookieConsentState | null>(() => getCookieConsent());

  const acceptAll = useCallback(() => {
    migrateSessionToPersistent();
    const next = setCookieConsent('all');
    setConsent(next);
    notifyConsentChanged();
  }, []);

  const acceptNecessaryOnly = useCallback(() => {
    clearPersistentFunctionalData();
    const next = setCookieConsent('necessary');
    setConsent(next);
    notifyConsentChanged();
  }, []);

  useEffect(() => {
    const sync = () => setConsent(getCookieConsent());
    window.addEventListener(CONSENT_CHANGED_EVENT, sync);
    return () => window.removeEventListener(CONSENT_CHANGED_EVENT, sync);
  }, []);

  return (
    <CookieConsentContext.Provider
      value={{
        consent,
        showBanner: consent === null,
        acceptAll,
        acceptNecessaryOnly,
      }}
    >
      {children}
    </CookieConsentContext.Provider>
  );
}

export function useCookieConsent() {
  const ctx = useContext(CookieConsentContext);
  if (!ctx) throw new Error('useCookieConsent must be used within CookieConsentProvider');
  return ctx;
}
