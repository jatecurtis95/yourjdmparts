import { html } from '../html.js';
import { Page } from '../layout.js';
import { Button, EmptyState } from '../components/ui.js';
import { CHASSIS } from '../data/chassis.js';

/**
 * No screen ends in nothing. Both of these give the visitor somewhere
 * to go rather than a dead end.
 */

/** @param {{path?: string, serverError?: boolean}} [props] */
export function NotFoundPage({ path = '', serverError = false } = {}) {
  const title = serverError ? 'Something broke at our end' : 'That page is not here';
  const body = serverError
    ? 'This one is on us, not on you. Try again in a moment, or go straight to the catalogue.'
    : 'The page may have moved. The fastest way back in is to tell us what you are after, or to look at what we source.';

  return Page({
    title,
    description: body,
    path: path || '/404',
    noindex: true,
    children: html`<div class="container section">
      ${EmptyState({
        title,
        body,
        actions: html`${Button({ label: 'What we source', href: '/what-we-source', variant: 'bone' })}
        ${Button({ label: 'Request a part', href: '/request', variant: 'outline' })}`,
      })}

      <div style="margin-top: var(--space-8)">
        <h2 class="display-3" style="margin-bottom: var(--space-4)">Or jump to a chassis code</h2>
        <div class="cluster">
          ${CHASSIS.map((c) => html`<a class="tag" href="/${c.code}">${c.code}</a>`)}
        </div>
      </div>
    </div>`,
  });
}
