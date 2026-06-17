import { Link } from 'react-router-dom';
import { pl } from '@/models/pl';
import { routes } from '@/models/constants';
import { Button } from '@/views/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { AppNameLogo } from '@/views/layout/AppNameLogo';

export function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-cream/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to={routes.home} className="flex items-center text-navy hover:opacity-90 transition-opacity">
          <AppNameLogo className="h-8 w-auto sm:h-9" />
        </Link>
        <nav className="flex items-center gap-2 sm:gap-3">
          {user ? (
            <>
              <Link to={routes.app}>
                <Button variant="ghost" size="sm">
                  Listy
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={logout}>
                {pl.auth.logout}
              </Button>
            </>
          ) : (
            <>
              <Link to={routes.login}>
                <Button variant="ghost" size="sm">
                  {pl.auth.login}
                </Button>
              </Link>
              <Link to={routes.register}>
                <Button size="sm">{pl.auth.register}</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
