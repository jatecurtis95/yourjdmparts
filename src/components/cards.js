import { html } from '../html.js';
import { Icon } from './icon.js';
import { brandCategoryLabel } from '../data/brands.js';
import { categoryLabel } from '../data/catalogue.js';

/**
 * Listing cards. None of these carry a pattern layer — they are all
 * listing surfaces.
 *
 * There are no prices and no stock counts anywhere in here. We source to
 * order; a price only exists once we have found the actual part.
 */

/**
 * Supplier logos arrive as black-on-transparent artwork drawn for a light
 * background, and some carry their own brand colour. Painting them through
 * a CSS mask keeps the shape exact while the colour comes from a token —
 * so they read on the dark surface and the five-colour rule still holds.
 *
 * @param {string} logo path under /assets/brands/
 * @param {string} name for the accessible label
 */
function BrandMark(logo, name) {
  return html`<span
    class="brand-mark"
    style="mask-image:url('${logo}');-webkit-mask-image:url('${logo}')"
    role="img"
    aria-label="${name}"
  ></span>`;
}

/**
 * BrandCard.
 *
 * With a `logo` path it renders the real mark. Without one it sets the
 * brand name in the site's own condensed face — which is honest, where an
 * approximated logo would not be. See src/data/brands.js.
 *
 * @param {{brand: object, headingLevel?: 2|3}} props
 */
export function BrandCard({ brand, headingLevel = 3 }) {
  const H = `h${headingLevel}`;

  // Where there is no logo file the wordmark *is* the heading. Printing the
  // name again underneath it just says the same thing twice.
  const heading = brand.logo
    ? html`<div class="brand-card__mark">${BrandMark(brand.logo, brand.name)}</div>
        <${H} class="brand-card__name">${brand.name}</${H}>`
    : html`<${H} class="brand-card__mark brand-card__wordmark">${brand.name}</${H}>`;

  return html`<a class="brand-card" href="/brands/${brand.slug}">
    ${heading}
    <div class="brand-card__body">
      <p class="card-eyebrow">${brandCategoryLabel(brand.category)}</p>
      <p class="muted">${brand.blurb}</p>
    </div>
  </a>`;
}

/** A compact brand chip for the home-page strip. */
export function BrandChip({ brand }) {
  return html`<a class="brand-chip" href="/brands/${brand.slug}">
    ${brand.logo
      ? BrandMark(brand.logo, brand.name)
      : html`<span class="brand-chip__wordmark">${brand.name}</span>`}
  </a>`;
}

/**
 * PartTypeCard — a thing we go and find, not a thing we have.
 * @param {{partType: object, chassis?: string|null, headingLevel?: 2|3}} props
 */
export function PartTypeCard({ partType, chassis = null, headingLevel = 3 }) {
  const H = `h${headingLevel}`;
  const href = chassis
    ? `/request?chassis=${encodeURIComponent(chassis)}&part=${encodeURIComponent(partType.slug)}`
    : `/request?part=${encodeURIComponent(partType.slug)}`;

  return html`<article class="source-card">
    <p class="card-eyebrow">${categoryLabel(partType.category)}</p>
    <${H} class="source-card__name"><a href="${href}">${partType.name}</a></${H}>
    ${partType.note ? html`<p class="muted">${partType.note}</p>` : ''}
    <span class="source-card__cta">${Icon('arrow-right', { size: 16 })}Request this</span>
  </article>`;
}

/** A category tile on the "what we source" index. */
export function CategoryCard({ category, count, chassis = null }) {
  const href = chassis
    ? `/${chassis}#${category.slug}`
    : `/what-we-source?category=${category.slug}`;
  return html`<article class="source-card">
    <h3 class="source-card__name"><a href="${href}">${category.label}</a></h3>
    <p class="muted">${category.blurb}</p>
    <span class="source-card__cta"
      >${Icon('arrow-right', { size: 16 })}${count} ${count === 1 ? 'part type' : 'part types'}</span
    >
  </article>`;
}
