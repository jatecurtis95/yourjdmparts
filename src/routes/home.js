import { html } from '../html.js';
import { Page } from '../layout.js';
import { SITE, TICKER_CODES, TRADE, HERO_MEDIA } from '../config.js';
import { Button, Pattern } from '../components/ui.js';
import { ToriiMark } from '../components/logo.js';
import { CategoryCard, BrandChip } from '../components/cards.js';
import { CATEGORIES, partTypesIn, PART_TYPES } from '../data/catalogue.js';
import { BRANDS, FEATURED_BRAND_SLUGS, getBrand } from '../data/brands.js';
import { CHASSIS, getChassis } from '../data/chassis.js';
import { formatNumber } from '../format.js';

/* ── Hero ───────────────────────────────────────────────────────
   Media-optional. With no footage this is the patterned Midnight
   ground the design system calls for. Give HERO_MEDIA a poster or a
   video and it becomes full-bleed behind a FLAT scrim.               */

function Hero() {
  const hasMedia = Boolean(HERO_MEDIA.video || HERO_MEDIA.poster);

  const media = hasMedia
    ? html`<div class="hero__media">
          ${HERO_MEDIA.video
            ? html`<video autoplay muted loop playsinline poster="${HERO_MEDIA.poster ?? ''}" aria-hidden="true">
                <source src="${HERO_MEDIA.video}" type="video/mp4" />
              </video>`
            : html`<img src="${HERO_MEDIA.poster}" alt="${HERO_MEDIA.alt}" width="1920" height="1080" />`}
        </div>
        <div class="hero__scrim" aria-hidden="true"></div>`
    : Pattern();

  return html`<section class="hero patterned">
    ${media}
    <div class="container hero__inner">
      <div class="hero__copy">
        <p class="eyebrow">Japanese domestic market parts, sourced to order</p>
        <h1 class="mega">
          <span class="mega__line mega__line--bone">You name the part</span>
          <span class="mega__line mega__line--sunrise">We find it in Japan</span>
          <span class="mega__line mega__line--outline">Landed in A$</span>
        </h1>
        <p class="lede">
          We do not hold stock. You tell us the car and the part, we go looking at auction and
          through the dismantlers we buy from in Japan, and we come back with a landed
          Australian dollar price, usually within ${TRADE.quoteDays} business days. Nothing is
          charged until you say yes to it.
        </p>
        <div class="hero__actions">
          ${Button({ label: 'Request a part', href: '/request', variant: 'sunrise', size: 'lg' })}
          ${Button({ label: 'What we source', href: '/what-we-source', variant: 'outline', size: 'lg' })}
        </div>
      </div>
      <div class="hero__mark">${ToriiMark({ size: 320 })}</div>
    </div>
  </section>`;
}

/* ── Chassis ticker ─────────────────────────────────────────── */

function Ticker() {
  // Duplicated once so the -50% keyframe loops without a visible jump.
  const run = TICKER_CODES.map((code) => {
    const c = getChassis(code);
    return html`<span class="ticker__item"><span>${code}</span> ${c ? `${c.make} ${c.model}` : ''}</span>`;
  });
  return html`<div class="ticker" aria-hidden="true">
    <div class="ticker__track">${run}${run}</div>
  </div>`;
}

/* ── The process, before the marketing ──────────────────────── */

const STEPS = [
  {
    n: '01',
    title: 'You send the details',
    body: 'Chassis number, build month and what you need. A part number if you have one, a photograph of the part on the car if you do not.',
  },
  {
    n: '02',
    title: 'We go looking, in Japanese',
    body: 'Auction houses, dismantlers and the retailers we buy from — searched in Japanese, across the whole country, including the places export sites never reach. We check the part against your build month rather than the model year.',
  },
  {
    n: '03',
    title: 'You get a landed price',
    body: `Usually within ${TRADE.quoteDays} business days, in Australian dollars, with duty, GST and freight to your postcode already in it. Photographs and an honest condition grade come with it.`,
  },
  {
    n: '04',
    title: 'You decide',
    body: 'No deposit to quote and no obligation. If we cannot find it, or cannot find one worth buying, we tell you that instead of selling you something else.',
  },
];

function Process() {
  return html`<section class="section">
    <div class="container">
      <div class="section__head">
        <div>
          <p class="eyebrow">How it works</p>
          <h2 class="display-1">A request, start to finish</h2>
        </div>
        ${Button({ label: 'Request a part', href: '/request', variant: 'outline', icon: 'arrow-right', iconAfter: true })}
      </div>
      <ol class="steps">
        ${STEPS.map(
          (step) => html`<li class="step">
            <span class="step__n">${step.n}</span>
            <h3 class="step__title">${step.title}</h3>
            <p class="muted">${step.body}</p>
          </li>`,
        )}
      </ol>
    </div>
  </section>`;
}

