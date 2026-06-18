import { GA_ENABLED, GA_MEASUREMENT_ID } from './config';

type GtagCommand = 'js' | 'config' | 'event';

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (command: GtagCommand | string, ...args: unknown[]) => void;
  }
}

let initialized = false;

function loadGtagScript(): void {
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);
}

export function initAnalytics(): void {
  if (!GA_ENABLED || initialized || typeof window === 'undefined') return;

  initialized = true;
  window.dataLayer = window.dataLayer ?? [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer.push(args);
  };

  loadGtagScript();
  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, { send_page_view: false });
}

export function trackPageView(path: string, title?: string): void {
  if (!GA_ENABLED || !window.gtag) return;

  window.gtag('event', 'page_view', {
    page_path: path,
    page_title: title ?? document.title,
    page_location: `${window.location.origin}${path}`,
  });
}

export function trackEvent(
  name: string,
  params?: Record<string, string | number | boolean | undefined>,
): void {
  if (!GA_ENABLED || !window.gtag) return;

  const payload = params
    ? Object.fromEntries(Object.entries(params).filter(([, value]) => value !== undefined))
    : undefined;

  window.gtag('event', name, payload);
}
