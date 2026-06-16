import type { ReactNode } from 'react';
import { Footer } from './Footer';

interface PublicLayoutProps {
  header: ReactNode;
  children: ReactNode;
  className?: string;
}

export function PublicLayout({ header, children, className = '' }: PublicLayoutProps) {
  return (
    <div className={`flex min-h-svh flex-col bg-cream ${className}`}>
      {header}
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
