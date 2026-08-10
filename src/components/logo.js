import { html, raw } from '../html.js';

/**
 * Logo — the torii mark, in four lockups, each with a mono build.
 *
 * The mark is pure geometry so it renders identically as inline SVG, as a
 * favicon and inside an OG image. The wordmark is real HTML type rather than
 * SVG paths, so it picks up --font-condensed and stays selectable and
 * translatable.
 *
 * Rules that travel with this component:
 *   - Never redraw, recolour, rotate, stretch or pattern the torii.
 *   - Minimum mark width 40px.
 *   - Clear space equals one post-width on all sides (--logo-clear).
 *   - The sun disc is the only Sunrise element. In a mono build it drops out
 *     entirely rather than being tinted.
 */

/* Myojin-style torii, drawn in a 100x100 box.
   Kasagi (top lintel) has upturned ends; posts lean inward toward the top. */
const TORII_GEOMETRY = `
  <path d="M8 17 Q50 25 92 17 L92 24 Q50 32 8 24 Z"/>
  <rect x="15" y="28" width="70" height="6"/>
  <path d="M26 34 L34 34 L33 88 L24 88 Z"/>
  <path d="M74 34 L66 34 L67 88 L76 88 Z"/>
  <rect x="21" y="58" width="58" height="6"/>
`;

const SUN = `<circle cx="50" cy="46" r="10"/>`;

/**
 * The bare mark as inline SVG.
 * @param {{size?: number, mono?: boolean, title?: string|null}} [options]
 */
export function ToriiMark({ size = 48, mono = false, title = null } = {}) {
  const px = Math.max(40, size); // minimum mark width 40px
  const label = title
    ? `<title>${title}</title>`
    : '';
  const sun = mono ? '' : `<g class="logo__sun">${SUN}</g>`;
  return html`<svg
    class="logo__mark${mono ? ' logo__mark--mono' : ''}"
    width="${px}"
    height="${px}"
    viewBox="0 0 100 100"
    fill="none"
    role="${title ? 'img' : 'presentation'}"
    ${raw(title ? '' : 'aria-hidden="true"')}
    focusable="false"
  >${raw(label)}${raw(sun)}<g class="logo__gate">${raw(TORII_GEOMETRY)}</g></svg>`;
}

/**
 * @param {{
 *   lockup?: 'horizontal'|'vertical'|'mark'|'tile',
 *   mono?: boolean,
 *   size?: number,
 *   href?: string|null,
 *   tagline?: boolean,
 * }} [options]
 */
export function Logo({
  lockup = 'horizontal',
  mono = false,
  size = 48,
  href = '/',
  tagline = false,
} = {}) {
  const accessibleName = 'Your JDM Parts';

  if (lockup === 'mark') {
    const mark = ToriiMark({ size, mono, title: accessibleName });
    return href
      ? html`<a class="logo logo--mark" href="${href}" aria-label="${accessibleName}">${mark}</a>`
      : html`<span class="logo logo--mark">${mark}</span>`;
  }

  // The spans are flex items so --logo-word gap sets the spacing; they
  // carry no classes of their own because none is needed.
  const wordmark = html`<span class="logo__word" aria-hidden="true"
    ><span>Your</span><span>JDM</span><span>Parts</span></span
  >`;

  const taglineEl = tagline
    ? html`<span class="logo__tagline" aria-hidden="true">Genuine parts, inspected and landed</span>`
    : '';

  const inner = html`${ToriiMark({ size, mono })}<span class="logo__type"
      >${wordmark}${taglineEl}</span
    >`;

  const cls = `logo logo--${lockup}${mono ? ' logo--mono' : ''}`;

  return href
    ? html`<a class="${cls}" href="${href}" aria-label="${accessibleName}">${inner}</a>`
    : html`<span class="${cls}" role="img" aria-label="${accessibleName}">${inner}</span>`;
}

/** Standalone SVG file body, used for favicon and social images. */
export function toriiSvgFile({ mono = false } = {}) {
  const sun = mono ? '' : `<circle cx="50" cy="46" r="10" fill="#F55A14"/>`;
  const gateFill = mono ? '#FBF3E7' : '#FBF3E7';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
  <title>Your JDM Parts</title>
  <rect width="100" height="100" fill="#0B1624"/>
  ${sun}
  <g fill="${gateFill}">${TORII_GEOMETRY.trim()}</g>
</svg>
`;
}
