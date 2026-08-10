import { html } from '../html.js';
import { Page } from '../layout.js';
import { SITE, TRADE } from '../config.js';
import { Button, Pattern } from '../components/ui.js';
import { Breadcrumb, SpecTable } from '../components/blocks.js';
import { Icon } from '../components/icon.js';
import { PartTypeCard, BrandChip } from '../components/cards.js';
import { CATEGORIES, partTypesIn, commonPartTypes } from '../data/catalogue.js';
import { FEATURED_BRAND_SLUGS, getBrand } from '../data/brands.js';

/**
 * /{CHASSIS} — the SEO surface.
 *
 * Not a stock list. This page says what we source for a given chassis and
 * what we know about it, and sends every route to a pre-filled request.
 * The page header carries the pattern; nothing below it does.
 */

/** @param {{chassis: object}} props */
export function ChassisPage({ chassis }) {
  const title = `${chassis.code} parts sourced from Japan`;
  const common = commonPartTypes();
  const brands = FEATURED_BRAND_SLUGS.map(getBrand).filter(Boolean).slice(0, 8);

  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: title,
      url: `${SITE.origin}/${chassis.code}`,
      description: chassis.blurb,
      about: {
        '@type': 'Car',
        name: `${chassis.make} ${chassis.model}`,
        vehicleConfiguration: chassis.code,
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      serviceType: `${chassis.code} parts sourcing`,
      provider: { '@type': 'Organization', name: SITE.name, url: SITE.origin },
      areaServed: 'AU',
      description: `Sourcing genuine and aftermarket ${chassis.code} parts from Japan, quoted in landed Australian dollars.`,
    },
  ];

  const body = html`<div class="container">
      ${Breadcrumb({
        trail: [
          { href: '/', label: 'Home' },
          { href: '/what-we-source', label: 'What we source' },
          { label: chassis.code },
        ],
      })}
    </div>

    <section class="page-head patterned">
      ${Pattern()}
      <div class="container page-head__inner">
        <p class="eyebrow">${chassis.make} ${chassis.model} · ${chassis.years}</p>
        <h1 class="mega" style="font-size: clamp(2.5rem, 8vw, 5rem)">${chassis.code}</h1>
        <p class="lede">${chassis.blurb}</p>
        <div class="cluster">
          ${Button({ label: `Request a ${chassis.code} part`, href: `/request?chassis=${chassis.code}`, variant: 'sunrise' })}
          ${Button({ label: 'What we source', href: '/what-we-source', variant: 'outline' })}
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="grid grid--2" style="margin-bottom: var(--space-8)">
          <div>
            <h2 class="display-2" style="margin-bottom: var(--space-5)">The car</h2>
            ${SpecTable({
              rows: [
                { label: 'Chassis code', value: chassis.code },
                { label: 'Make', value: chassis.make },
                { label: 'Model', value: chassis.model },
                { label: 'Years built', value: chassis.years },
                { label: 'Engine', value: chassis.engine },
              ],
            })}
          </div>
          <div class="stack">
            <h2 class="display-2">What we need from you</h2>
            <p class="prose">
              The ${chassis.code} chassis number and the build month settle most fitment
              questions on this car, and they settle them better than the model year does. A
              part number if you have one, or a photograph of the part still on the car if you
              do not.
            </p>
            <p class="prose">
              We come back with a landed Australian dollar price within ${TRADE.quoteDays}
              business days, with duty, GST and freight to your postcode already in it.
            </p>
          </div>
        </div>

        <div class="notice">
          ${Icon('info', { size: 16 })}
          <span
            ><strong>We hold no ${chassis.code} stock.</strong> Everything here is sourced to
            order, which is why we can go after the specific part your car needs rather than
            selling you the one that happened to be on a shelf.</span
          >
        </div>
      </div>
    </section>

    <section class="section section--tight">
      <div class="container">
        <div class="section__head">
          <div>
            <p class="eyebrow">Asked for most</p>
            <h2 class="display-1">Common ${chassis.code} requests</h2>
          </div>
        </div>
        <div class="grid grid--3">
          ${common.map((partType) => PartTypeCard({ partType, chassis: chassis.code }))}
        </div>
      </div>
    </section>

    <section class="section section--tight">
      <div class="container">
        <div class="section__head">
          <div>
            <p class="eyebrow">Everything else</p>
            <h2 class="display-2">All ${chassis.code} categories</h2>
          </div>
        </div>
        ${CATEGORIES.map(
          (category) => html`<div id="${category.slug}" class="chassis-category">
            <h3 class="display-3">${category.label}</h3>
            <p class="muted" style="margin: var(--space-2) 0 var(--space-4)">${category.blurb}</p>
            <div class="cluster">
              ${partTypesIn(category.slug).map(
                (partType) =>
                  html`<a
                    class="tag"
                    href="/request?chassis=${chassis.code}&part=${partType.slug}"
                    >${partType.name}</a
                  >`,
              )}
            </div>
          </div>`,
        )}
      </div>
    </section>

    <section class="section section--tight">
      <div class="container">
        <div class="section__head">
          <div>
            <p class="eyebrow">Marques</p>
            <h2 class="display-2">Brands we source for ${chassis.code}</h2>
          </div>
          ${Button({ label: 'All brands', href: '/brands', variant: 'outline', icon: 'arrow-right', iconAfter: true })}
        </div>
        <div class="brand-strip">${brands.map((brand) => BrandChip({ brand }))}</div>
      </div>
    </section>

    <section class="band patterned">
      ${Pattern()}
      <div class="container band__inner">
        <div class="band__copy">
          <p class="eyebrow">${chassis.code}</p>
          <h2 class="display-1">Tell us what your ${chassis.model} needs</h2>
          <p class="lede">
            One request can cover every part for the same car. No deposit, no obligation, and an
            honest answer if we cannot find one worth buying.
          </p>
        </div>
        ${Button({ label: 'Request a part', href: `/request?chassis=${chassis.code}`, variant: 'sunrise', size: 'lg' })}
      </div>
    </section>`;

  return Page({
    title,
    description: `Genuine and aftermarket ${chassis.code} parts for the ${chassis.make} ${chassis.model}, sourced to order from Japan and quoted in landed Australian dollars. ${chassis.blurb}`,
    path: `/${chassis.code}`,
    current: '/what-we-source',
    structuredData,
    children: body,
  });
}
