import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePageMeta } from '@/seo/usePageMeta';
import { Sidebar } from './MobileNav';
import { MobileNav } from './MobileNav';
import { Footer } from './Footer';
import { pl } from '@/models/pl';
import { routes } from '@/models/constants';

export function AppLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  usePageMeta({
    title: pl.appName,
    description: 'Panel użytkownika Pakownika — listy pakowania i profile rodziny.',
    path: location.pathname,
    noindex: true,
  });

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center text-muted">
        {pl.common.loading}
      </div>
    );
  }

  if (!user) return <Navigate to={routes.login} replace />;

  return (
    <div className="flex min-h-svh flex-col bg-cream">
      <div className="mx-auto flex w-full max-w-5xl flex-1 px-4 py-6 pb-20 sm:px-6 md:pb-6">
        <Sidebar />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
      <div className="hidden md:block">
        <Footer />
      </div>
      <MobileNav />
    </div>
  );
}
