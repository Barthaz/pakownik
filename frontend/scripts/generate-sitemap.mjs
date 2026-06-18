import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const siteUrl = (process.env.VITE_SITE_URL ?? 'https://pakownik.pl').replace(/\/$/, '');

const pages = [
  { loc: '/', changefreq: 'weekly', priority: '1.0' },
  { loc: '/gosc', changefreq: 'weekly', priority: '0.9' },
  { loc: '/rejestracja', changefreq: 'monthly', priority: '0.7' },
  { loc: '/logowanie', changefreq: 'monthly', priority: '0.5' },
  { loc: '/regulamin', changefreq: 'monthly', priority: '0.4' },
  { loc: '/polityka-prywatnosci', changefreq: 'monthly', priority: '0.4' },
  { loc: '/rodo', changefreq: 'monthly', priority: '0.4' },
];

const lastmod = new Date().toISOString().slice(0, 10);

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .map(
    (page) => `  <url>
    <loc>${siteUrl}${page.loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>
`;

const outDir = path.resolve(__dirname, '../dist');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'sitemap.xml'), xml);

const robots = `User-agent: *
Allow: /
Disallow: /app/

Sitemap: ${siteUrl}/sitemap.xml
`;

fs.writeFileSync(path.join(outDir, 'robots.txt'), robots);
console.log(`Generated sitemap.xml and robots.txt for ${siteUrl}`);
