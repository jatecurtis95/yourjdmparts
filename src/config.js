/** Site-wide configuration. Anything a human might want to change lives here. */

export const SITE = {
  name: 'Your JDM Parts',
  domain: 'yourjdmparts.com',
  origin: 'https://yourjdmparts.com',
  tagline: 'Genuine parts, inspected and landed',
  // The homepage title. A bare brand name tells a searcher nothing.
  tagTitle: 'JDM Parts Sourced from Japan, Landed in Australia | Your JDM Parts',
  description:
    'We source genuine and aftermarket Japanese domestic market car parts to order — found in Japan, inspected, and quoted in landed Australian dollars with duty and GST included.',
  // Contact details. The email is on the brand's own domain, which has live
  // Microsoft 365 mail routing; the address it replaced was on a domain that
  // no longer resolves, so mail sent to it bounced silently.
  email: 'info@yourjdmparts.com',
  phone: '0494 070 106',
  phoneIntl: '+61494070106',
  instagram: 'yourjdmparts',
  suburb: 'Maida Vale',
  city: 'Perth',
  state: 'Western Australia',
  // Built once, because assembling it at each call site produced
  // "Perth Western Australia" in the footer and on the contact page.
  get location() {
    return `${this.suburb}, ${this.city}, ${this.state}`;
  },
  // Sea freight route, taken from the existing site.
  route: { from: 'Yokohama', to: 'Fremantle' },
};

/**
 * Registered business identity.
 *
 * These are the only two facts on this site that must come from the business
 * register rather than from us, so both stay null until the owner supplies
 * them. Every surface that would print them checks `hasLegalIdentity()` and
 * shows an honest "registration details on request" line instead of a guess.
 *
 * Do not infer either value. A wrong ABN on a published page is a worse
 * failure than a missing one.
 */
export const LEGAL = {
  /** Registered entity name, e.g. the Pty Ltd or the registered business name. */
  entityName: null,
  /** Australian Business Number, 11 digits. */
  abn: null,
};

/** True once the registered identity can be printed in full. */
export function hasLegalIdentity() {
  return Boolean(LEGAL.entityName && LEGAL.abn);
}

/**
 * The person doing the work.
 *
 * Emi published these facts about herself on the business's previous site —
 * that she is the founder, that she grew up in Japan, and that the searching
 * is done in Japanese. They are carried over as hers. Her surname was never
 * published, so it is not printed here either.
 */
export const OPERATOR = {
  firstName: 'Emi',
  role: 'Founder',
};

/** Shown in the trade strip above the nav. */
export const TRADE = {
  dispatch: 'Sourced to order from Japan',
  pricing: 'Quotes in A$ landed, duty and GST paid',
  quoteDays: 4,
};

export const GST_RATE = 0.1;

/**
 * Hero media. Leave both null and the hero renders as the patterned
 * Midnight ground the design system specifies. Set them and the hero
 * becomes full-bleed behind a flat scrim, with the poster shown to anyone
 * who prefers reduced motion.
 *
 *   heroVideo:  '/assets/img/hero.mp4'
 *   heroPoster: '/assets/img/hero.jpg'
 */
export const HERO_MEDIA = {
  video: null,
  poster: null,
  alt: '',
};

export const NAV = [
  { href: '/what-we-source', label: 'What we source' },
  { href: '/brands', label: 'Brands' },
  { href: '/how-it-works', label: 'How it works' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

/** Chassis codes shown in the ticker. */
export const TICKER_CODES = [
  'JZA80',
  'BNR34',
  'FD3S',
  'S15',
  'EK9',
  'CT9A',
  'GDB',
  'JZX100',
  'AE86',
  'BCNR33',
  'DC2',
  'BNR32',
];
