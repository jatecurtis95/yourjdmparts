import { html, attrs } from '../html.js';
import { Page } from '../layout.js';
import { SITE, TRADE } from '../config.js';
import { Button, Pattern, EmptyState } from '../components/ui.js';
import { Breadcrumb, SpecTable } from '../components/blocks.js';
import { Icon } from '../components/icon.js';
import { BrandCard } from '../components/cards.js';
import {
  BRANDS,
  BRAND_CATEGORIES,
  OEM_MAKES,
  getBrand,
  brandsInCategory,
  brandCategoryLabel,
} from '../data/brands.js';
import { CHASSIS } from '../data/chassis.js';

/**
 * Brands.
 *
 * We source these marques; we do not distribute them. The copy on these
 * pages must never imply a dealership or an authorised-reseller
 * relationship — see the note at the top of src/data/brands.js.
 */

/* ── Index ──────────────────────────────────────────────────── */

/** @param {URL} url */
export function BrandsPage(url) {
  const active = url.searchParams.get('category');
  const shown = active ? brandsInCategory(active) : BRANDS;

  const body = html`<div class="container">
      ${Breadcrumb({ trail: [{ href: '/', label: 'Home' }, { label: 'Brands' }] })}
    </div>

    <section class="page-head patterned">
      ${Pattern()}
      <div class="container page-head__inner">
        <p class="eyebrow">Marques</p>
        <h1 class="display-1" style="font-size: clamp(2.25rem, 6vw, 3.5rem)">Brands we source</h1>
        <p class="lede">
          We are a sourcing service, not a distributor and not an authorised reseller of any of
          these marques. What this list means is that we know where to find their parts in
          Japan, new or used, and what to check before we buy one.
        </p>
      </div>
    </section>

    <div class="container section">
      <div class="cluster" style="margin-bottom: var(--space-6)">
        <a class="tag${active ? '' : ' tag--active'}" href="/brands">All</a>
        ${BRAND_CATEGORIES.map(
          (c) => html`<a
            class="tag${active === c.slug ? ' tag--active' : ''}"
            href="/brands?category=${c.slug}"
            >${c.label}</a
          >`,
        )}
      </div>

      ${shown.length
        ? html`<div class="grid grid--3">${shown.map((brand) => BrandCard({ brand }))}</div>`
        : EmptyState({
            title: 'Nothing under that category yet',
            body: 'The list is not the limit of what we look for. Tell us the brand and the part and we will go and see.',
            actions: Button({ label: 'Request a part', href: '/request', variant: 'bone' }),
          })}

      <div class="section--tight">
        <h2 class="display-2" style="margin-bottom: var(--space-4)">Genuine factory parts</h2>
        <p class="prose" style="margin-bottom: var(--space-5)">
          Alongside the aftermarket, we source genuine parts from the makes below through the
          same process. Genuine is often the right answer on these cars, particularly for body
          panels, lighting and anything safety related.
        </p>
        <div class="cluster">
          ${OEM_MAKES.map((make) => html`<span class="tag">${make}</span>`)}
        </div>
      </div>
    </div>

    <section class="band patterned">
      ${Pattern()}
      <div class="container band__inner">
        <div class="band__copy">
          <p class="eyebrow">Counterfeits</p>
          <h2 class="display-2">What we check before we buy</h2>
          <p class="lede">
            Wheels, engine dress-up parts and anything with a well-known name on it are
            routinely faked in this market. We photograph forging stamps, casting marks, date
            codes and part numbers, and we weigh wheels against the genuine article. If we
            cannot verify a part, we say so rather than quote it.
          </p>
        </div>
        ${Button({ label: 'Request a part', href: '/request', variant: 'sunrise', size: 'lg' })}
      </div>
    </section>`;

  return Page({
    title: active ? `${brandCategoryLabel(active)} brands we source` : 'Brands we source',
    description:
      'The Japanese aftermarket and factory performance brands we source parts from — Tein, HKS, Nismo, Cusco, Rays, Bride and more — quoted in landed Australian dollars.',
    path: '/brands',
    current: '/brands',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Brands we source',
      itemListElement: shown.map((brand, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `${SITE.origin}/brands/${brand.slug}`,
        name: brand.name,
      })),
    },
    children: body,
  });
}

/* ── Brand detail ───────────────────────────────────────────── */

