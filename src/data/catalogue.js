/**
 * What we source.
 *
 * This is a catalogue of part *types* we go and find, not stock we hold.
 * There are deliberately no prices, no stock counts and no SKUs here —
 * we are a sourcing service, and inventing either would be dishonest.
 *
 * Every entry exists to help someone name the thing they need and get to a
 * request with it pre-filled.
 */

export const CATEGORIES = [
  {
    slug: 'engine',
    label: 'Engine',
    blurb:
      'Long and short blocks, turbochargers, manifolds, fuel and cooling. Engine parts are the most variant-sensitive things on these cars, so we work from the chassis number rather than the model year.',
  },
  {
    slug: 'drivetrain',
    label: 'Drivetrain',
    blurb:
      'Gearboxes, differentials, clutches, driveshafts and transfer cases. Grade matters more than model here — a Spec-R and a Spec-S share almost nothing in this category.',
  },
  {
    slug: 'suspension',
    label: 'Suspension',
    blurb:
      'Coilovers, dampers, springs, arms, bushes and bracing. Both factory and aftermarket, and we will tell you honestly when a used coilover is not worth the freight.',
  },
  {
    slug: 'brakes',
    label: 'Brakes',
    blurb:
      'Callipers, rotors, master cylinders, lines and pads. Factory big-brake setups from the higher grades are among the most requested things we look for.',
  },
  {
    slug: 'body-exterior',
    label: 'Body and exterior',
    blurb:
      'Panels, bumpers, wings, glass and trim. Freight is a real part of the landed price on anything panel-sized, and we quote it up front rather than after you commit.',
  },
  {
    slug: 'interior',
    label: 'Interior',
    blurb:
      'Seats, rails, trim, instrument clusters, steering wheels and switchgear. Interior parts are where originality is hardest to find and easiest to misrepresent.',
  },
  {
    slug: 'lighting',
    label: 'Lighting',
    blurb:
      'Headlights, tail lights, indicators and fog lights. Lenses craze with age, so we photograph them in daylight rather than under workshop lighting.',
  },
  {
    slug: 'wheels',
    label: 'Wheels',
    blurb:
      'Factory and aftermarket wheels, and the odd offsets that suit these chassis. Counterfeits are common in the desirable sizes, so we check forging stamps and weights.',
  },
];

/**
 * Part types, grouped by category. `common` marks the things asked for most
 * often, which is what the chassis pages surface first.
 */
