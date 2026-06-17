import { Link } from 'react-router-dom';
import { pl } from '@/models/pl';
import { routes } from '@/models/constants';
import { AppNameLogo } from '@/views/layout/AppNameLogo';
import { useAuth } from '@/contexts/AuthContext';

export function Footer() {
  const { user } = useAuth();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border bg-white/60">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-4 py-10 sm:px-6">
        <AppNameLogo className="h-8 w-auto shrink-0" />

        <nav
          aria-label="Nawigacja stopki"
          className="flex max-w-2xl flex-wrap justify-center gap-x-6 gap-y-3 text-sm text-muted"
        >
          <Link to={routes.terms} className="hover:text-coral transition-colors">
            {pl.legal.terms}
          </Link>
          <Link to={routes.privacy} className="hover:text-coral transition-colors">
            {pl.legal.privacy}
          </Link>
          <Link to={routes.rodo} className="hover:text-coral transition-colors">
            {pl.legal.rodo}
          </Link>
          {user ? (
            <Link to={routes.app} className="hover:text-coral transition-colors">
              {pl.lists.title}
            </Link>
          ) : (
            <>
              <Link to={routes.guest} className="hover:text-coral transition-colors">
                {pl.landing.ctaGuest}
              </Link>
              <Link to={routes.login} className="hover:text-coral transition-colors">
                {pl.auth.login}
              </Link>
              <Link to={routes.register} className="hover:text-coral transition-colors">
                {pl.auth.register}
              </Link>
            </>
          )}
        </nav>

        <p className="text-center text-sm text-muted">
          © {year} {pl.appName}. {pl.tagline}.
        </p>
      </div>
    </footer>
  );
}
