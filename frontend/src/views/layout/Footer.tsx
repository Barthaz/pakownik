import { Link } from 'react-router-dom';
import { pl } from '@/models/pl';
import { AppNameLogo } from '@/views/layout/AppNameLogo';
import { useAuth } from '@/contexts/AuthContext';

export function Footer() {
  const { user } = useAuth();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border bg-white/60">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-4 py-8 sm:flex-row sm:justify-between sm:px-6">
        <div className="flex items-center text-navy">
          <AppNameLogo className="h-7 w-auto" />
        </div>
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted">
          {user ? (
            <Link to="/app" className="hover:text-coral transition-colors">
              {pl.lists.title}
            </Link>
          ) : (
            <>
              <Link to="/guest" className="hover:text-coral transition-colors">
                {pl.landing.ctaGuest}
              </Link>
              <Link to="/login" className="hover:text-coral transition-colors">
                {pl.auth.login}
              </Link>
              <Link to="/register" className="hover:text-coral transition-colors">
                {pl.auth.register}
              </Link>
            </>
          )}
        </nav>
        <p className="text-sm text-muted">
          © {year} {pl.appName}. {pl.tagline}.
        </p>
      </div>
    </footer>
  );
}