export const PART_TYPES = [
  // Engine
  { slug: 'turbochargers', name: 'Turbochargers', category: 'engine', common: true, note: 'Factory and aftermarket, rebuildable cores included where the shaft play is honest.' },
  { slug: 'intercoolers', name: 'Intercoolers and piping', category: 'engine', note: 'Front-mount and side-mount, factory and aftermarket.' },
  { slug: 'inlet-manifolds', name: 'Inlet manifolds and throttle bodies', category: 'engine', common: true, note: 'Port shape changes between engine variants more often than people expect.' },
  { slug: 'engine-assemblies', name: 'Engine assemblies and short blocks', category: 'engine', common: true, note: 'Compression tested before purchase where the seller allows it.' },
  { slug: 'ignition', name: 'Coil packs, igniters and looms', category: 'engine', note: 'The loom connectors fail before the coils do on most of these cars.' },
  { slug: 'fuel-system', name: 'Fuel pumps, injectors and rails', category: 'engine', note: 'Injector sizes vary by grade even within one chassis code.' },
  { slug: 'cooling', name: 'Radiators, oil coolers and fans', category: 'engine', note: 'Original plastic end tanks are usually the failure point on a used radiator.' },
  { slug: 'engine-management', name: 'ECUs and engine management', category: 'engine', note: 'Chassis-and-engine specific. We check the part number before quoting.' },

  // Drivetrain
  { slug: 'gearboxes', name: 'Gearboxes', category: 'drivetrain', common: true, note: 'Bench-checked through every gear before purchase where possible.' },
  { slug: 'differentials', name: 'Differentials and LSDs', category: 'drivetrain', common: true, note: 'Ratio and backlash recorded before we buy.' },
  { slug: 'clutches', name: 'Clutches and flywheels', category: 'drivetrain', note: 'Single, twin and triple plate, factory and aftermarket.' },
  { slug: 'driveshafts', name: 'Driveshafts and axles', category: 'drivetrain', note: 'Boots and joint play checked; lengths differ between grades.' },
  { slug: 'transfer-cases', name: 'Transfer cases', category: 'drivetrain', note: 'For the all-wheel-drive chassis, where these are increasingly hard to find.' },

  // Suspension
  { slug: 'coilovers', name: 'Coilovers and dampers', category: 'suspension', common: true, note: 'We will tell you when a used set needs a rebuild that costs more than the part.' },
  { slug: 'control-arms', name: 'Control arms and knuckles', category: 'suspension', common: true, note: 'Checked straight, with ball-joint play recorded.' },
  { slug: 'sway-bars', name: 'Sway bars and links', category: 'suspension', note: 'Factory and aftermarket, in the thicknesses that suit each chassis.' },
  { slug: 'bracing', name: 'Strut braces and bracing', category: 'suspension', note: 'Including the factory bracing fitted only to higher grades.' },
  { slug: 'subframes', name: 'Subframes and crossmembers', category: 'suspension', note: 'Rust is the thing to check, and we photograph the seams.' },

  // Brakes
  { slug: 'callipers', name: 'Callipers', category: 'brakes', common: true, note: 'Factory big-brake setups from the higher grades, and aftermarket kits.' },
  { slug: 'rotors', name: 'Rotors and hats', category: 'brakes', note: 'Thickness measured against the factory minimum before we buy.' },
  { slug: 'master-cylinders', name: 'Master cylinders and boosters', category: 'brakes', note: 'Bore sizes differ by grade and affect pedal feel.' },
  { slug: 'brake-lines', name: 'Lines, ABS units and sensors', category: 'brakes', note: 'ABS units are often the part holding up a build.' },

  // Body and exterior
  { slug: 'panels', name: 'Guards, bonnets and doors', category: 'body-exterior', common: true, note: 'Photographed in daylight, with any filler or repair called out.' },
  { slug: 'bumpers', name: 'Bumpers and aero', category: 'body-exterior', common: true, note: 'Mounting tabs are the thing that breaks; we check every one.' },
  { slug: 'wings', name: 'Wings and spoilers', category: 'body-exterior', note: 'Including the factory wings that only came on certain grades.' },
  { slug: 'glass', name: 'Glass and weather seals', category: 'body-exterior', note: 'Freight on glass is high and breakage risk is real. We will say when it is not worth it.' },
  { slug: 'exterior-trim', name: 'Exterior trim and badges', category: 'body-exterior', note: 'Grade badges, mouldings and the small parts that finish a car.' },

  // Interior
  { slug: 'seats', name: 'Seats and rails', category: 'interior', common: true, note: 'The rail is as chassis-specific as the seat. We quote both together.' },
  { slug: 'clusters', name: 'Instrument clusters', category: 'interior', common: true, note: 'Odometer reading is the donor reading and is never reset.' },
  { slug: 'steering-wheels', name: 'Steering wheels and bosses', category: 'interior', note: 'Airbag wheels and aftermarket, with the correct boss for the chassis.' },
  { slug: 'interior-trim', name: 'Dash, door cards and trim', category: 'interior', note: 'Sun damage and cracking are described plainly rather than photographed around.' },
  { slug: 'switchgear', name: 'Switchgear and climate controls', category: 'interior', note: 'Tested working before purchase where there is power to test with.' },

  // Lighting
  { slug: 'headlights', name: 'Headlights', category: 'lighting', common: true, note: 'Lens condition, internal moisture and every mounting tab checked.' },
  { slug: 'tail-lights', name: 'Tail lights', category: 'lighting', common: true, note: 'Crazing is age, not damage, and we say which one it is.' },
  { slug: 'indicators', name: 'Indicators and repeaters', category: 'lighting', note: 'Including the market-specific lenses that differ from Australian delivery cars.' },
  { slug: 'lighting-hardware', name: 'Ballasts, brackets and looms', category: 'lighting', note: 'The parts that go missing when a car is stripped by someone else.' },

  // Wheels
  { slug: 'factory-wheels', name: 'Factory wheels', category: 'wheels', common: true, note: 'The correct original wheel for the grade, in the correct offset.' },
  { slug: 'aftermarket-wheels', name: 'Aftermarket wheels', category: 'wheels', common: true, note: 'Forging stamps, date codes and weights checked against the genuine article.' },
  { slug: 'wheel-hardware', name: 'Nuts, spacers and centre caps', category: 'wheels', note: 'The small parts that are missing from most second-hand sets.' },
];

const BY_SLUG = new Map(PART_TYPES.map((p) => [p.slug, p]));

/** @param {string} slug */
export const getPartType = (slug) => BY_SLUG.get(slug) ?? null;

/** @param {string} category */
export const partTypesIn = (category) => PART_TYPES.filter((p) => p.category === category);

/** The things asked for most often, used on the chassis pages. */
export const commonPartTypes = () => PART_TYPES.filter((p) => p.common);

export const categoryLabel = (slug) => CATEGORIES.find((c) => c.slug === slug)?.label ?? slug;

export const getCategory = (slug) => CATEGORIES.find((c) => c.slug === slug) ?? null;
