import { html } from '../html.js';
import { Page } from '../layout.js';
import { SITE } from '../config.js';
import { Button, Pattern, Badge, Card } from '../components/ui.js';
import { Breadcrumb, SpecTable } from '../components/blocks.js';
import { publishedFinds, COST_FIELDS, itemisedTotal } from '../data/finds.js';
import { formatAud, formatDate } from '../format.js';

/**
 * Recent finds — index, card and detail.
 *
 * Every field is optional at render time. An entry that knows the car, the
 * part and the landed total renders a complete-looking page; one that also
 * has photographs, a grade and a testimonial renders a richer one. Nothing
 * prints a placeholder, an em dash or a "coming soon" in place of a fact we
 * do not have — the row simply is not there.
 */

/** Rows built only from the fields that are actually present. */
function detailRows(find) {
  return [
    find.vehicle && { label: 'Vehicle', value: find.vehicle },
    find.chassisCode && { label: 'Chassis', value: find.chassisCode },
    find.requestedPart && { label: 'Part requested', value: find.requestedPart },
    find.source && { label: 'Found at', value: find.source },
    find.grade && { label: 'Condition grade', value: find.grade },
    typeof find.quoteDays === 'number' && {
      label: 'Quote turnaround',
      value: `${find.quoteDays} business ${find.quoteDays === 1 ? 'day' : 'days'}`,
    },
    find.deliveryTimeline && { label: 'Delivered in', value: find.deliveryTimeline },
    find.completed && { label: 'Completed', value: formatDate(find.completed) },
  ].filter(Boolean);
}

/** @param {{find: object}} props */
export function FindCard({ find }) {
  const lead = find.images[0] ?? null;
  return html`<a class="find-card" href="/finds/${find.slug}">
    ${lead
      ? html`<img class="find-card__media" src="${lead.src}" alt="${lead.alt}" loading="lazy" />`
      : ''}
    <div class="find-card__body">
      <p class="card-eyebrow">
        ${find.chassisCode ? html`${find.chassisCode} · ` : ''}
        ${find.completed ? formatDate(find.completed) : 'Recent'}
      </p>
      <h3 class="find-card__title">${find.title}</h3>
      ${find.problem ? html`<p class="muted">${find.problem}</p>` : ''}
      <p class="find-card__price">
        <span class="price">${formatAud(find.totalCents)}</span>
        <span class="muted">landed</span>
      </p>
    </div>
  </a>`;
}

export function FindsPage() {
  const finds = publishedFinds();

  const body = html`<div class="container">
      ${Breadcrumb({ trail: [{ href: '/', label: 'Home' }, { label: 'Recent finds' }] })}
    </div>

    <section class="page-head patterned">
      ${Pattern()}
      <div class="container page-head__inner">
        <p class="eyebrow">Proof</p>
        <h1 class="display-1" style="font-size: clamp(2.25rem, 6vw, 3.5rem)">Recent finds</h1>
        <p class="lede">
          Real parts, real cars and the actual landed numbers — part, freight, duty and GST
          broken out, with what the inspection turned up before we bought it.
        </p>
      </div>
    </section>

    <div class="container section">
      <div class="grid grid--3">${finds.map((find) => FindCard({ find }))}</div>
    </div>

    <section class="band">
      <div class="container band__inner">
        <div class="band__copy">
          <p class="eyebrow">Yours next</p>
          <h2 class="display-1">Tell us what your car needs</h2>
          <p class="lede">
            Quoting is free and there is no deposit. You get one landed A$ figure with duty and
            GST already in it.
          </p>
        </div>
        ${Button({ label: 'Request a part', href: '/request', variant: 'sunrise', size: 'lg' })}
      </div>
    </section>`;

  return Page({
    title: 'Recent finds',
    description: `Parts ${SITE.name} has actually sourced, with the real landed cost broken out — part, freight, duty and GST — and what the inspection found.`,
    path: '/finds',
    current: '/finds',
    children: body,
  });
}