/** @param {{brand: object}} props */
export function BrandPage({ brand }) {
  const siblings = brandsInCategory(brand.category).filter((b) => b.slug !== brand.slug);

  const body = html`<div class="container">
      ${Breadcrumb({
        trail: [
          { href: '/', label: 'Home' },
          { href: '/brands', label: 'Brands' },
          { label: brand.name },
        ],
      })}
    </div>

    <section class="page-head patterned">
      ${Pattern()}
      <div class="container page-head__inner">
        <p class="eyebrow">${brandCategoryLabel(brand.category)}</p>
        <div class="brand-head">
          <div class="brand-head__mark">
            ${brand.logo
              ? html`<span
                  class="brand-mark brand-mark--lg"
                  style="mask-image:url('${brand.logo}');-webkit-mask-image:url('${brand.logo}')"
                  role="img"
                  aria-label="${brand.name}"
                ></span>`
              : html`<span class="brand-card__wordmark" aria-hidden="true">${brand.name}</span>`}
          </div>
          <div>
            <h1 class="display-1">${brand.name} parts, sourced from Japan</h1>
            <p class="lede" style="margin-top: var(--space-3)">${brand.blurb}</p>
          </div>
        </div>
      </div>
    </section>

    <div class="container section">
      <div class="grid grid--2" style="margin-bottom: var(--space-8)">
        <div class="stack">
          <h2 class="display-2">How we quote ${brand.name}</h2>
          <p class="prose">
            Send us the chassis number and what you are after. We check whether the part is
            still in production in Japan, what a good used one is going for, and what the
            freight actually costs — then come back with one landed Australian dollar figure
            within ${TRADE.quoteDays} business days.
          </p>
          <p class="prose">
            Where a part is discontinued we will say so, and tell you what we think a fair
            price for a used one is rather than quietly quoting a rarity premium.
          </p>
          ${Button({ label: `Request a ${brand.name} part`, href: `/request?brand=${brand.slug}`, variant: 'bone' })}
        </div>
        <div>
          <h2 class="display-2" style="margin-bottom: var(--space-5)">At a glance</h2>
          ${SpecTable({
            rows: [
              { label: 'Category', value: brandCategoryLabel(brand.category) },
              { label: 'Sourced', value: 'New and used, from Japan' },
              { label: 'Our relationship', value: 'Sourcing service — not a distributor or authorised reseller' },
              { label: 'Quote turnaround', value: `${TRADE.quoteDays} business days` },
              { label: 'Price basis', value: 'Landed A$, duty and GST included' },
            ],
          })}
        </div>
      </div>

      <div class="notice">
        ${Icon('shield-check', { size: 16 })}
        <span
          ><strong>On authenticity.</strong> ${brand.name} parts are worth checking carefully.
          We photograph part numbers, casting marks and date codes before we buy, and we will
          walk away from a part we cannot verify.</span
        >
      </div>

      <div class="section--tight">
        <h2 class="display-2" style="margin-bottom: var(--space-4)">Which car</h2>
        <p class="prose" style="margin-bottom: var(--space-5)">
          Fitment is chassis-specific. Pick your car and the request will arrive with the
          chassis code already filled in.
        </p>
        <div class="cluster">
          ${CHASSIS.map(
            (c) =>
              html`<a class="tag" href="/request?brand=${brand.slug}&chassis=${c.code}"
                >${c.code} ${c.model}</a
              >`,
          )}
        </div>
      </div>
    </div>

    ${siblings.length
      ? html`<section class="section">
          <div class="container">
            <div class="section__head">
              <h2 class="display-2">Also in ${brandCategoryLabel(brand.category).toLowerCase()}</h2>
              ${Button({ label: 'All brands', href: '/brands', variant: 'outline', icon: 'arrow-right', iconAfter: true })}
            </div>
            <div class="grid grid--3">${siblings.slice(0, 3).map((b) => BrandCard({ brand: b }))}</div>
          </div>
        </section>`
      : ''}`;

  return Page({
    title: `${brand.name} parts from Japan`,
    description: `${brand.name} parts sourced to order from Japan and landed in Australia with duty and GST paid. ${brand.blurb}`,
    path: `/brands/${brand.slug}`,
    current: '/brands',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'Brand',
      name: brand.name,
      description: brand.blurb,
      url: `${SITE.origin}/brands/${brand.slug}`,
    },
    children: body,
  });
}
