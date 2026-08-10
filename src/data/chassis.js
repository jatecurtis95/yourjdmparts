/**
 * Chassis registry.
 *
 * Chassis-code pages are the SEO surface, so every code we stock has an
 * entry here with the prose that goes at the top of /{chassis}.
 */

export const CHASSIS = [
  {
    code: 'JZA80',
    make: 'Toyota',
    model: 'Supra',
    years: '1993–2002',
    engine: '2JZ-GE / 2JZ-GTE',
    blurb:
      'The A80 Supra ran for nearly a decade with very few running changes, so most JZA80 parts interchange across the range. The exceptions are the twin-turbo cars, which use a different intercooler, downpipe and rear differential to the naturally aspirated ones. We list the variant on every part.',
  },
  {
    code: 'BNR34',
    make: 'Nissan',
    model: 'Skyline GT-R',
    years: '1999–2002',
    engine: 'RB26DETT',
    blurb:
      'R34 GT-R parts are the hardest to find honestly graded. Reproduction body panels and interior trim are widespread, so we photograph the part number stamp on anything we sell as genuine and note where a part has been refinished.',
  },
  {
    code: 'BCNR33',
    make: 'Nissan',
    model: 'Skyline GT-R',
    years: '1995–1998',
    engine: 'RB26DETT',
    blurb:
      'The R33 GT-R shares a great deal with the R32 underneath but almost nothing on the outside. Brake, driveline and interior parts often cross over; panels and lighting do not.',
  },
  {
    code: 'BNR32',
    make: 'Nissan',
    model: 'Skyline GT-R',
    years: '1989–1994',
    engine: 'RB26DETT',
    blurb:
      'R32 GT-R cars are now old enough that original condition matters more than function. We grade cosmetic wear separately from mechanical condition so you can decide which one you are buying.',
  },
  {
    code: 'FD3S',
    make: 'Mazda',
    model: 'RX-7',
    years: '1991–2002',
    engine: '13B-REW',
    blurb:
      'The FD ran through six series and the sequential turbo plumbing changed more than once. Series numbers matter on anything in the engine bay, so we list the series a part came off rather than a year range.',
  },
  {
    code: 'S15',
    make: 'Nissan',
    model: 'Silvia',
    years: '1999–2002',
    engine: 'SR20DE / SR20DET',
    blurb:
      'S15 Spec-R and Spec-S cars differ in gearbox, differential, brakes and seats. We list the grade a part was removed from because the two are not interchangeable in several places.',
  },
  {
    code: 'EK9',
    make: 'Honda',
    model: 'Civic Type R',
    years: '1997–2000',
    engine: 'B16B',
    blurb:
      'EK9-specific parts are a small subset of a very large EK platform. Anything we list as EK9 is a part that differs from the standard EK, and we say what the difference is.',
  },
  {
    code: 'DC2',
    make: 'Honda',
    model: 'Integra Type R',
    years: '1995–2001',
    engine: 'B18C',
    blurb:
      'DC2 Type R parts split across the pre-facelift and facelift cars, most visibly in the lighting and the front bar. We list which one a part fits.',
  },
  {
    code: 'CT9A',
    make: 'Mitsubishi',
    model: 'Lancer Evolution VII–IX',
    years: '2001–2007',
    engine: '4G63T',
    blurb:
      'CT9A covers Evolution VII, VIII and IX. Many parts carry across all three, but the MIVEC engine in the IX and the six-speed gearbox in later cars are the common exceptions.',
  },
  {
    code: 'GDB',
    make: 'Subaru',
    model: 'Impreza WRX STI',
    years: '2000–2007',
    engine: 'EJ207',
    blurb:
      'GDB runs from the round-light cars through to the hawkeye, and the front-end parts changed twice in that time. We list the face a panel or light came from.',
  },
  {
    code: 'JZX100',
    make: 'Toyota',
    model: 'Chaser',
    years: '1996–2001',
    engine: '1JZ-GTE',
    blurb:
      'JZX100 parts cross over with the Mark II and Cresta of the same generation more often than people expect. Where a part is shared we say so, because it widens what will fit your car.',
  },
  {
    code: 'AE86',
    make: 'Toyota',
    model: 'Corolla Levin / Sprinter Trueno',
    years: '1983–1987',
    engine: '4A-GE',
    blurb:
      'Genuine AE86 parts are largely gone from Japan and what is left is expensive. We are honest about wear on these because there is no unworn stock left to compare against.',
  },
];

const BY_CODE = new Map(CHASSIS.map((c) => [c.code, c]));

/** @param {string} code */
export function getChassis(code) {
  return BY_CODE.get(String(code).toUpperCase()) ?? null;
}

/** Every chassis code we hold, uppercase. */
export const chassisCodes = CHASSIS.map((c) => c.code);
