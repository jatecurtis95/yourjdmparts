import { html } from '../html.js';
import { Page } from '../layout.js';
import { TRADE } from '../config.js';
import { Button, Pattern } from '../components/ui.js';
import { ToriiMark } from '../components/logo.js';
import { CHASSIS } from '../data/chassis.js';
import { BRANDS } from '../data/brands.js';
import { formatNumber } from '../format.js';

/**
 * How it works / provenance — alternating photo-led editorial panels.
 * Photography is documentary. Where it is missing the panel falls back
 * to the faint mono torii rather than a placeholder box.
 */

const PANELS = [
  {
    eyebrow: 'One',
    title: 'Sourcing',
    body: [
      'We hold no stock, which is the point. Rather than buying whatever is cheap and hoping someone wants it, we go looking for the specific part your car needs — at auction, through the dismantlers we deal with, and from Japanese retailers when new is the better answer.',
      'The searching is done in Japanese, which is most of the advantage. Dealer counters, auction listings, second-hand chains and small specialist shops are where the discontinued parts are, and almost none of it surfaces on an English-language export site.',
      'That takes longer than pulling something off a shelf. It also means we are not trying to talk you into the part we happen to have.',
    ],
  },
  {
    eyebrow: 'Two',
    title: 'Inspection',
    body: [
      'Nothing gets bought sight unseen. Parts are inspected before purchase, photographed under plain light rather than staged, and graded against a scale we publish rather than one we keep to ourselves.',
      'We state wear plainly. A worn bolster is a worn bolster, a weeping seal is a weeping seal. If a part is not worth the freight, we will say so before you have paid for it.',
    ],
  },
  {
    eyebrow: 'Three',
    title: 'Landing it',
    body: [
      'Parts are consolidated in Japan and shipped in sea freight containers, which is slower than air and materially cheaper. Duty, GST and customs clearance are handled before the part reaches you.',
      'The number we quote is landed in Australian dollars. There is no second invoice when it arrives and no surprise from a courier at your door.',
    ],
  },
];

function Panel({ panel, index }) {
  const flip = index % 2 === 1;
  return html`<section class="container panel${flip ? ' panel--flip' : ''}">
    <div class="panel__copy">
      <p class="eyebrow">${panel.eyebrow}</p>
      <h2 class="display-1">${panel.title}</h2>
      ${panel.body.map((paragraph) => html`<p class="prose">${paragraph}</p>`)}
    </div>
    <div class="panel__media">${ToriiMark({ size: 160, mono: true })}</div>
  </section>`;
}

export function HowItWorksPage() {
  const stats = [
    { value: 'No stock', label: 'We find the part your car needs' },
    { value: formatNumber(BRANDS.length), label: 'Brands we source from' },
    { value: `${TRADE.quoteDays} days`, label: 'To a landed A$ quote' },
    { value: 'Landed A$', label: 'Duty and GST already in the price' },
  ];

  const body = html`<section class="page-head patterned">
      ${Pattern()}
      <div class="container page-head__inner">
        <p class="eyebrow">Provenance</p>
        <h1 class="display-1" style="font-size: clamp(2.25rem, 6vw, 4rem)">
          How we find parts, and how we know what they are
        </h1>
        <p class="lede">
          Most used JDM parts reach Australia with no history attached. We work the other way
          round: find the specific part, record what it came off, and tell you what is wrong
          with it before you buy it.
        </p>
      </div>
    </section>

    ${PANELS.map((panel, index) => Panel({ panel, index }))}

    <section class="stat-band patterned">
      ${Pattern()}
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
    </section>

    <section class="section">
      <div class="container">
        <h2 class="display-1" style="margin-bottom: var(--space-5)">How we grade</h2>
        <p class="prose" style="margin-bottom: var(--space-6)">
          Every quote carries a grade and a written description of the wear. These mean the same
          thing every time, and they are the same words we use to each other.
        </p>
        <div class="grid grid--4">
          ${[
            { grade: 'Excellent', body: 'No notable wear. Presents as it left the factory, allowing for age.' },
            { grade: 'Good', body: 'Light cosmetic wear, fully serviceable. The wear is described in the quote.' },
            { grade: 'Fair', body: 'Visible wear or a known fault, described in full. Serviceable as sold.' },
            { grade: 'Spares or repair', body: 'For rebuild or parts. We say exactly what is wrong with it.' },
          ].map(
            (g) => html`<div class="card">
              <h3 class="display-3" style="margin-bottom: var(--space-2)">${g.grade}</h3>
              <p class="muted">${g.body}</p>
            </div>`,
          )}
        </div>
      </div>
    </section>

    <section class="section section--tight">
      <div class="container">
        <h2 class="display-1" style="margin-bottom: var(--space-5)">What it costs</h2>
        <div class="grid grid--3">
          ${[
            {
              title: 'Quoting is free',
              body: `No deposit and no obligation. You get a landed A$ figure within ${TRADE.quoteDays} business days, and nothing is charged until you say yes to it.`,
            },
            {
              title: 'One number, landed',
              body: 'The price includes the part, freight from Japan, duty, GST, customs clearance and delivery to your postcode. There is no second invoice.',
            },
            {
              title: 'If we cannot find it',
              body: 'We tell you. We do not quote you a different part and hope you do not notice, and we do not keep the request open indefinitely without saying so.',
            },
          ].map(
            (c) => html`<div class="card">
              <h3 class="display-3" style="margin-bottom: var(--space-2)">${c.title}</h3>
              <p class="muted">${c.body}</p>
            </div>`,
          )}
        </div>
      </div>
    </section>

    <section class="band patterned">
      ${Pattern()}
      <div class="container band__inner">
        <div class="band__copy">
          <p class="eyebrow">${formatNumber(CHASSIS.length)} chassis codes and counting</p>
          <h2 class="display-2">Start with one part</h2>
          <p class="lede">
            You do not need to know the part number, and you do not need to be sure it exists.
            Send us the car and the problem, and we will tell you what we can find and what it
            lands at.
          </p>
        </div>
        ${Button({ label: 'Request a part', href: '/request', variant: 'sunrise', size: 'lg' })}
      </div>
    </section>`;

  return Page({
    title: 'How it works',
    description:
      'We hold no stock. We find the specific Japanese domestic market part your car needs, inspect it before buying, and land it in Australia with duty and GST already paid.',
    path: '/how-it-works',
    current: '/how-it-works',
    children: body,
  });
}
