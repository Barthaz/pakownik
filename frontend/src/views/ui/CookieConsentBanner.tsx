import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCookieBite } from '@fortawesome/free-solid-svg-icons';
import { useCookieConsent } from '@/contexts/CookieConsentContext';
import { pl } from '@/models/pl';
import { routes } from '@/models/constants';
import { Button } from '@/views/ui/Button';

export function CookieConsentBanner() {
  const { showBanner, acceptAll, acceptNecessaryOnly } = useCookieConsent();

  if (!showBanner) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[100] p-4 sm:p-6 pointer-events-none"
      role="dialog"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-desc"
    >
      <div className="pointer-events-auto mx-auto flex max-w-3xl flex-col gap-4 rounded-2xl border border-border bg-white p-5 shadow-[0_-4px_32px_rgba(30,58,95,0.12)] sm:flex-row sm:items-end sm:gap-6 sm:p-6">
        <div className="flex min-w-0 flex-1 gap-4">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-coral/15 text-coral-dark"
            aria-hidden
          >
            <FontAwesomeIcon icon={faCookieBite} className="text-lg" />
          </div>
          <div className="min-w-0">
            <h2 id="cookie-consent-title" className="font-semibold text-navy text-base sm:text-lg">
              {pl.cookies.title}
            </h2>
            <p id="cookie-consent-desc" className="mt-1.5 text-sm text-muted leading-relaxed">
              {pl.cookies.description}{' '}
              <Link to={routes.privacy} className="text-coral hover:underline font-medium">
                {pl.legal.privacy}
              </Link>
              .
            </p>
          </div>
        </div>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:shrink-0">
          <Button type="button" variant="ghost" size="sm" onClick={acceptNecessaryOnly}>
            {pl.cookies.necessaryOnly}
          </Button>
          <Button type="button" size="sm" onClick={acceptAll}>
            {pl.cookies.acceptAll}
          </Button>
        </div>
      </div>
    </div>
  );
}
