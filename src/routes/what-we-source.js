import { html, attrs } from '../html.js';
import { Page } from '../layout.js';
import { SITE } from '../config.js';
import { Button, Tag, EmptyState, Pattern } from '../components/ui.js';
import { Breadcrumb } from '../components/blocks.js';
import { Icon } from '../components/icon.js';
import { PartTypeCard } from '../components/cards.js';
import { CATEGORIES, PART_TYPES, categoryLabel, getCategory } from '../data/catalogue.js';
import { CHASSIS, getChassis } from '../data/chassis.js';

/**
 * What we source.
 *
 * A browse surface over part *types*, not stock. There is nothing priced
 * here because a price only exists once we have found the actual part.
 * Every card leads to a request with the details pre-filled.
 */

function buildUrl(params, overrides) {
  const next = new URLSearchParams(params);
  for (const [key, value] of Object.entries(overrides)) {
    if (value === null || value === '') next.delete(key);
    else next.set(key, value);
  }
  const qs = next.toString();
  return '/what-we-source' + (qs ? `?${qs}` : '');
}

function applyFilters(params) {
  const category = params.get('category');
  return PART_TYPES.filter((p) => !category || p.category === category);
}

function Facet({ title, items, params, paramKey, hrefFor }) {
  const active = params.get(paramKey);
  return html`<div>
    <h2 class="facet__title">${title}</h2>
    <div class="facet__list">
      ${items.map((item) => {
        const isActive = active === item.value;
        return html`<a
          class="facet__link"
          href="${hrefFor ? hrefFor(item) : buildUrl(params, { [paramKey]: isActive ? null : item.value })}"
          ${attrs({ 'aria-current': isActive ? 'true' : null })}
        >
          <span>${item.label}</span>
          ${item.count === undefined ? '' : html`<span class="facet__count">${item.count}</span>`}
        </a>`;
      })}
    </div>
  </div>`;
}

/** @param {URL} url */
export function WhatWeSourcePage(url) {
  const params = url.searchParams;
  const activeCategory = params.get('category');
  const chassisParam = params.get('chassis');
  const chassis = chassisParam ? getChassis(chassisParam) : null;
  const results = applyFilters(params);

  const chips = [
    activeCategory && {
      label: categoryLabel(activeCategory),
      href: buildUrl(params, { category: null }),
    },
    chassis && { label: chassis.code, href: buildUrl(params, { chassis: null }) },
  ].filter(Boolean);

  const category = activeCategory ? getCategory(activeCategory) : null;

  const body = html`<div class="container">
      ${Breadcrumb({ trail: [{ href: '/', label: 'Home' }, { label: 'What we source' }] })}
    </div>

    <section class="page-head patterned">
      ${Pattern()}
      <div class="container page-head__inner">
        <p class="eyebrow">Sourced to order</p>
        <h1 class="display-1" style="font-size: clamp(2.25rem, 6vw, 3.5rem)">
          ${category ? category.label : 'What we source'}
        </h1>
        <p class="lede">
          ${category
            ? category.blurb
            : 'We hold no stock. This is what we go and find — at auction, through dismantlers, and from the retailers we buy from in Japan. Pick the closest thing to what you need and the request form will arrive pre-filled.'}
        </p>
      </div>
    </section>

    <div class="container catalogue">
      <aside class="facets" id="facets" data-open="false" aria-label="Filter part types">
        ${Facet({
          title: 'Category',
          paramKey: 'category',
          params,
          items: CATEGORIES.map((c) => ({
            value: c.slug,
            label: c.label,
            count: PART_TYPES.filter((p) => p.category === c.slug).length,
          })),
        })}
        ${Facet({
          title: 'Chassis',
          paramKey: 'chassis',
          params,
          items: CHASSIS.map((c) => ({ value: c.code, label: `${c.code} ${c.model}` })),
          hrefFor: (item) => `/${item.value}`,
        })}
      </aside>

      <div>
        <div class="catalogue__toolbar">
          <div class="cluster">
            <button class="btn btn--outline facets-toggle" type="button" data-facets-toggle aria-expanded="false" aria-controls="facets">
              ${Icon('filter', { size: 16 })}Filters
            </button>
            <p class="muted">
              ${results.length} ${results.length === 1 ? 'part type' : 'part types'}
            </p>
          </div>
          ${Button({ label: 'Request a part', href: '/request', variant: 'bone' })}
        </div>

        ${chips.length
          ? html`<div class="catalogue__chips">
              ${chips.map((chip) => Tag({ label: chip.label, dismissHref: chip.href }))}
              <a class="tag" href="/what-we-source">Clear all</a>
            </div>`
          : ''}

        ${results.length
          ? html`<div class="grid grid--3">
              ${results.map((partType) =>
                PartTypeCard({ partType, chassis: chassis ? chassis.code : null }),
              )}
            </div>`
          : EmptyState({
              title: 'Nothing listed under that',
              body: 'This list is what we are asked for most, not the limit of what we will look for. Send the request anyway and we will go and see.',
              actions: html`${Button({ label: 'Request a part', href: '/request', variant: 'bone' })}
              ${Button({ label: 'See everything', href: '/what-we-source', variant: 'outline' })}`,
            })}

        <div class="notice" style="margin-top: var(--space-7)">
          ${Icon('info', { size: 16 })}
          <span
            ><strong>Not seeing it is not a problem.</strong> This is the list we are asked for
            most often, not the limit of what we can find. If it came on a Japanese-market car,
            tell us and we will go looking.</span
          >
        </div>
      </div>
    </div>`;

  return Page({
    title: category ? `${category.label} parts sourced from Japan` : 'What we source',
    description: category
      ? `${category.blurb} Sourced to order from Japan by ${SITE.name}, quoted in landed Australian dollars.`
      : 'The Japanese domestic market parts we source to order — engine, drivetrain, suspension, brakes, body, interior, lighting and wheels. Quoted in landed Australian dollars.',
    path: '/what-we-source',
    current: '/what-we-source',
    children: body,
  });
}
