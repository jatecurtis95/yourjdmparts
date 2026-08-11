import { html } from '../html.js';
import { Page } from '../layout.js';
import { SITE, TRADE, OPERATOR, LEGAL, hasLegalIdentity } from '../config.js';
import { Button, Pattern, Card } from '../components/ui.js';
import { Breadcrumb, SpecTable } from '../components/blocks.js';
import { Icon } from '../components/icon.js';
import { ToriiMark } from '../components/logo.js';

/**
 * About.
 *
 * The audit's dominant finding was that the site had no visible human behind
 * it. This page is the answer, and every claim on it is one Emi has already
 * made publicly in her own writing — that she is the founder, that she grew
 * up in Japan, and where she actually looks for a part. Nothing about years
 * in business, volumes shipped or credentials appears here, because none of
 * that has been verified.
 *
 * Where she is quoted, it is marked as a quotation and attributed.
 */

/** Emi's own account of where the searching happens, from her Logbook entry. */
const WHERE_WE_LOOK = [
  {
    title: 'Dealer parts counters',
    body: 'Plenty of parts written off as discontinued can still be back-ordered new from the manufacturer — but only through a Japanese dealer, in Japanese, and sometimes only if you know how to ask.',
  },
  {
    title: 'Domestic auctions and marketplaces',
    body: 'Japan’s online auctions turn over an enormous volume of parts daily. The listings are written in Japanese shorthand full of model codes and slang. If you cannot read them, you cannot find them, let alone judge them.',
  },
  {
    title: 'Second-hand parts chains',
    body: 'Japan has entire national store networks dedicated to used performance parts. Stock changes daily, store by store, and most of it is never listed in English anywhere.',
  },
  {
    title: 'Dismantlers and parts yards',
    body: 'When a car is de-registered in Japan its parts scatter into yards across the country. Ringing a yard in rural Japan and asking the right question in the right register of politeness is not something a search engine does.',
  },
  {
    title: 'Small specialist shops',
    body: 'Every corner of Japan has small shops that live and breathe one make or one era. Some barely have a website. They answer the phone, though — in Japanese.',
  },
];

