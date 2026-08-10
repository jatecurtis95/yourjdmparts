import { html, raw, render, attrs } from './html.js';
import { SITE, TRADE, NAV } from './config.js';
import { Logo } from './components/logo.js';
import { Icon } from './components/icon.js';
import { Pattern } from './components/ui.js';

/* ── Trade strip ────────────────────────────────────────────── */

function TradeStrip() {
  return html`<div class="trade-strip">
    <div class="container trade-strip__inner">
      <span class="trade-strip__item">${Icon('truck', { size: 16 })}<strong>${TRADE.dispatch}</strong></span>
      <span class="trade-strip__item">${Icon('shield-check', { size: 16 })}${TRADE.pricing}</span>
    </div>
  </div>`;
}

/* ── Header ─────────────────────────────────────────────────── */

/** @param {{current?: string}} [props] */
function Header({ current = '' } = {}) {
  return html`<header class="site-header">
    ${TradeStrip()}
    <div class="container nav-bar">
      ${Logo({ lockup: 'horizontal', size: 40, href: '/' })}
      <nav class="nav" id="primary-nav" aria-label="Primary">
        ${NAV.map(
          (item) =>
            html`<a
              class="nav__link"
              href="${item.href}"
              ${attrs({ 'aria-current': current === item.href ? 'page' : null })}
              >${item.label}</a
            >`,
        )}
      </nav>
      <div class="nav-actions">
        <a class="icon-btn nav-toggle" href="#primary-nav" data-nav-toggle aria-expanded="false" aria-controls="primary-nav" aria-label="Menu">
          ${Icon('menu')}
        </a>
        <a class="btn btn--bone nav-cta" href="/request">Get a quote</a>
      </div>
    </div>
  </header>`;
}

/* ── Footer ─────────────────────────────────────────────────── */

function Footer() {
  const year = 2026;
  return html`<footer class="site-footer patterned">
    ${Pattern()}
    <div class="container">
      <div class="site-footer__grid">
        <div>
          ${Logo({ lockup: 'vertical', size: 56, href: null, tagline: true })}
          <p class="muted" style="margin-top: var(--space-4); max-width: 34ch">
            ${SITE.description}
          </p>
        </div>
        <div class="footer-col">
          <h2 class="footer-col__title">Sourcing</h2>
          <ul>
            <li><a href="/what-we-source">What we source</a></li>
            <li><a href="/what-we-source?category=engine">Engine</a></li>
            <li><a href="/what-we-source?category=body-exterior">Body and exterior</a></li>
            <li><a href="/brands">Brands</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h2 class="footer-col__title">Chassis</h2>
          <ul>
            <li><a href="/JZA80">JZA80 Supra</a></li>
            <li><a href="/BNR34">BNR34 GT-R</a></li>
            <li><a href="/FD3S">FD3S RX-7</a></li>
            <li><a href="/S15">S15 Silvia</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h2 class="footer-col__title">Company</h2>
          <ul>
            <li><a href="/how-it-works">How it works</a></li>
            <li><a href="/request">Request a part</a></li>
            <li><a href="mailto:${SITE.email}">${SITE.email}</a></li>
          </ul>
        </div>
      </div>
      <div class="site-footer__base">
        <span>© ${year} ${SITE.name} · ${SITE.city}, ${SITE.state}</span>
        <span>Sister company to ${SITE.sisterCompany.name}, which ${SITE.sisterCompany.blurb}.</span>
      </div>
    </div>
  </footer>`;
}

/* ── Document ───────────────────────────────────────────────── */

/**
 * @param {{
 *   title: string,
 *   description?: string,
 *   path: string,
 *   children: unknown,
 *   current?: string,
 *   structuredData?: object|object[]|null,
 *   noindex?: boolean,
 * }} props
 */
export function Page({
  title,
  description = SITE.description,
  path,
  children,
  current = '',
  structuredData = null,
  noindex = false,
}) {
  const fullTitle = title === SITE.name ? title : `${title} — ${SITE.name}`;
  const canonical = SITE.origin + path;

  const jsonLd = structuredData
    ? [].concat(structuredData).map(
        (data) =>
          html`<script type="application/ld+json">
            ${raw(JSON.stringify(data).replace(/</g, '\\u003c'))}
          </script>`,
      )
    : '';

  return raw(`<!doctype html>
` + render(html`<html lang="en-AU">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${fullTitle}</title>
    <meta name="description" content="${description}" />
    <link rel="canonical" href="${canonical}" />
    ${noindex ? html`<meta name="robots" content="noindex" />` : ''}

    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="${SITE.name}" />
    <meta property="og:title" content="${fullTitle}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:image" content="${SITE.origin}/assets/logo/torii.svg" />
    <meta name="twitter:card" content="summary" />

    <link rel="icon" href="/assets/logo/torii.svg" type="image/svg+xml" />
    <link rel="preload" href="/assets/fonts/barlow-condensed-900.woff2" as="font" type="font/woff2" crossorigin />
    <link rel="preload" href="/assets/fonts/ibm-plex-sans-var.woff2" as="font" type="font/woff2" crossorigin />
    <link rel="stylesheet" href="/assets/fonts.css" />
    <link rel="stylesheet" href="/assets/tokens.css" />
    <link rel="stylesheet" href="/assets/styles.css" />
    ${jsonLd}
  </head>
  <body>
    <a class="skip-link" href="#main">Skip to content</a>
    ${Header({ current })}
    <main id="main">${children}</main>
    ${Footer()}
    <script src="/assets/app.js" defer></script>
  </body>
</html>`));
}
