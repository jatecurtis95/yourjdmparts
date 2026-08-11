import { SITE } from '../config.js';
import { CHASSIS } from '../data/chassis.js';
import { BRANDS } from '../data/brands.js';
import { CATEGORIES } from '../data/catalogue.js';

const STATIC_PATHS = ['/', '/what-we-source', '/brands', '/how-it-works', '/request', '/contact'];

const escapeXml = (s) =>
  String(s).replace(
    /[<>&'"]/g,
    (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[c],
  );

export function sitemapXml() {
  const entries = [
    ...STATIC_PATHS.map((path) => ({ path, priority: path === '/' ? '1.0' : '0.8' })),
    // Chassis pages are the SEO surface, so they rank above everything else.
    ...CHASSIS.map((c) => ({ path: `/${c.code}`, priority: '0.9' })),
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
 * @param {{allow?: boolean}} [options] allow=false on any host that is not
 *   the production domain, so previews are never crawled.
 */
export function robotsTxt({ allow = true } = {}) {
  if (!allow) {
    return `# Not the production domain. Nothing here should be indexed.\nUser-agent: *\nDisallow: /\n`;
  }
  return `User-agent: *\nAllow: /\n\nSitemap: ${SITE.origin}/sitemap.xml\n`;
}
