import { html } from '../html.js';
import { Page } from '../layout.js';
import { SITE, TRADE, LEGAL, OPERATOR, hasLegalIdentity } from '../config.js';
import { Button, Pattern, Card } from '../components/ui.js';
import { Breadcrumb, SpecTable } from '../components/blocks.js';
import { Icon } from '../components/icon.js';

/**
 * Contact.
 *
 * Deliberately not a second form. The request form is the front door and
 * already asks the right questions; duplicating it here would split
 * enquiries across two inboxes and ask people to type their chassis number
 * into whichever one they happened to find. This page gives the direct
 * channels and points at the form for anything that needs a quote.
 */

const CHANNELS = [
  {
    icon: 'mail',
    label: 'Email',
    value: SITE.email,
    href: `mailto:${SITE.email}`,
    note: 'Best for part numbers and photographs. We reply to everything, usually within a day.',
  },
  {
    icon: 'phone',
    label: 'Phone',
    value: SITE.phone,
    href: `tel:${SITE.phoneIntl}`,
    note: 'For a quick conversation about whether a part is worth chasing.',
  },
  {
    icon: 'instagram',
    label: 'Instagram',
    value: `@${SITE.instagram}`,
    href: `https://www.instagram.com/${SITE.instagram}`,
    note: 'Direct messages get read. Good for photographs of the part on your car.',
  },
];

export function ContactPage() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'AutoPartsStore',
    name: SITE.name,
    url: `${SITE.origin}/contact`,
    email: SITE.email,
    telephone: SITE.phoneIntl,
    ...(hasLegalIdentity() ? { legalName: LEGAL.entityName, taxID: LEGAL.abn } : {}),
    address: {
      '@type': 'PostalAddress',
      addressLocality: SITE.suburb,
      addressRegion: 'WA',
      addressCountry: 'AU',
    },
    areaServed: 'AU',
    sameAs: [`https://www.instagram.com/${SITE.instagram}`],
  };

  const body = html`<div class="container">
      ${Breadcrumb({ trail: [{ href: '/', label: 'Home' }, { label: 'Contact' }] })}
    </div>

    <section class="page-head patterned">
      ${Pattern()}
      <div class="container page-head__inner">
        <p class="eyebrow">Contact</p>
        <h1 class="display-1" style="font-size: clamp(2.25rem, 6vw, 3.5rem)">
          Talk to us in English or Japanese
        </h1>
        <p class="lede">
          Tell us what you are chasing — a part number, a chassis code, or just the car and the
          problem. We come back with options and honest pricing. No obligation.
        </p>
      </div>
    </section>

    <div class="container section">
      <div class="split-layout">
        <div>
          <h2 class="display-2" style="margin-bottom: var(--space-5)">How to reach us</h2>
          <div class="grid" style="gap: var(--space-4)">
            ${CHANNELS.map(
              (channel) => html`<a class="source-card" href="${channel.href}">
                <p class="card-eyebrow">${Icon(channel.icon, { size: 16 })}${channel.label}</p>
                <p class="source-card__name">${channel.value}</p>
                <p class="muted">${channel.note}</p>
              </a>`,
            )}
          </div>

          <div class="notice" style="margin-top: var(--space-6)">
            ${Icon('info', { size: 16 })}
            <span
              ><strong>Chasing a specific part?</strong> The request form asks the questions we
              would end up asking you anyway — chassis number, build month, grade — so it gets
              you a quote faster than an email will.</span
            >
          </div>

          <div class="cluster" style="margin-top: var(--space-5)">
            ${Button({ label: 'Request a part', href: '/request', variant: 'bone' })}
            ${Button({ label: 'What we source', href: '/what-we-source', variant: 'outline' })}
          </div>
        </div>

        <div>
          ${Card({
            children: html`<h2 class="display-3" style="margin-bottom: var(--space-5)">Where we are</h2>
              ${SpecTable({
                rows: [
                  { label: 'Trading as', value: SITE.name },
                  ...(hasLegalIdentity()
                    ? [
                        { label: 'Registered name', value: LEGAL.entityName },
                        { label: 'ABN', value: LEGAL.abn },
                      ]
                    : []),
                  { label: 'Run by', value: `${OPERATOR.firstName}, ${OPERATOR.role.toLowerCase()}` },
                  { label: 'Based in', value: SITE.location },
                  { label: 'Freight route', value: `${SITE.route.from} to ${SITE.route.to}` },
                  { label: 'We ship', value: 'Australia-wide' },
                  { label: 'Languages', value: 'English and Japanese' },
                  { label: 'Quote turnaround', value: `${TRADE.quoteDays} business days` },
                ],
              })}
              <hr class="rule" style="margin-block: var(--space-5)" />
              <p class="muted" style="font-size: var(--size-small)">
                We are a sourcing service rather than a shopfront, so there is nothing to walk
                into. Everything happens by email, phone or the request form.
              </p>
              <p class="muted" style="margin-top: var(--space-3); font-size: var(--size-small)">
                <a href="/about">More about who you are dealing with</a>, or read the
                <a href="/terms">terms</a> and <a href="/privacy">privacy policy</a>.
              </p>`,
          })}
        </div>
      </div>
    </div>`;

  return Page({
    title: 'Contact',
    description: `Talk to ${SITE.name} in English or Japanese. Based in ${SITE.suburb}, ${SITE.city}, sourcing Japanese domestic market parts to order and shipping Australia-wide.`,
    path: '/contact',
    current: '/contact',
    structuredData,
    children: body,
  });
}
