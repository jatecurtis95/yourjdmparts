import { OPERATOR } from '../config.js';

/**
 * The Column — long-form entries, migrated from the previous site.
 *
 * Migration rules applied here:
 *
 *   - The words are Emi's. Substance, argument and structure are preserved
 *     exactly; the only edits are to the business name and to links pointing
 *     at services this site does not offer.
 *   - `published` carries the original publication date, not the migration
 *     date, so the post does not present as new writing.
 *   - `legacyPath` is the URL the entry lived at before, so the router can
 *     redirect it rather than stranding a link or splitting its ranking.
 *
 * NOT MIGRATED — "Inside Japan's car auctions" (/blog/inside-japans-car-auctions).
 * That entry is a guide to bidding at dealer-only vehicle auctions and ends by
 * selling the vehicle import service. This site is parts only, so publishing it
 * would advertise something we do not do. Its URL is redirected to this index
 * instead. If vehicle importing ever comes back, the entry is worth restoring
 * — it is good writing. See docs/OWNER-REVIEW.md.
 *
 * @typedef {{title: string, slug: string, published: string, author: string,
 *   standfirst: string, description: string, legacyPath: string|null,
 *   body: Array<{heading?: string, paragraphs?: string[], list?: Array<{term: string, detail: string}>}>}} Entry
 */

/** @type {Entry[]} */
export const ENTRIES = [
  {
    title: 'How I search all of Japan for one part',
    slug: 'searching-all-of-japan',
    published: '2026-07-22',
    author: OPERATOR.firstName,
    legacyPath: '/blog/searching-all-of-japan',
    standfirst:
      'Export websites show a sliver of what Japan is really selling. Here is where the searching actually happens.',
    description:
      'Export websites show a sliver of what Japan is really selling. Our founder grew up in Japan and explains where she actually hunts — dealer counters, domestic auctions, dismantlers and specialist shops across Japan.',
    body: [
      {
        paragraphs: [
          'People sometimes ask me why they should order through us instead of just buying from an export website. It is a fair question. Here is my honest answer: those websites show you a sliver of what Japan is actually selling. I can search all of it.',
        ],
      },
      {
        heading: 'The export-site illusion',
        paragraphs: [
          'The English-language export sites are real businesses and they do a fine job for common parts. But they only list what someone has bothered to photograph, translate and mark up for overseas buyers. The listing you see has already been filtered — by language, by margin, and by what a middleman guessed foreigners might want.',
          'Japan’s domestic market is enormous, and almost all of it happens in Japanese. The rare lip spoiler, the discontinued interior trim, the one clean example of a part that has not been made in twenty-five years — these things surface every day inside Japan. They just never make it to the English internet.',
        ],
      },
      {
        heading: 'Where I actually look',
        paragraphs: [
          'When you send me a part number or a chassis code, the hunt does not start on a website built for exports. It starts where Japanese enthusiasts and mechanics buy their own parts.',
        ],
        list: [
          {
            term: 'Dealer parts counters',
            detail:
              'Plenty of “discontinued” parts can still be back-ordered new from the manufacturer — but only through a Japanese dealer, in Japanese, sometimes only if you know how to ask.',
          },
          {
            term: 'Domestic auction and marketplace listings',
            detail:
              'Japan’s online auctions turn over an unbelievable volume of parts daily. Listings are written in Japanese shorthand full of model codes and slang — if you cannot read them, you cannot find them, let alone judge them.',
          },
          {
            term: 'Second-hand parts chains',
            detail:
              'Japan has entire national store networks dedicated to used performance parts. Stock changes daily, store by store, and most of it is never listed in English anywhere.',
          },
          {
            term: 'Dismantlers and parts yards',
            detail:
              'When a car is de-registered in Japan, its parts scatter into yards across the country. Calling a yard in rural Japan and asking the right question in the right dialect of politeness — that is not something a search engine can do.',
          },
          {
            term: 'Small specialist shops',
            detail:
              'Every corner of Japan has little shops that live and breathe one make or one era. Some barely have a website. They answer the phone, though — in Japanese.',
          },
        ],
      },
      {
        heading: 'The language is the bridge',
        paragraphs: [
          'I grew up in Japan. I do not just read the listings — I read between their lines. I can tell when a seller’s wording is hiding a repair, when a price is a bargain because the seller mislabelled the part, and when something smells wrong. I can ring a supplier, build a relationship, and get a straight answer in a culture where straight answers are given carefully.',
          'That is the part of this job that cannot be automated or translated. It is not a search bar. It is knowing where to stand in the market so the right things walk past you.',
        ],
      },
      {
        heading: 'What that means for you',
        paragraphs: [
          'It means the answer to “can you find it?” is usually yes — it is a question of condition, budget and patience, and I will be honest with you about all three. If a part is genuinely unobtainable, I will tell you that too, and I will not sell you a knock-off dressed up as the real thing.',
          'So send me the part number. Send me the blurry photo of the broken bracket. Send me the forum post from 2009 that says the part exists. That is where the fun starts.',
        ],
      },
    ],
  },
];

/**
 * Old URLs that must not 404, mapped to where they go now.
 *
 * The auctions entry has no new home, so it lands on the index rather than
 * on a page that would advertise vehicle importing.
 */
export const LEGACY_COLUMN_PATHS = new Map([
  ...ENTRIES.filter((entry) => entry.legacyPath).map((entry) => [
    entry.legacyPath,
    `/column/${entry.slug}`,
  ]),
  ['/blog/inside-japans-car-auctions', '/column'],
  ['/blog', '/column'],
  ['/logbook', '/column'],
]);

/** @param {string} slug */
export const getEntry = (slug) => ENTRIES.find((entry) => entry.slug === slug) ?? null;
