import { render } from './html.js';
import { HomePage } from './routes/home.js';
import { WhatWeSourcePage } from './routes/what-we-source.js';
import { BrandsPage, BrandPage } from './routes/brands.js';
import { ChassisPage } from './routes/chassis.js';
import { RequestPage, handleRequestSubmit } from './routes/request.js';
import { HowItWorksPage } from './routes/how-it-works.js';
import { ContactPage } from './routes/contact.js';
import { NotFoundPage } from './routes/not-found.js';
import { sitemapXml, robotsTxt } from './routes/sitemap.js';
import { getChassis } from './data/chassis.js';
import { getBrand } from './data/brands.js';
import { resetIds } from './components/ui.js';
import { setHost, isProductionHost } from './request-context.js';

const HTML_HEADERS = {
  'content-type': 'text/html; charset=utf-8',
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'strict-origin-when-cross-origin',
};

/** @param {unknown} body @param {number} [status] */
function htmlResponse(body, status = 200) {
  return new Response(render(body), { status, headers: HTML_HEADERS });
}

/**
 * Paths that existed while the site was modelled as a stock-holding shop.
 * They are kept as permanent redirects so nothing that was ever linked or
 * indexed lands on a 404.
 */
const LEGACY_REDIRECTS = new Map([
  ['/catalogue', '/what-we-source'],
  ['/order', '/request'],
  ['/parts', '/what-we-source'],
  ['/shop', '/what-we-source'],
]);

/**
 * Resolve a URL to a response. Kept separate from `fetch` so tests can call
 * it directly without standing up a Worker.
 *
 * @param {Request} request
 * @param {object} [env]
 * @returns {Promise<Response|null>} null when the path is not a page route
 */
export async function route(request, env = {}) {
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/+$/, '') || '/';

  resetIds();
  setHost(url);

  if (request.method === 'POST') {
    if (path === '/request') return handleRequestSubmit(request, env);
    return htmlResponse(NotFoundPage({ path }), 405);
  }

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return new Response('Method not allowed', { status: 405 });
  }

  const legacy = LEGACY_REDIRECTS.get(path);
  if (legacy) {
    const target = new URL(legacy, url);
    // Carry filters across where the new page understands them.
    for (const [key, value] of url.searchParams) {
      if (['category', 'chassis'].includes(key)) target.searchParams.set(key, value);
    }
    return Response.redirect(target.toString(), 301);
  }

  // /part/{slug} never had real stock behind it. Send anyone holding one of
  // those links to the thing that replaced it.
  if (/^\/part\/[a-z0-9-]+$/.test(path)) {
    return Response.redirect(new URL('/what-we-source', url).toString(), 301);
  }

  switch (path) {
    case '/':
      return htmlResponse(HomePage());
    case '/what-we-source':
      return htmlResponse(WhatWeSourcePage(url));
    case '/brands':
      return htmlResponse(BrandsPage(url));
    case '/request':
      return htmlResponse(RequestPage({ url }));
    case '/how-it-works':
      return htmlResponse(HowItWorksPage());
    case '/contact':
      return htmlResponse(ContactPage());
    case '/sitemap.xml':
      return new Response(sitemapXml(), {
        headers: { 'content-type': 'application/xml; charset=utf-8' },
      });
    case '/robots.txt':
      return new Response(robotsTxt({ production: isProductionHost() }), {
        headers: { 'content-type': 'text/plain; charset=utf-8' },
      });
    default:
      break;
  }

  // /brands/{slug}
  const brandMatch = /^\/brands\/([a-z0-9-]+)$/.exec(path);
  if (brandMatch) {
    const brand = getBrand(brandMatch[1]);
    return brand ? htmlResponse(BrandPage({ brand })) : htmlResponse(NotFoundPage({ path }), 404);
  }

  // /{CHASSIS} — the SEO surface. Lowercase redirects to the canonical form.
  const chassisMatch = /^\/([A-Za-z]{1,3}[A-Za-z0-9]{1,6})$/.exec(path);
  if (chassisMatch) {
    const code = chassisMatch[1].toUpperCase();
    const chassis = getChassis(code);
    if (chassis) {
      if (chassisMatch[1] !== code) {
        return Response.redirect(new URL('/' + code, url).toString(), 301);
      }
      return htmlResponse(ChassisPage({ chassis }));
    }
  }

  return null;
}

/**
 * Deny indexing at the header level on any host that is not the canonical
 * domain. A header beats a meta tag: it covers assets, the sitemap and PDFs
 * as well as HTML, and a crawler cannot miss it by not parsing the body.
 *
 * @param {Response} response
 */
function guard(response) {
  if (isProductionHost()) return response;
  const copy = new Response(response.body, response);
  copy.headers.set('x-robots-tag', 'noindex, nofollow');
  return copy;
}

export default {
  /**
   * @param {Request} request
   * @param {{ASSETS?: {fetch: (r: Request) => Promise<Response>}}} env
   */
  async fetch(request, env) {
    const url = new URL(request.url);
    // Set before anything returns, so assets are covered too.
    setHost(url);

    // Static assets are served straight from ./public.
    if (url.pathname.startsWith('/assets/') && env.ASSETS) {
      return guard(await env.ASSETS.fetch(request));
    }

    try {
      const response = await route(request, env);
      if (response) return guard(response);
    } catch (error) {
      console.error('Unhandled error', error);
      return guard(htmlResponse(NotFoundPage({ path: url.pathname, serverError: true }), 500));
    }

    if (env.ASSETS) {
      const asset = await env.ASSETS.fetch(request);
      if (asset.status !== 404) return guard(asset);
    }

    return guard(htmlResponse(NotFoundPage({ path: url.pathname }), 404));
  },
};
