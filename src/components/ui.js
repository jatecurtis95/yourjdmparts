import { html, raw, attrs } from '../html.js';
import { Icon } from './icon.js';

/**
 * The primitive set. Read before building a screen; if a screen needs
 * something that is not here, add it here rather than defining it locally.
 *
 * Action registers — pick one per surface and hold it:
 *   marketing  -> 'sunrise' for the section's single action, 'outline' beside it
 *   retail     -> 'bone' primary, and Sunrise spent only on "Add to order"
 */

/* ── Button ─────────────────────────────────────────────────── */

/**
 * @param {{
 *   label: string,
 *   href?: string|null,
 *   variant?: 'sunrise'|'bone'|'outline'|'ghost',
 *   size?: 'md'|'lg',
 *   icon?: string|null,
 *   iconAfter?: boolean,
 *   type?: string,
 *   block?: boolean,
 *   disabled?: boolean,
 *   name?: string, value?: string,
 *   dataset?: Record<string,string>,
 *   ariaLabel?: string|null,
 * }} props
 */
export function Button({
  label,
  href = null,
  variant = 'outline',
  size = 'md',
  icon = null,
  iconAfter = false,
  type = 'button',
  block = false,
  disabled = false,
  name,
  value,
  dataset = {},
  ariaLabel = null,
}) {
  const cls = ['btn', `btn--${variant}`, size === 'lg' && 'btn--lg', block && 'btn--block']
    .filter(Boolean)
    .join(' ');

  const glyph = icon ? Icon(icon, { size: 18 }) : '';
  const inner = iconAfter ? html`${label}${glyph}` : html`${glyph}${label}`;
  const data = Object.fromEntries(Object.entries(dataset).map(([k, v]) => [`data-${k}`, v]));

  if (href && !disabled) {
    return html`<a class="${cls}" href="${href}"${attrs({ 'aria-label': ariaLabel, ...data })}
      >${inner}</a
    >`;
  }

  return html`<button
    class="${cls}"
    type="${type}"
    ${attrs({ disabled, name, value, 'aria-label': ariaLabel, ...data })}
  >
    ${inner}
  </button>`;
}

/** @param {{icon: string, label: string, href?: string|null, type?: string, dataset?: Record<string,string>}} props */
export function IconButton({ icon, label, href = null, type = 'button', dataset = {} }) {
  const data = Object.fromEntries(Object.entries(dataset).map(([k, v]) => [`data-${k}`, v]));
  const glyph = Icon(icon, { size: 18 });
  return href
    ? html`<a class="icon-btn" href="${href}" aria-label="${label}"${attrs(data)}>${glyph}</a>`
    : html`<button class="icon-btn" type="${type}" aria-label="${label}"${attrs(data)}>
        ${glyph}
      </button>`;
}

/* ── Badge ──────────────────────────────────────────────────────
   Scarcity is an orange OUTLINE. There is no filled scarcity badge. */

/** @param {{label: string, tone?: 'default'|'provenance'|'condition'|'scarcity', icon?: string|null}} props */
export function Badge({ label, tone = 'default', icon = null }) {
  return html`<span class="badge badge--${tone}"
    >${icon ? Icon(icon, { size: 16 }) : ''}${label}</span
  >`;
}

/** @param {{label: string, href?: string|null, active?: boolean, dismissHref?: string|null}} props */
export function Tag({ label, href = null, active = false, dismissHref = null }) {
  const cls = `tag${active ? ' tag--active' : ''}`;
  if (dismissHref) {
    return html`<span class="${cls}"
      >${label}<a class="tag__dismiss" href="${dismissHref}" aria-label="Remove filter ${label}"
        >${Icon('x', { size: 14 })}</a
      ></span
    >`;
  }
  return href ? html`<a class="${cls}" href="${href}">${label}</a>` : html`<span class="${cls}">${label}</span>`;
}

/** @param {{gold?: boolean}} [props] */
export function Rule({ gold = false } = {}) {
  return html`<hr class="rule${gold ? ' rule--gold' : ''}" />`;
}

/* ── Pattern layer ──────────────────────────────────────────────
   Permitted on hero, page headers, footers, section dividers and
   empty states only. Never behind listings, body copy, spec tables,
   product photos, checkout or forms.                                */
export function Pattern() {
  return html`<span class="pattern" aria-hidden="true"></span>`;
}

/* ── Form controls ──────────────────────────────────────────── */

let uid = 0;
const nextId = (prefix) => `${prefix}-${++uid}`;
/** Reset between renders so ids are deterministic in tests. */
export function resetIds() {
  uid = 0;
}

function fieldShell({ id, label, hint, error, required, children, wide }) {
  return html`<div class="field${wide ? ' field--wide' : ''}">
    <label class="field__label" for="${id}"
      >${label}${required ? '' : html` <span class="muted">(optional)</span>`}</label
    >
    ${hint ? html`<span class="field__hint" id="${id}-hint">${hint}</span>` : ''}
    ${children}
    ${error ? html`<span class="field__error" id="${id}-error">${error}</span>` : ''}
  </div>`;
}

