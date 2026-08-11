import { html } from '../html.js';
import { Page } from '../layout.js';
import { SITE, OPERATOR } from '../config.js';
import { Button, Pattern, EmptyState } from '../components/ui.js';
import { Breadcrumb } from '../components/blocks.js';
import { ENTRIES } from '../content/column.js';
import { formatDate } from '../format.js';

/**
 * The Column — index and entry.
 *
 * Entries carry their original publication date and are attributed to the
 * person who wrote them. The index has an empty state for the same reason
 * every other list on this site does: no screen ends in nothing.
 */

export function ColumnPage() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: `The Column — ${SITE.name}`,
    url: `${SITE.origin}/column`,
    blogPost: ENTRIES.map((entry) => ({
      '@type': 'BlogPosting',
      headline: entry.title,
      url: `${SITE.origin}/column/${entry.slug}`,
      datePublished: entry.published,
      author: { '@type': 'Person', name: entry.author },
    })),
  };

  const body = html`<div class="container">
      ${Breadcrumb({ trail: [{ href: '/', label: 'Home' }, { label: 'The Column' }] })}
    </div>

    <section class="page-head patterned">
      ${Pattern()}
      <div class="container page-head__inner">
        <p class="eyebrow">Writing</p>
        <h1 class="display-1" style="font-size: clamp(2.25rem, 6vw, 3.5rem)">The Column</h1>
        <p class="lede">
          Notes from the person doing the searching — how the Japanese market actually works,
          and what it takes to find one specific part in it.
        </p>
      </div>
    </section>

    <div class="container section">
      ${ENTRIES.length
        ? html`<div class="grid grid--2">
            ${ENTRIES.map(
              (entry) => html`<a class="source-card" href="/column/${entry.slug}">
                <p class="card-eyebrow">
                  <time datetime="${entry.published}">${formatDate(entry.published)}</time>
                  · ${entry.author}
                </p>
                <h2 class="source-card__name">${entry.title}</h2>
                <p class="muted">${entry.standfirst}</p>
                <span class="source-card__cta">Read the entry</span>
              </a>`,
            )}
          </div>`
        : EmptyState({
            title: 'Nothing published yet',
            body: 'The first entry is being written. In the meantime, the fastest way to find out how this works is to ask for something.',
            actions: html`${Button({ label: 'Request a part', href: '/request', variant: 'bone' })}`,
          })}
    </div>`;

  return Page({
    title: 'The Column',
    description: `Notes from ${OPERATOR.firstName} on how the Japanese domestic parts market actually works, and what it takes to find one specific part in it.`,
    path: '/column',
    current: '/column',
    structuredData,
    children: body,
  });
}

/** @param {{entry: object}} props */
export function ColumnEntryPage({ entry }) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: entry.title,
    url: `${SITE.origin}/column/${entry.slug}`,
    datePublished: entry.published,
    description: entry.description,
    author: { '@type': 'Person', name: entry.author },
    publisher: { '@type': 'Organization', name: SITE.name, url: SITE.origin },
    mainEntityOfPage: `${SITE.origin}/column/${entry.slug}`,
  };

  const body = html`<div class="container">
      ${Breadcrumb({
        trail: [
          { href: '/', label: 'Home' },
          { href: '/column', label: 'The Column' },
          { label: entry.title },
        ],
      })}
    </div>

    <section class="page-head patterned">
      ${Pattern()}
      <div class="container page-head__inner">
        <p class="eyebrow">The Column</p>
        <h1 class="display-1" style="font-size: clamp(2rem, 5.5vw, 3.25rem)">${entry.title}</h1>
        <p class="lede">${entry.standfirst}</p>
        <p class="article__meta">
          By ${entry.author} ·
          <time datetime="${entry.published}">${formatDate(entry.published)}</time>
        </p>
      </div>
    </section>

    <div class="container section">
      <article class="article">
        ${entry.body.map(
          (block) => html`${block.heading ? html`<h2 class="display-3">${block.heading}</h2>` : ''}
            ${(block.paragraphs ?? []).map((p) => html`<p class="prose">${p}</p>`)}
            ${block.list
              ? html`<dl class="article__list">
                  ${block.list.map(
                    (item) => html`<dt>${item.term}</dt>
                      <dd>${item.detail}</dd>`,
                  )}
                </dl>`
              : ''}`,
        )}

        <hr class="rule" />
        <p class="prose">
          <strong>Chasing something?</strong> Tell us the part and we will tell you what it takes
          to land it. Quoting is free and there is no deposit.
        </p>
        <div class="cluster">
          ${Button({ label: 'Request a part', href: '/request', variant: 'sunrise' })}
          ${Button({ label: 'More from the Column', href: '/column', variant: 'outline' })}
        </div>
      </article>
    </div>`;

  return Page({
    title: entry.title,
    description: entry.description,
    path: `/column/${entry.slug}`,
    current: '/column',
    structuredData,
    children: body,
  });
}
