/**
 * Tiny HTML templating layer.
 *
 * `html` escapes every interpolated value by default. To deliberately insert
 * markup, wrap it in `raw()` or pass an object with a `__html` property.
 * Arrays are joined with no separator so `${items.map(...)}` just works.
 */

const ESCAPES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

/** Escape a string for interpolation into HTML text or a quoted attribute. */
export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (c) => ESCAPES[c]);
}

/** Mark a string as already-safe markup. */
export function raw(markup) {
  return { __html: String(markup) };
}

function resolve(value) {
  if (value === null || value === undefined || value === false) return '';
  if (Array.isArray(value)) return value.map(resolve).join('');
  if (typeof value === 'object' && '__html' in value) return value.__html;
  return escapeHtml(value);
}

/** Tagged template that returns a raw-marked HTML string. */
export function html(strings, ...values) {
  let out = strings[0];
  for (let i = 0; i < values.length; i++) {
    out += resolve(values[i]) + strings[i + 1];
  }
  return raw(out);
}

/** Render a value produced by `html` (or a plain string) to a string. */
export function render(value) {
  return resolve(value);
}

/**
 * Build a class attribute from a list, dropping falsy entries.
 * `cx('card', isActive && 'is-active')` -> `class="card is-active"`
 */
export function cx(...names) {
  const list = names.filter(Boolean).join(' ').trim();
  return list ? raw(` class="${escapeHtml(list)}"`) : raw('');
}

/** Build an attribute list from an object, dropping null/undefined/false. */
export function attrs(map) {
  const out = [];
  for (const [key, value] of Object.entries(map)) {
    if (value === null || value === undefined || value === false) continue;
    if (value === true) {
      out.push(escapeHtml(key));
      continue;
    }
    out.push(`${escapeHtml(key)}="${escapeHtml(value)}"`);
  }
  return raw(out.length ? ' ' + out.join(' ') : '');
}