/**
 * @param {{name: string, label: string, type?: string, value?: string, hint?: string|null,
 *   error?: string|null, required?: boolean, placeholder?: string|null, wide?: boolean,
 *   autocomplete?: string|null, inputmode?: string|null, maxlength?: number|null,
 *   pattern?: string|null, id?: string|null, multiline?: boolean, rows?: number}} props
 */
export function Input({
  name,
  label,
  type = 'text',
  value = '',
  hint = null,
  error = null,
  required = false,
  placeholder = null,
  wide = false,
  autocomplete = null,
  inputmode = null,
  maxlength = null,
  pattern = null,
  id = null,
  multiline = false,
  rows = 4,
}) {
  const fieldId = id ?? nextId(name);
  const describedBy = [hint && `${fieldId}-hint`, error && `${fieldId}-error`]
    .filter(Boolean)
    .join(' ');

  const shared = {
    id: fieldId,
    name,
    required,
    placeholder,
    autocomplete,
    inputmode,
    maxlength,
    pattern,
    'aria-invalid': error ? 'true' : null,
    'aria-describedby': describedBy || null,
  };

  const control = multiline
    ? html`<textarea class="textarea" rows="${rows}"${attrs(shared)}>${value}</textarea>`
    : html`<input class="input" type="${type}"${attrs({ ...shared, value: value || null })} />`;

  return fieldShell({ id: fieldId, label, hint, error, required, wide, children: control });
}

/**
 * @param {{name: string, label: string, options: Array<{value: string, label: string}>,
 *   value?: string, hint?: string|null, error?: string|null, required?: boolean,
 *   placeholder?: string|null, wide?: boolean, id?: string|null}} props
 */
export function Select({
  name,
  label,
  options,
  value = '',
  hint = null,
  error = null,
  required = false,
  placeholder = null,
  wide = false,
  id = null,
}) {
  const fieldId = id ?? nextId(name);
  const describedBy = [hint && `${fieldId}-hint`, error && `${fieldId}-error`]
    .filter(Boolean)
    .join(' ');

  const control = html`<span class="select-wrap">
    <select
      class="select"
      ${attrs({
        id: fieldId,
        name,
        required,
        'aria-invalid': error ? 'true' : null,
        'aria-describedby': describedBy || null,
      })}
    >
      ${placeholder ? html`<option value="">${placeholder}</option>` : ''}
      ${options.map(
        (o) =>
          html`<option value="${o.value}"${attrs({ selected: o.value === value })}>${o.label}</option>`,
      )}
    </select>
    <span class="select-wrap__chevron">${Icon('chevron-down', { size: 16 })}</span>
  </span>`;

  return fieldShell({ id: fieldId, label, hint, error, required, wide, children: control });
}

/** @param {{name: string, label: string, checked?: boolean, value?: string, id?: string|null}} props */
export function Checkbox({ name, label, checked = false, value = 'yes', id = null }) {
  const fieldId = id ?? nextId(name);
  return html`<label class="checkbox" for="${fieldId}">
    <input type="checkbox" id="${fieldId}" name="${name}" value="${value}"${attrs({ checked })} />
    <span class="checkbox__box" aria-hidden="true">${Icon('check', { size: 14 })}</span>
    <span class="checkbox__text">${label}</span>
  </label>`;
}

/** @param {{name: string, label: string, checked?: boolean, id?: string|null}} props */
export function Switch({ name, label, checked = false, id = null }) {
  const fieldId = id ?? nextId(name);
  return html`<label class="switch-field" for="${fieldId}">
    <span class="checkbox__text">${label}</span>
    <input class="switch" type="checkbox" role="switch" id="${fieldId}" name="${name}"${attrs({ checked })} />
  </label>`;
}

/* ── Card ───────────────────────────────────────────────────── */

/** @param {{children: unknown, variant?: 'surface'|'ground', flush?: boolean, tag?: string}} props */
export function Card({ children, variant = 'surface', flush = false, tag = 'div' }) {
  const cls = ['card', variant === 'ground' && 'card--ground', flush && 'card--flush']
    .filter(Boolean)
    .join(' ');
  return html`<${raw(tag)} class="${cls}">${children}</${raw(tag)}>`;
}

/** @param {{title: string, body: string, actions?: unknown}} props */
export function EmptyState({ title, body, actions = null }) {
  return html`<div class="empty patterned">
    ${Pattern()}
    <svg class="logo__mark" viewBox="0 0 100 100" fill="none" aria-hidden="true" focusable="false">
      <g class="logo__gate">
        <path d="M8 17 Q50 25 92 17 L92 24 Q50 32 8 24 Z" />
        <rect x="15" y="28" width="70" height="6" />
        <path d="M26 34 L34 34 L33 88 L24 88 Z" />
        <path d="M74 34 L66 34 L67 88 L76 88 Z" />
        <rect x="21" y="58" width="58" height="6" />
      </g>
    </svg>
    <h2 class="display-2">${title}</h2>
    <p class="lede">${body}</p>
    ${actions ? html`<div class="empty__actions">${actions}</div>` : ''}
  </div>`;
}
