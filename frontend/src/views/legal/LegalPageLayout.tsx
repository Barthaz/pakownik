import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '@/views/layout/Header';
import { PublicLayout } from '@/views/layout/PublicLayout';
import { routes } from '@/models/constants';
import { usePageMeta } from '@/seo/usePageMeta';

interface LegalPageLayoutProps {
  title: string;
  description: string;
  path: string;
  children: ReactNode;
}

export function LegalPageLayout({ title, description, path, children }: LegalPageLayoutProps) {
  usePageMeta({ title, description, path });

  return (
    <PublicLayout header={<Header />}>
      <article className="mx-auto max-w-3xl px-4 py-12 prose prose-navy">
        <h1 className="text-3xl font-bold text-navy mb-8">{title}</h1>
        <div className="space-y-6 text-navy/90 leading-relaxed">{children}</div>
        <p className="mt-12 text-sm text-muted">
          <Link to={routes.home} className="text-coral hover:underline">
            Wróć na stronę główną
          </Link>
        </p>
      </article>
    </PublicLayout>
  );
}
