import { html, attrs } from '../html.js';
import { Icon } from './icon.js';

/**
 * SpecTable, Tabs, Dialog and Breadcrumb.
 *
 * SpecTable and Tabs are content surfaces — no pattern layer behind either.
 * Dialog carries the only shadow in the system.
 */

/* ── SpecTable ──────────────────────────────────────────────── */

/** @param {{rows: Array<{label: string, value: string}>, caption?: string|null}} props */
export function SpecTable({ rows, caption = null }) {
  return html`<table class="spec-table">
    ${caption ? html`<caption>${caption}</caption>` : ''}
    <tbody>
      ${rows.map(
        (row) => html`<tr>
          <th scope="row">${row.label}</th>
          <td>${row.value}</td>
        </tr>`,
      )}
    </tbody>
  </table>`;
}

/* ── Tabs ───────────────────────────────────────────────────────
   Progressive enhancement: with no JavaScript every panel is visible
   and readable, which also keeps all of it in the indexed HTML.      */

/** @param {{id: string, tabs: Array<{id: string, label: string, panel: unknown}>}} props */
export function Tabs({ id, tabs }) {
  return html`<div class="tabs" data-tabs id="${id}">
    <div class="tabs__list" role="tablist">
      ${tabs.map(
        (tab, i) =>
          html`<button
            class="tabs__tab"
            type="button"
            role="tab"
            id="${id}-tab-${tab.id}"
            aria-controls="${id}-panel-${tab.id}"
            aria-selected="${i === 0 ? 'true' : 'false'}"
          >
            ${tab.label}
          </button>`,
      )}
    </div>
    ${tabs.map(
      (tab, i) =>
        html`<div
          class="tabs__panel"
          role="tabpanel"
          id="${id}-panel-${tab.id}"
          aria-labelledby="${id}-tab-${tab.id}"
          ${attrs({ 'data-initial': i === 0 ? 'true' : null })}
        >
          ${tab.panel}
        </div>`,
    )}
  </div>`;
}

/* ── Dialog ─────────────────────────────────────────────────── */

/** @param {{id: string, title: string, body: unknown, foot?: unknown}} props */
export function Dialog({ id, title, body, foot = null }) {
  return html`<dialog class="dialog" id="${id}" aria-labelledby="${id}-title">
    <div class="dialog__head">
      <h2 class="display-3" id="${id}-title">${title}</h2>
      <button class="icon-btn" type="button" data-dialog-close aria-label="Close">
        ${Icon('x')}
      </button>
    </div>
    <div class="dialog__body">${body}</div>
    ${foot ? html`<div class="dialog__foot">${foot}</div>` : ''}
  </dialog>`;
}

/* ── Breadcrumb ─────────────────────────────────────────────── */

/** @param {{trail: Array<{href?: string|null, label: string}>}} props */
export function Breadcrumb({ trail }) {
  return html`<nav class="breadcrumb" aria-label="Breadcrumb">
    <ol>
      ${trail.map((crumb, i) => {
        const last = i === trail.length - 1;
        return html`<li>
          ${crumb.href && !last
            ? html`<a href="${crumb.href}">${crumb.label}</a>`
            : html`<span aria-current="page">${crumb.label}</span>`}
          ${last ? '' : html`<span class="breadcrumb__sep" aria-hidden="true">${Icon('chevron-right', { size: 14 })}</span>`}
        </li>`;
      })}
    </ol>
  </nav>`;
}
