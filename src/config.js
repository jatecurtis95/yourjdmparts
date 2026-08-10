/** Site-wide configuration. Anything a human might want to change lives here. */

export const SITE = {
  name: 'Your JDM Parts',
  domain: 'yourjdmparts.com',
  origin: 'https://yourjdmparts.com',
  tagline: 'Genuine parts, inspected and landed',
  description:
    'We source genuine and aftermarket Japanese domestic market car parts to order — found in Japan, inspected, and quoted in landed Australian dollars with duty and GST included.',
  // Real details, taken from the live site. Note the email and the social
  // handle are on the JDM Bridge name — if the rebrand to Your JDM Parts
  // goes ahead, these are the things that need changing with it.
  email: 'info@jdmbridge.com.au',
  phone: '0494 070 106',
  phoneIntl: '+61494070106',
  instagram: 'jdmbridge_au',
  abn: '',
  suburb: 'Maida Vale',
  city: 'Perth',
  state: 'Western Australia',
  // Sea freight route, taken from the existing site.
  route: { from: 'Yokohama', to: 'Fremantle' },
  sisterCompany: { name: 'JDM Connect', blurb: 'imports whole vehicles' },
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
