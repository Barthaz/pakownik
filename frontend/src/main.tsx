import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import faviconUrl from '@assets/favicon.png';
import './index.css';
import { AppRouter } from './router';

const favicon =
  document.querySelector<HTMLLinkElement>("link[rel='icon']") ??
  document.createElement('link');

favicon.rel = 'icon';
favicon.type = 'image/png';
favicon.href = faviconUrl;
document.head.appendChild(favicon);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppRouter />
  </StrictMode>,
);
