/**
 * Brands we source from.
 *
 * We are a sourcing service, not a distributor. These are marques we find
 * parts for — at auction, through dismantlers, and from retailers in Japan.
 * Nothing here claims a dealership or an authorised-reseller relationship,
 * and the copy must not start doing so.
 *
 * `logo` is a path under /assets/brands/. Where it is null the BrandCard
 * falls back to the name typeset in the site's own condensed face, which is
 * deliberate: a name set in our type is honest, whereas an approximated
 * logo would not be. Drop a real file in and set the path to upgrade it.
 *
 * `makes` limits a brand to the marques it actually serves, taken from the
 * brand's own blurb. A chassis page must never offer Nismo for a Toyota —
 * that is exactly the mistake an enthusiast catches in a second — so
 * brandsFor() filters on it and a test holds the two in agreement. No
 * `makes` means the brand fits any of these cars.
 */

export const BRAND_CATEGORIES = [
  { slug: 'suspension', label: 'Suspension' },
  { slug: 'engine', label: 'Engine and tuning' },
  { slug: 'drivetrain', label: 'Drivetrain' },
  { slug: 'brakes', label: 'Brakes' },
  { slug: 'exhaust', label: 'Exhaust' },
  { slug: 'wheels', label: 'Wheels' },
  { slug: 'interior', label: 'Seats and interior' },
  { slug: 'electronics', label: 'Gauges and electronics' },
  { slug: 'body', label: 'Body and aero' },
  { slug: 'factory', label: 'Factory performance' },
];

