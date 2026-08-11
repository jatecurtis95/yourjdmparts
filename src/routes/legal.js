import { html } from '../html.js';
import { Page } from '../layout.js';
import { SITE } from '../config.js';
import { Pattern, Button } from '../components/ui.js';
import { Breadcrumb } from '../components/blocks.js';
import { PRIVACY, TERMS, SHIPPING } from '../content/legal.js';
import { formatDate } from '../format.js';

/**
 * Privacy, terms, and shipping and returns.
 *
 * One shared long-form shell. These pages are read when somebody is deciding
 * whether to trust us with a few thousand dollars and a chassis number, so
 * they get a contents list, real headings and a way back to the thing they
 * were doing — not a wall of grey text ending in nothing.
 *
 * No pattern below the page head: the brief keeps it off reading surfaces.
 */

const slug = (heading) =>
  heading
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

/**
 * @param {{
 *   title: string, path: string, eyebrow: string, standfirst: string,
 *   doc: {updated: string, intro: string[], sections: Array<{heading: string, body?: string[], list?: string[]}>},
 *   description: string,
 * }} props
 */
function PolicyPage({ title, path, eyebrow, standfirst, doc, description }) {
  const body = html`<div class="container">
      ${Breadcrumb({ trail: [{ href: '/', label: 'Home' }, { label: title }] })}
    </div>

    <section class="page-head patterned">
      ${Pattern()}
      <div class="container page-head__inner">
        <p class="eyebrow">${eyebrow}</p>
        <h1 class="display-1" style="font-size: clamp(2.25rem, 6vw, 3.5rem)">${title}</h1>
        <p class="lede">${standfirst}</p>
      </div>
    </section>

    <div class="container section">
      <div class="doc">
        <aside class="doc__aside">
          <nav class="doc__toc" aria-labelledby="toc-title">
            <h2 class="footer-col__title" id="toc-title">On this page</h2>
            <ul>
              ${doc.sections.map(
                (section) =>
                  html`<li><a href="#${slug(section.heading)}">${section.heading}</a></li>`,
              )}
            </ul>
          </nav>
        </aside>

        <div class="doc__body">
          <p class="doc__updated">Last updated ${formatDate(doc.updated)}</p>
          ${doc.intro.map((paragraph) => html`<p class="lede">${paragraph}</p>`)}

          ${doc.sections.map(
            (section) => html`<section class="doc__section" id="${slug(section.heading)}">
              <h2 class="display-3">${section.heading}</h2>
              ${(section.body ?? []).map((paragraph) => html`<p class="prose">${paragraph}</p>`)}
              ${section.list
                ? html`<ul class="doc__list">
                    ${section.list.map((item) => html`<li>${item}</li>`)}
                  </ul>`
                : ''}
            </section>`,
          )}

          <hr class="rule" />
          <p class="prose">
            Anything here you want explained in plain language, ask. We would rather answer the
            question than have you guess.
          </p>
          <div class="cluster">
            ${Button({ label: 'Contact us', href: '/contact', variant: 'bone' })}
            ${Button({ label: 'Request a part', href: '/request', variant: 'outline' })}
          </div>
        </div>
      </div>
    </div>`;

  return Page({ title, description, path, current: path, children: body });
}

export function PrivacyPage() {
  return PolicyPage({
    title: 'Privacy',
    path: '/privacy',
    eyebrow: 'Your information',
    standfirst:
      'What we collect, why we need it, and who sees it. This site sets no cookies and runs no tracking scripts.',
    description: `How ${SITE.name} handles the details you send with a part request. No cookies, no tracking scripts, and nothing sold to anybody.`,
    doc: PRIVACY,
  });
}

export function TermsPage() {
  return PolicyPage({
    title: 'Terms',
    path: '/terms',
    eyebrow: 'The agreement',
    standfirst:
      'What you can expect from us, what we need from you, and what a quote actually commits either of us to.',
    description: `The terms covering ${SITE.name} quotes and sourcing: free quoting, landed A$ pricing, honest grading, and your rights under the Australian Consumer Law.`,
    doc: TERMS,
  });
}

export function ShippingPage() {
  return PolicyPage({
    title: 'Shipping and returns',
    path: '/shipping-and-returns',
    eyebrow: 'Getting it to you',
    standfirst:
      'How parts travel from Japan, what to do if one arrives damaged, and where you stand on a used part.',
    description: `Freight from ${SITE.route.from} to ${SITE.route.to}, duty and GST included, damage claims handled by us, and honest terms on used parts.`,
    doc: SHIPPING,
  });
}