export function AboutPage() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    url: `${SITE.origin}/about`,
    mainEntity: {
      '@type': 'Organization',
      name: SITE.name,
      url: SITE.origin,
      email: SITE.email,
      telephone: SITE.phoneIntl,
      ...(hasLegalIdentity() ? { legalName: LEGAL.entityName, taxID: LEGAL.abn } : {}),
      address: {
        '@type': 'PostalAddress',
        addressLocality: SITE.suburb,
        addressRegion: 'WA',
        addressCountry: 'AU',
      },
      founder: { '@type': 'Person', name: OPERATOR.firstName },
      knowsLanguage: ['en-AU', 'ja'],
    },
  };

  const body = html`<div class="container">
      ${Breadcrumb({ trail: [{ href: '/', label: 'Home' }, { label: 'About' }] })}
    </div>

    <section class="page-head patterned">
      ${Pattern()}
      <div class="container page-head__inner">
        <p class="eyebrow">Who you are dealing with</p>
        <h1 class="display-1" style="font-size: clamp(2.25rem, 6vw, 3.5rem)">
          A person in Perth who reads Japanese
        </h1>
        <p class="lede">
          Most used JDM parts reach Australia with no history attached, bought from a listing
          somebody else translated. We work the other way round.
        </p>
      </div>
    </section>

    <section class="container panel">
      <div class="panel__copy">
        <p class="eyebrow">${OPERATOR.role}</p>
        <h2 class="display-1">${OPERATOR.firstName}</h2>
        <p class="prose">
          ${SITE.name} is run by ${OPERATOR.firstName}, who grew up in Japan and does the
          searching herself, in Japanese. That is not a detail — it is most of the advantage.
          The parts worth having surface inside Japan, in Japanese, and almost none of it
          reaches an English-language export site.
        </p>
        <blockquote class="quote">
          <p>
            I don’t just read the listings — I read between their lines. I can tell when a
            seller’s wording is hiding a repair, when a price is a bargain because the seller
            mislabelled the part, and when something smells wrong.
          </p>
          <footer class="quote__cite">
            ${OPERATOR.firstName}, in
            <a href="/column/searching-all-of-japan">How I search all of Japan for one part</a>
          </footer>
        </blockquote>
        <p class="prose">
          She is in ${SITE.suburb}, ${SITE.city}, so you are dealing with somebody in your own
          time zone who can also ring a supplier in theirs. Conversations happen in English or
          Japanese, whichever suits.
        </p>
      </div>
      <div class="panel__media">${ToriiMark({ size: 160, mono: true })}</div>
    </section>

    <section class="section section--tight">
      <div class="container">
        <div class="section__head">
          <div>
            <p class="eyebrow">The work</p>
            <h2 class="display-1">Where we actually look</h2>
          </div>
          ${Button({ label: 'Read the full account', href: '/column/searching-all-of-japan', variant: 'outline', icon: 'arrow-right', iconAfter: true })}
        </div>
        <div class="grid grid--3">
          ${WHERE_WE_LOOK.map(
            (place) => html`<div class="card">
              <h3 class="display-3" style="margin-bottom: var(--space-2)">${place.title}</h3>
              <p class="muted">${place.body}</p>
            </div>`,
          )}
        </div>
      </div>
    </section>

    <section class="section section--tight">
      <div class="container">
        <div class="split-layout">
          <div class="stack">
            <h2 class="display-1">What we will not do</h2>
            <p class="prose">
              We hold no stock, which means we are never trying to talk you into the part we
              happen to have. If we cannot find yours, we say so rather than quoting you
              something adjacent and hoping you do not notice.
            </p>
            <p class="prose">
              We do not sell a copy dressed up as the real thing. Where a part is aftermarket or
              a reproduction, the quote says so in plain words.
            </p>
            <p class="prose">
              And nothing is bought sight unseen. A part is inspected and photographed before we
              buy it, graded against a scale we publish, and described with its faults intact. A
              worn bolster is a worn bolster.
            </p>
            <div class="cluster">
              ${Button({ label: 'How it works', href: '/how-it-works', variant: 'bone' })}
              ${Button({ label: 'Shipping and returns', href: '/shipping-and-returns', variant: 'outline' })}
            </div>
          </div>

          <div>
            ${Card({
              children: html`<h2 class="display-3" style="margin-bottom: var(--space-5)">
                  The business
                </h2>
                ${SpecTable({
                  rows: [
                    { label: 'Trading as', value: SITE.name },
                    ...(hasLegalIdentity()
                      ? [
                          { label: 'Registered name', value: LEGAL.entityName },
                          { label: 'ABN', value: LEGAL.abn },
                        ]
                      : []),
                    { label: 'Based in', value: SITE.location },
                    { label: 'Run by', value: `${OPERATOR.firstName}, ${OPERATOR.role.toLowerCase()}` },
                    { label: 'Languages', value: 'English and Japanese' },
                    { label: 'Freight route', value: `${SITE.route.from} to ${SITE.route.to}` },
                    { label: 'We ship', value: 'Australia-wide' },
                    { label: 'Quote turnaround', value: `${TRADE.quoteDays} business days` },
                  ],
                })}
                <hr class="rule" style="margin-block: var(--space-5)" />
                <p class="muted" style="font-size: var(--size-small)">
                  We are a sourcing service rather than a shopfront, so there is nothing to walk
                  into. Everything happens by email, phone or the request form.
                </p>`,
            })}
          </div>
        </div>
      </div>
    </section>

    <section class="band">
      <div class="container band__inner">
        <div class="band__copy">
          <p class="eyebrow">No deposit, no obligation</p>
          <h2 class="display-1">Send us the car and the problem</h2>
          <p class="lede">
            You do not need the part number and you do not need to be sure it exists. We will
            tell you what we can find and what it lands at.
          </p>
        </div>
        ${Button({ label: 'Request a part', href: '/request', variant: 'sunrise', size: 'lg' })}
      </div>
    </section>`;

  return Page({
    title: 'About',
    description: `${SITE.name} is run by ${OPERATOR.firstName} from ${SITE.suburb}, ${SITE.city}. She grew up in Japan and does the searching herself, in Japanese — dealer counters, domestic auctions, dismantlers and specialist shops.`,
    path: '/about',
    current: '/about',
    structuredData,
    children: body,
  });
}
