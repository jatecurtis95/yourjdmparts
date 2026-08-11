import { SITE } from '../config.js';
import { CHASSIS } from '../data/chassis.js';
import { BRANDS } from '../data/brands.js';
import { CATEGORIES } from '../data/catalogue.js';
import { ENTRIES } from '../content/column.js';
import { publishedFinds } from '../data/finds.js';

const STATIC_PATHS = [
  '/',
  '/what-we-source',
  '/brands',
  '/how-it-works',
  '/about',
  '/request',
  '/contact',
  '/column',
  '/privacy',
  '/terms',
  '/shipping-and-returns',
];

const escapeXml = (s) =>
  String(s).replace(
    /[<>&'"]/g,
    (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[c],
  );

export function sitemapXml() {
  // Recent finds are listed only once real entries exist. The section's
  // index 404s until then, and a sitemap that advertises a 404 is worse
  // than one that stays quiet.
  const finds = publishedFinds();

  const entries = [
    ...STATIC_PATHS.map((path) => ({ path, priority: path === '/' ? '1.0' : '0.8' })),
    // Chassis pages are the SEO surface, so they rank above everything else.
    ...CHASSIS.map((c) => ({ path: `/${c.code}`, priority: '0.9' })),
    ...(finds.length ? [{ path: '/finds', priority: '0.8' }] : []),
    ...finds.map((f) => ({ path: `/finds/${f.slug}`, priority: '0.7' })),
    ...ENTRIES.map((e) => ({ path: `/column/${e.slug}`, priority: '0.7' })),
    ...BRANDS.map((b) => ({ path: `/brands/${b.slug}`, priority: '0.7' })),
    ...CATEGORIES.map((c) => ({ path: `/what-we-source?category=${c.slug}`, priority: '0.6' })),
  ];

  const urls = entries
    .map(
      ({ path, priority }) =>
        `  <url>\n    <loc>${escapeXml(SITE.origin + path)}</loc>\n    <priority>${priority}</priority>\n  </url>`,
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

/**
 * @param {{production?: boolean}} [options]
 *
 * A preview host deliberately still allows crawling. Disallowing it would
 * stop a crawler ever fetching the page, and therefore ever seeing the
 * noindex — leaving the URL eligible for a bare, contentless listing.
 * Indexing is denied by the X-Robots-Tag header and the meta tag instead,
 * both of which require the crawler to actually read the response.
 */
export function robotsTxt({ production = true } = {}) {
  if (!production) {
    return [
      '# Preview host. Crawling is allowed so the X-Robots-Tag: noindex',
      '# header can be read; indexing is denied there, not here.',
      'User-agent: *',
      'Allow: /',
      '',
    ].join('\n');
  }
  return `User-agent: *\nAllow: /\n\nSitemap: ${SITE.origin}/sitemap.xml\n`;
}