export const BRANDS = [
  {
    slug: 'tein',
    name: 'Tein',
    category: 'suspension',
    logo: '/assets/brands/tein.svg',
    blurb:
      'Coilovers and dampers, from the street Street Advance range through to Mono Sport. Tein part numbers are chassis-specific, so we match them against your build month rather than the model year.',
  },
  {
    slug: 'cusco',
    name: 'Cusco',
    category: 'suspension',
    logo: null,
    blurb:
      'Suspension arms, sway bars, strut braces, roll cages and limited-slip differentials. Their catalogue runs deep on older chassis that most suppliers have dropped.',
  },
  {
    slug: 'hks',
    name: 'HKS',
    category: 'engine',
    logo: '/assets/brands/hks.svg',
    blurb:
      'Turbochargers, cams, intercoolers, exhausts and the Hipermax suspension line. One of the few tuners still producing for cars this old, though many parts are now discontinued and only available used.',
  },
  {
    slug: 'apexi',
    name: "A'PEXi",
    category: 'engine',
    logo: null,
    blurb:
      'Intakes, exhausts, intercoolers and the Power FC engine management that a great many JDM cars still run. Power FC units are chassis-and-engine specific and we check the part number before quoting.',
  },
  {
    slug: 'blitz',
    name: 'Blitz',
    category: 'engine',
    logo: null,
    blurb:
      'Intercoolers, blow-off valves, intakes and boost controllers. Their older Nur-Spec and SUS exhausts turn up regularly through dismantlers.',
  },
  {
    slug: 'greddy',
    name: 'GReddy (Trust)',
    category: 'engine',
    logo: null,
    blurb:
      'Turbo kits, intercoolers, oil coolers and manifolds, sold as Trust in Japan and GReddy elsewhere. The two names are the same company, which matters when you are reading a Japanese listing.',
  },
  {
    slug: 'tomei',
    name: 'Tomei',
    category: 'engine',
    logo: null,
    makes: ['Nissan', 'Mitsubishi'],
    blurb:
      'Camshafts, valvetrain, turbochargers, exhaust manifolds and forged internals, with particularly deep coverage of RB, SR and 4G63 engines.',
  },
  {
    slug: 'mines',
    name: "Mine's",
    category: 'engine',
    logo: null,
    makes: ['Nissan'],
    blurb:
      'A small Yokohama tuner best known for its ECUs, exhausts and intercoolers for the RB26 GT-Rs. Low production numbers, so most of what we find is used.',
  },
  {
    slug: 'spoon-sports',
    name: 'Spoon Sports',
    category: 'engine',
    logo: '/assets/brands/spoon-sports.svg',
    makes: ['Honda'],
    blurb:
      'Honda specialists — engine work, brakes, rigid collars and body reinforcement, mostly for B-series and K-series cars.',
  },
  {
    slug: 'top-secret',
    name: 'Top Secret',
    category: 'engine',
    logo: null,
    makes: ['Toyota', 'Nissan'],
    blurb:
      "Smoky Nagata's shop. Aero, exhausts and engine work, largely for Supras, GT-Rs and Z-cars. Body parts in particular are made in small batches.",
  },
  {
    slug: 'nismo',
    name: 'Nismo',
    category: 'factory',
    logo: null,
    makes: ['Nissan'],
    blurb:
      "Nissan's factory motorsport arm. Suspension, differentials, engine parts and the Heritage line, which has put some long-discontinued Skyline parts back into production.",
  },
  {
    slug: 'trd',
    name: 'TRD',
    category: 'factory',
    logo: null,
    makes: ['Toyota'],
    blurb:
      "Toyota Racing Development. Suspension, brakes, limited-slip differentials and body parts, with the Japanese TRD catalogue differing substantially from the export one.",
  },
  {
    slug: 'mugen',
    name: 'Mugen',
    category: 'factory',
    logo: '/assets/brands/mugen.svg',
    makes: ['Honda'],
    blurb:
      'Honda-adjacent, though independently owned. Wheels, aero, exhausts and engine parts. Genuine Mugen is widely counterfeited, so we photograph casting marks and part numbers.',
  },
  {
    slug: 'sti',
    name: 'STI',
    category: 'factory',
    logo: null,
    makes: ['Subaru'],
    blurb:
      'Subaru Tecnica International. Suspension, differentials, flexible tower bars and Group N parts. The Japanese STI parts catalogue is far broader than what reached Australia.',
  },
  {
    slug: 'ralliart',
    name: 'Ralliart',
    category: 'factory',
    logo: null,
    makes: ['Mitsubishi'],
    blurb:
      "Mitsubishi's motorsport arm. Suspension, exhausts and engine parts for the Evolution range, much of it discontinued since the division was wound back.",
  },
  {
    slug: 'os-giken',
    name: 'OS Giken',
    category: 'drivetrain',
    logo: null,
    blurb:
      'Twin and triple-plate clutches, limited-slip differentials and sequential gearsets. Built to order in small numbers, so lead times on new stock are long.',
  },
  {
    slug: 'exedy',
    name: 'Exedy',
    category: 'drivetrain',
    logo: null,
    blurb:
      'Clutches, from OEM replacement through to multi-plate racing units. Supplies many of the factory clutches in these cars, so an Exedy part is often the correct original.',
  },
  {
    slug: 'endless',
    name: 'Endless',
    category: 'brakes',
    logo: null,
    blurb:
      'Big brake kits, callipers, pads and fluid. Their pad compounds are specified by application, so we need to know how the car is used before quoting.',
  },
  {
    slug: 'project-mu',
    name: 'Project Mu',
    category: 'brakes',
    logo: null,
    blurb:
      'Brake pads, rotors and callipers. Broad compound range and good coverage of older chassis that other brake suppliers have dropped.',
  },
  {
    slug: 'fujitsubo',
    name: 'Fujitsubo',
    category: 'exhaust',
    logo: null,
    blurb:
      'Exhaust systems, including street-legal Japanese-certified lines. Their older Legalis and Power Getter systems come up often through dismantlers.',
  },
  {
    slug: 'kakimoto',
    name: 'Kakimoto Racing',
    category: 'exhaust',
    logo: null,
    blurb:
      'Exhausts, best known for the Regu.06 and Hyper Full Mega lines. Widely fitted in Japan, so used systems are relatively findable.',
  },
  {
    slug: 'rays',
    name: 'Rays (Volk Racing)',
    category: 'wheels',
    logo: '/assets/brands/rays.svg',
    blurb:
      'Forged wheels, including the Volk Racing TE37 and CE28. Heavily counterfeited, so we check forging stamps, date codes and weight before we buy.',
  },
  {
    slug: 'work',
    name: 'Work Wheels',
    category: 'wheels',
    logo: null,
    blurb:
      'Multi-piece and forged wheels, much of it made to order in Japan. Second-hand sets often carry unusual offsets that suit these chassis well.',
  },
  {
    slug: 'enkei',
    name: 'Enkei',
    category: 'wheels',
    logo: null,
    blurb:
      'Cast and forged wheels, and the original equipment supplier on a number of these cars — so an Enkei is often the correct factory wheel rather than an upgrade.',
  },
  {
    slug: 'ssr',
    name: 'SSR',
    category: 'wheels',
    logo: null,
    blurb:
      'Mesh and multi-piece wheels, including the Professor and Longchamp lines. A lot of the desirable stock is period second-hand rather than current production.',
  },
  {
    slug: 'bride',
    name: 'Bride',
    category: 'interior',
    logo: '/assets/brands/bride.svg',
    blurb:
      'Fixed-back and reclining bucket seats, plus chassis-specific seat rails. The rail is as chassis-specific as the seat, and we quote both together.',
  },
  {
    slug: 'momo',
    name: 'MOMO',
    category: 'interior',
    logo: '/assets/brands/momo.svg',
    blurb:
      'Steering wheels, gear knobs and hubs. Italian rather than Japanese, but fitted to so many JDM cars from the factory and by their first owners that it is part of the landscape.',
  },
  {
    slug: 'recaro',
    name: 'Recaro',
    category: 'interior',
    logo: null,
    blurb:
      'German-made, though the Japanese market versions and the factory-fitted Type R and STI seats differ from the European catalogue. Rails are market-specific.',
  },
  {
    slug: 'defi',
    name: 'Defi',
    category: 'electronics',
    logo: null,
    blurb:
      'Gauges and control units. Older Defi-Link gauges need the matching control unit to work at all, so we check the pair before quoting.',
  },
  {
    slug: 'c-west',
    name: 'C-West',
    category: 'body',
    logo: null,
    makes: ['Nissan', 'Honda'],
    blurb:
      'Aero and body parts in PFRP, mostly for Nissan and Honda chassis. Panels are bulky and freight is a real part of the landed price, which we quote up front.',
  },
];

