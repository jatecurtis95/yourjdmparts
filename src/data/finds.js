/**
 * Recent finds — real jobs, told with real numbers.
 *
 * This is the structure the audit asked for: proof, not adjectives. One
 * entry is one part actually sourced for one customer, with the money broken
 * out and the photographs that were taken at the time.
 *
 * THE RULES, which the helpers below enforce rather than merely describe:
 *
 *   1. Nothing here is illustrative. Every value is a real figure from a
 *      real job or it is absent. There is no seed data, no "example" entry
 *      and no rounded-off placeholder, because a fabricated case study is
 *      worse than an empty section — it is the exact thing the audit said
 *      this business lacks, faked.
 *   2. A field that is not known is `null`, and the page omits it. Partial
 *      truth renders fine; invented completeness does not.
 *   3. `published` gates the public surface. An entry is only shown when it
 *      is marked published AND passes `isPublishable()`.
 *   4. Photographs must be real and must carry alt text that describes the
 *      part and its condition, because a customer reading it on a phone with
 *      images off is exactly the person the gallery is for.
 *   5. Money is integer cents, so arithmetic never drifts. `formatAud`
 *      prints it.
 *
 * Adding an entry: fill what you know, leave the rest null, set
 * `published: true`, drop the photographs in public/assets/finds/<slug>/ and
 * write real alt text for each. The homepage picks up published entries
 * automatically. There is nothing else to switch on.
 *
 * @typedef {{src: string, alt: string, caption?: string|null}} FindImage
 *
 * @typedef {object} Find
 * @property {string} slug                    URL segment.
 * @property {string} title                   Short human headline for the job.
 * @property {boolean} published              Public only when true.
 * @property {string|null} completed          ISO date the part was delivered.
 * @property {string|null} vehicle            e.g. '1997 Toyota Supra RZ'.
 * @property {string|null} chassisCode        e.g. 'JZA80'.
 * @property {string|null} problem            What the customer was actually stuck on.
 * @property {string|null} requestedPart      What they asked for.
 * @property {string|null} source             Where it was found, without naming a supplier we should not name.
 * @property {string|null} inspection         What the inspection actually turned up, faults included.
 * @property {'Excellent'|'Good'|'Fair'|'Spares or repair'|null} grade
 * @property {number|null} quoteDays          Business days from request to quote.
 * @property {number|null} partCents          Part cost.
 * @property {number|null} freightCents       Freight from Japan.
 * @property {number|null} dutyGstCents       Duty, GST and customs clearance.
 * @property {number|null} totalCents         Total landed. Checked against the parts above.
 * @property {string|null} deliveryTimeline   e.g. '5 weeks from accepted quote to the door'.
 * @property {string|null} outcome            What happened for the customer in the end.
 * @property {{quote: string, attribution: string}|null} testimonial
 * @property {FindImage[]} images
 */

/**
 * @type {Find[]}
 *
 * Empty on purpose. No real case study has been supplied yet, so there is
 * nothing true to show and the public section stays hidden. See
 * docs/OWNER-REVIEW.md for what one entry needs.
 */
export const FINDS = [];

/** The money fields, in the order they are shown in the cost breakdown. */
export const COST_FIELDS = [
  { key: 'partCents', label: 'Part' },
  { key: 'freightCents', label: 'Freight from Japan' },
  { key: 'dutyGstCents', label: 'Duty, GST and clearance' },
];

/**
 * A find is publishable when it identifies the car, says what the job was,
 * and lands on a real total. Everything else may be missing and the page
 * still reads honestly.
 *
 * The total is required because the whole point of this section is the
 * landed number. A case study without one is marketing.
 *
 * @param {Find} find
 */
export function isPublishable(find) {
  return Boolean(
    find &&
      find.published &&
      find.slug &&
      find.title &&
      (find.vehicle || find.chassisCode) &&
      find.requestedPart &&
      typeof find.totalCents === 'number',
  );
}

/** Published finds, newest first. */
export function publishedFinds() {
  return FINDS.filter(isPublishable).sort((a, b) =>
    String(b.completed ?? '').localeCompare(String(a.completed ?? '')),
  );
}

/** True when there is anything real to show. Gates the nav, homepage and route. */
export const hasPublishedFinds = () => publishedFinds().length > 0;

/** @param {string} slug */
export const getFind = (slug) => publishedFinds().find((find) => find.slug === slug) ?? null;

/**
 * Sum of the itemised costs, or null when any part of it is unknown.
 * Used to check the stated total rather than to replace it — if these
 * disagree the entry is wrong and should be fixed at the source.
 *
 * @param {Find} find
 */
export function itemisedTotal(find) {
  const parts = COST_FIELDS.map(({ key }) => find[key]);
  if (parts.some((value) => typeof value !== 'number')) return null;
  return parts.reduce((sum, value) => sum + value, 0);
}