/** @param {{find: object}} props */
export function FindPage({ find }) {
  const itemised = itemisedTotal(find);
  const costs = COST_FIELDS.filter(({ key }) => typeof find[key] === 'number');

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: find.title,
    url: `${SITE.origin}/finds/${find.slug}`,
    ...(find.completed ? { datePublished: find.completed } : {}),
    publisher: { '@type': 'Organization', name: SITE.name, url: SITE.origin },
    ...(find.images.length
      ? { image: find.images.map((image) => SITE.origin + image.src) }
      : {}),
  };

  const body = html`<div class="container">
      ${Breadcrumb({
        trail: [
          { href: '/', label: 'Home' },
          { href: '/finds', label: 'Recent finds' },
          { label: find.title },
        ],
      })}
    </div>

    <section class="page-head patterned">
      ${Pattern()}
      <div class="container page-head__inner">
        <p class="eyebrow">
          ${find.vehicle ?? 'Recent find'}${find.chassisCode ? html` · ${find.chassisCode}` : ''}
        </p>
        <h1 class="display-1" style="font-size: clamp(2rem, 5.5vw, 3.25rem)">${find.title}</h1>
        ${find.problem ? html`<p class="lede">${find.problem}</p>` : ''}
      </div>
    </section>

    <div class="container section">
      <div class="split-layout">
        <div class="stack">
          ${find.inspection
            ? html`<div class="stack">
                <h2 class="display-2">What the inspection found</h2>
                ${find.grade ? Badge({ label: find.grade, tone: 'condition' }) : ''}
                <p class="prose">${find.inspection}</p>
              </div>`
            : ''}
          ${find.outcome
            ? html`<div class="stack">
                <h2 class="display-2">How it ended</h2>
                <p class="prose">${find.outcome}</p>
              </div>`
            : ''}
          ${find.testimonial
            ? html`<blockquote class="quote">
                <p>${find.testimonial.quote}</p>
                <footer class="quote__cite">${find.testimonial.attribution}</footer>
              </blockquote>`
            : ''}
          ${find.images.length
            ? html`<div class="stack">
                <h2 class="display-2">Photographs</h2>
                <div class="find-gallery">
                  ${find.images.map(
                    (image) => html`<figure class="find-figure">
                      <img src="${image.src}" alt="${image.alt}" loading="lazy" />
                      ${image.caption
                        ? html`<figcaption class="muted">${image.caption}</figcaption>`
                        : ''}
                    </figure>`,
                  )}
                </div>
              </div>`
            : ''}
        </div>

        <div class="stack">
          ${Card({
            children: html`<h2 class="display-3" style="margin-bottom: var(--space-5)">
                The job
              </h2>
              ${SpecTable({ rows: detailRows(find) })}`,
          })}
          ${Card({
            children: html`<h2 class="display-3" style="margin-bottom: var(--space-5)">
                What it cost
              </h2>
              ${costs.length
                ? html`<table class="spec-table">
                    <tbody>
                      ${costs.map(
                        ({ key, label }) => html`<tr>
                          <th scope="row">${label}</th>
                          <td>${formatAud(find[key])}</td>
                        </tr>`,
                      )}
                      <tr>
                        <th scope="row">Total landed</th>
                        <td><span class="price">${formatAud(find.totalCents)}</span></td>
                      </tr>
                    </tbody>
                  </table>`
                : html`<p class="price">${formatAud(find.totalCents)}</p>
                    <p class="muted">Total landed.</p>`}
              <p class="muted" style="margin-top: var(--space-4); font-size: var(--size-small)">
                ${itemised !== null && itemised !== find.totalCents
                  ? 'Figures are the actual amounts for this job.'
                  : 'One number, landed. No second invoice on arrival.'}
              </p>`,
          })}
          ${Button({ label: 'Ask for something similar', href: '/request', variant: 'sunrise', block: true })}
        </div>
      </div>
    </div>`;

  return Page({
    title: find.title,
    description:
      `${find.requestedPart ?? find.title}${find.vehicle ? ` for a ${find.vehicle}` : ''}, sourced from Japan and landed for ${formatAud(find.totalCents)} with duty and GST included.`,
    path: `/finds/${find.slug}`,
    current: '/finds',
    structuredData,
    children: body,
  });
}