/** Genuine factory parts, quoted through the same process. */
export const OEM_MAKES = [
  'Toyota',
  'Nissan',
  'Honda',
  'Mazda',
  'Mitsubishi',
  'Subaru',
  'Suzuki',
  'Daihatsu',
];

const BY_SLUG = new Map(BRANDS.map((b) => [b.slug, b]));

/** @param {string} slug */
export const getBrand = (slug) => BY_SLUG.get(slug) ?? null;

/** @param {string} category */
export const brandsInCategory = (category) => BRANDS.filter((b) => b.category === category);

export const brandCategoryLabel = (slug) =>
  BRAND_CATEGORIES.find((c) => c.slug === slug)?.label ?? slug;

/** Brands shown in the home-page strip, in this order. */
export const FEATURED_BRAND_SLUGS = [
  'tein',
  'hks',
  'rays',
  'bride',
  'mugen',
  'spoon-sports',
  'nismo',
  'cusco',
  'trd',
  'endless',
  'tomei',
];

/** @param {object} brand @param {string} make */
export const brandServesMake = (brand, make) => !brand.makes || brand.makes.includes(make);

/**
 * The brands a chassis page may show, most relevant first: every brand
 * specific to the car's make, then the featured universal brands. The one
 * thing this exists to prevent is a marque brand on the wrong marque's
 * page — Nismo offered for a Supra reads as not knowing the cars.
 *
 * @param {string} make @param {number} [limit]
 */
export function brandsFor(make, limit = 8) {
  const specific = BRANDS.filter((b) => b.makes && b.makes.includes(make));
  const universal = FEATURED_BRAND_SLUGS.map(getBrand).filter(
    (b) => b && !b.makes,
  );
  return [...specific, ...universal].slice(0, limit);
}
