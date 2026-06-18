import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { hasAnalyticsConsent, CONSENT_CHANGED_EVENT } from '@/services/cookieConsent';
import { initAnalytics, trackPageView } from './analytics';

export function GaPageTracker() {
  const location = useLocation();

  useEffect(() => {
    const maybeInit = () => {
      if (hasAnalyticsConsent()) initAnalytics();
    };
    maybeInit();
    window.addEventListener(CONSENT_CHANGED_EVENT, maybeInit);
    return () => window.removeEventListener(CONSENT_CHANGED_EVENT, maybeInit);
  }, []);

  useEffect(() => {
    if (!hasAnalyticsConsent()) return;
    const path = `${location.pathname}${location.search}${location.hash}`;
    trackPageView(path);
  }, [location]);

  return null;
}