/* ── Brands ─────────────────────────────────────────────────── */

function BrandStrip() {
  const featured = FEATURED_BRAND_SLUGS.map(getBrand).filter(Boolean);
  return html`<section class="section section--tight">
    <div class="container">
      <div class="section__head">
        <div>
          <p class="eyebrow">Marques</p>
          <h2 class="display-1">Brands we source</h2>
        </div>
        ${Button({ label: 'All brands', href: '/brands', variant: 'outline', icon: 'arrow-right', iconAfter: true })}
      </div>
      <p class="lede" style="margin-bottom: var(--space-6)">
        Aftermarket and factory performance, alongside genuine parts from every one of the
        makes we cover. We are a sourcing service rather than a distributor — if it exists in
        Japan, we will go and look for it.
      </p>
      <div class="brand-strip">${featured.map((brand) => BrandChip({ brand }))}</div>
    </div>
  </section>`;
}

/* ── Stat band ──────────────────────────────────────────────────
   Counted from the data rather than asserted, so nothing here can
   drift away from what the site actually covers.                    */

function StatBand() {
  const stats = [
    { value: formatNumber(CHASSIS.length), label: 'Chassis codes we cover' },
    { value: formatNumber(BRANDS.length), label: 'Brands we source from' },
    { value: `${TRADE.quoteDays} days`, label: 'Typical time to a landed A$ quote' },
    { value: 'Nothing', label: 'Charged before you see the price' },
  ];

  return html`<section class="stat-band">
    <div class="container">
      <div class="stat-band__grid">
        ${stats.map(
          (s) => html`<div class="stat">
            <span class="stat__value">${s.value}</span>
            <span class="stat__label">${s.label}</span>
          </div>`,
        )}
      </div>
    </div>
  </section>`;
}

/* ── What we source ─────────────────────────────────────────── */

function WhatWeSource() {
  return html`<section class="section">
    <div class="container">
      <div class="section__head">
        <div>
          <p class="eyebrow">${PART_TYPES.length} part types</p>
          <h2 class="display-1">What we source</h2>
        </div>
        ${Button({ label: 'See all', href: '/what-we-source', variant: 'outline', icon: 'arrow-right', iconAfter: true })}
      </div>
      <div class="grid grid--4">
        ${CATEGORIES.map((category) =>
          CategoryCard({ category, count: partTypesIn(category.slug).length }),
        )}
      </div>
    </div>
  </section>`;
}

/* ── Chassis index ──────────────────────────────────────────── */

function ChassisIndex() {
  return html`<section class="section section--tight">
    <div class="container">
      <div class="section__head">
        <div>
          <p class="eyebrow">By chassis code</p>
          <h2 class="display-2">Find what fits your car</h2>
        </div>
      </div>
      <div class="cluster">
        ${CHASSIS.map((c) => html`<a class="tag" href="/${c.code}">${c.code} ${c.make} ${c.model}</a>`)}
      </div>
      <p class="muted" style="margin-top: var(--space-5)">
        Not listed is not a problem — these are the chassis we know best, not the limit of what
        we will look for.
      </p>
    </div>
  </section>`;
}

/* ── Closing enquiry band ───────────────────────────────────── */

function ClosingBand() {
  return html`<section class="band">
    <div class="container band__inner">
      <div class="band__copy">
        <p class="eyebrow">Start here</p>
        <h2 class="display-1">Tell us the part and we will go and find it</h2>
        <p class="lede">
          One request can cover every part you need for the same car. No deposit, no obligation,
          and an honest answer, usually within ${TRADE.quoteDays} business days.
        </p>
      </div>
      ${Button({ label: 'Request a part', href: '/request', variant: 'sunrise', size: 'lg' })}
    </div>
  </section>`;
}

/* ── Page ───────────────────────────────────────────────────── */

export function HomePage() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE.name,
    url: SITE.origin,
    description: SITE.description,
    email: SITE.email,
    areaServed: 'AU',
    knowsAbout: CHASSIS.map((c) => `${c.make} ${c.model} (${c.code})`),
  };

  return Page({
    title: SITE.name,
    description: SITE.description,
    path: '/',
    current: '/',
    structuredData,
    children: html`${Hero()}${Ticker()}${Process()}${BrandStrip()}${StatBand()}${WhatWeSource()}${ChassisIndex()}${ClosingBand()}`,
  });
}
