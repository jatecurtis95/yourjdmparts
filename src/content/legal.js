import { SITE, TRADE } from '../config.js';

/**
 * Policy content, kept as data so it can be read, reviewed and tested
 * without picking it out of markup.
 *
 * Every statement here describes something this codebase or this business
 * verifiably does. Nothing is boilerplate carried in from a template:
 *
 *   - the data list in the privacy policy is the request form's actual
 *     field set (src/routes/request.js), field for field;
 *   - the "no cookies, no trackers" claim is true because the site sets
 *     none and loads no third-party script, and there is a test holding
 *     that true (test/privacy.test.mjs);
 *   - the freight, duty and grading statements repeat what the rest of the
 *     site already commits to.
 *
 * Where a commercial term is genuinely not settled — payment split, quote
 * validity, a returns window in days — it is described in terms of what the
 * quote itself will say, rather than invented here. See docs/OWNER-REVIEW.md
 * for the list and who has to settle each one.
 *
 * @typedef {{heading: string, body?: string[], list?: string[]}} Section
 */

const CONTACT_LINE = `Email ${SITE.email} or call ${SITE.phone}.`;

/** @type {{updated: string, intro: string[], sections: Section[]}} */
export const PRIVACY = {
  updated: '2026-08-11',
  intro: [
    `This policy covers ${SITE.domain} and the request form on it. It is written to be read, not to be survived.`,
    'The short version: we collect what you type into the request form, we use it to find your part and quote it, and we do not sell it or hand it to advertisers. This site sets no cookies and runs no tracking scripts at all.',
  ],
  sections: [
    {
      heading: 'What we collect',
      body: [
        'Only what you give us. There is no account to create and nothing is gathered in the background.',
        'When you send a part request, the form asks for:',
      ],
      list: [
        'Your name, and your workshop or business if you have one.',
        'An email address or a phone number — one of the two, whichever you prefer.',
        'Your state and postcode, so freight can be quoted to the right place.',
        'The car: make, model, build date, and optionally chassis number, chassis code, grade, engine code, transmission, drivetrain, body style, paint code and odometer reading.',
        'The parts you are after, with any part numbers, brands, quantities and acceptable condition.',
        'How soon you need them, and a budget if you choose to give one.',
        'Any photographs you attach.',
        'How you found us, if you tell us.',
      ],
    },
    {
      heading: 'What we do with it',
      body: [
        'We use it to search for your part, to ask suppliers in Japan about it, and to send you a landed price. Chassis and build details go to suppliers because that is how fitment is settled — a chassis number is the question, not personal trivia.',
        'We will contact you about the request you sent. That is what sending it is for, and it needs no separate permission.',
        'We will only send you anything beyond that — other parts, arrivals that suit your car — if you ticked the separate box asking for it. That box is never pre-ticked, and you can tell us to stop at any time in one line, with no reason needed.',
      ],
    },
    {
      heading: 'Cookies and tracking',
      body: [
        'This site sets no cookies. It runs no analytics, no advertising pixels, no session recording and no third-party scripts of any kind. Fonts are served from our own domain rather than a font network, so loading a page does not announce your visit to anyone else.',
        'That is a design decision, and there is an automated test in the codebase that fails the build if a third-party script is ever added without a deliberate change to it.',
      ],
    },
    {
      heading: 'Who else sees it',
      body: [
        'Suppliers, dismantlers and dealers in Japan see the vehicle and part details needed to answer the question — and, where a part has to be shipped, the delivery address.',
        'Freight forwarders and the Australian Border Force see what customs clearance requires.',
        'Our web host processes the request in transit in order to deliver it to us.',
        'Nobody else. We do not sell your details, rent them, or pass them to advertisers or data brokers.',
      ],
    },
    {
      heading: 'How long we keep it',
      body: [
        'Quote requests are kept while the request is live and afterwards as a record of what was quoted and why, which is what lets us answer a question about a part you bought two years ago.',
        'Tax and customs records are kept for the period Australian law requires.',
        'Ask us to delete your details and we will, except for anything we are legally required to keep. ' +
          CONTACT_LINE,
      ],
    },
    {
      heading: 'Your rights',
      body: [
        'You can ask what we hold about you, ask us to correct it, ask us to delete it, and withdraw marketing consent — at any time, at no cost.',
        `${CONTACT_LINE} We will answer within a reasonable time.`,
        'If you are not satisfied with how we have handled your information, you can complain to the Office of the Australian Information Commissioner at oaic.gov.au.',
      ],
    },
    {
      heading: 'Security',
      body: [
        'The site is served over HTTPS end to end. Request submissions are transmitted encrypted.',
        'No system is perfect, and we would rather say that than claim otherwise. If something goes wrong in a way that affects you, we will tell you.',
      ],
    },
  ],
};

/** @type {{updated: string, intro: string[], sections: Section[]}} */
export const TERMS = {
  updated: '2026-08-11',
  intro: [
    `These terms cover using ${SITE.domain} and asking us to source a part. They are written plainly and they say what we actually do.`,
  ],
  sections: [
    {
      heading: 'What we are',
      body: [
        'We are a sourcing service, not a shop. We hold no stock. When you ask for a part we go and look for that specific part in Japan, and if we find one worth buying we quote you a landed price for it.',
        'That means we are buying on your behalf rather than selling you something off a shelf, and it is why we can go after the part your car needs instead of the one that happened to be in a warehouse.',
      ],
    },
    {
      heading: 'Quotes',
      body: [
        `Asking for a quote is free and carries no obligation. There is no deposit to quote and nothing is charged for looking. We aim to come back within ${TRADE.quoteDays} business days.`,
        'A quote is for a specific part in a specific condition at a specific time. Used parts are one-offs, and the one we quoted can be sold to somebody else while you are thinking about it — so a quote is an offer to buy that part, not a reservation of it.',
        'Each quote states what it covers, what it costs landed, and the payment terms for that part. Nothing is payable until you accept it.',
        'If we cannot find the part, we will tell you. We will not quote you a different part and hope you do not notice.',
      ],
    },
    {
      heading: 'Prices',
      body: [
        'Prices are quoted in Australian dollars, landed. That figure includes the part, freight from Japan, duty, GST, customs clearance and delivery to your postcode. There is no second invoice when the part arrives and no surprise from a courier at your door.',
        'Prices depend on the exchange rate, freight costs and what the supplier is asking on the day, so a quote holds for the period stated on it and not indefinitely.',
      ],
    },
    {
      heading: 'Condition and grading',
      body: [
        'Used parts are described honestly and graded on a published scale: Excellent, Good, Fair, or Spares or repair. The grade comes with a written description of the wear, and photographs where we have them.',
        'A used part is a used part. It will show its age, and the grade and description tell you how much. If a part is not worth the freight, we will say so before you have paid for it.',
      ],
    },
    {
      heading: 'Fitment is a shared job',
      body: [
        'We use the chassis number, build month and part numbers you give us to check fitment, and those details settle most questions better than a model year does.',
        'Give us the wrong chassis number and we will source the wrong part in good faith. Please check what you send us. If you are unsure, send a photograph of the part on the car and let us work it out — that is what we are for.',
      ],
    },
    {
      heading: 'Your rights under Australian law',
      body: [
        'Our goods and services come with guarantees that cannot be excluded under the Australian Consumer Law. Nothing on this site limits those rights, and nothing we write in a quote does either.',
        'Where the law allows us to limit liability beyond those guarantees, our liability is limited to the amount you paid for the part in question.',
      ],
    },
    {
      heading: 'This website',
      body: [
        'Chassis pages, brand pages and part categories describe what we can source. They are not a stock list and nothing on them is an offer to sell — the offer is the quote.',
        'We try to keep everything here accurate. Where something turns out to be wrong, we will correct it.',
      ],
    },
  ],
};

/** @type {{updated: string, intro: string[], sections: Section[]}} */
export const SHIPPING = {
  updated: '2026-08-11',
  intro: [
    `How parts get from Japan to you, what happens if one arrives damaged, and where you stand on a used part that turns out to be wrong.`,
  ],
  sections: [
    {
      heading: 'How parts travel',
      body: [
        `Parts are consolidated in Japan and shipped by sea, ${SITE.route.from} to ${SITE.route.to}. Sea freight is slower than air and materially cheaper, and for most parts that trade is worth making. Where something is small, urgent or fragile enough to justify air freight, we will price both and let you choose.`,
        'Duty, GST and customs clearance are handled before the part reaches you and are already inside the quoted price.',
        'From Fremantle the part goes to your postcode anywhere in Australia.',
      ],
    },
    {
      heading: 'Timing',
      body: [
        'Sourcing time depends on the part. Something sitting on a dealer shelf moves quickly; a discontinued trim piece can take as long as it takes to find a good one.',
        'Once a part is bought and in our hands in Japan, the sea freight leg is the long pole, and consolidation means a part may wait for a container to fill.',
        'Every quote gives our honest estimate for that specific part. We would rather quote a realistic date than a flattering one, and we will tell you if it slips.',
      ],
    },
    {
      heading: 'If it arrives damaged',
      body: [
        'Check the part when it arrives, before it goes anywhere near the car.',
        'If it has been damaged in transit, photograph it — the part and the packaging, before you unpack it any further — and contact us straight away. Freight damage claims depend on that evidence, and they get much harder once the packaging is in the bin.',
        'We handle the claim with the freight forwarder. You should not have to argue with a shipping line about a part you bought from us.',
      ],
    },
    {
      heading: 'If it is the wrong part',
      body: [
        'If we sourced something different from what the quote described, that is on us. We will make it right — replacement, refund, or sourcing the correct part, whichever suits you.',
        'If the part matches the quote but does not fit because the chassis or build details we were given were not the ones on the car, that is a harder conversation, and an honest one: the part was bought to order and specifically for you. Talk to us anyway. We would rather help you find a home for it than leave you stuck.',
      ],
    },
    {
      heading: 'Used parts',
      body: [
        'A used part is sold in the condition described and graded in the quote, and that description is the warranty: what we said is what you get.',
        'Used mechanical and electrical parts are not sold with a working-life guarantee. Nobody can honestly promise how long a twenty-five-year-old component will last, and we are not going to pretend otherwise.',
        'What we do guarantee is the description. If a part arrives materially worse than the grade and notes said, tell us and we will sort it out.',
        'Your rights under the Australian Consumer Law apply regardless, and nothing here reduces them.',
      ],
    },
    {
      heading: 'New parts',
      body: [
        'New parts ordered from a manufacturer or dealer carry whatever warranty that manufacturer provides. Where one applies, the quote says so.',
      ],
    },
    {
      heading: 'Change of mind',
      body: [
        'Parts are bought to order, specifically for your car, and often they are the only example we found. That makes change-of-mind returns genuinely difficult in a way that an off-the-shelf retailer does not face.',
        'So please be sure before you accept a quote — and ask us anything you need to first. Once a part is bought in Japan it is bought.',
        'If circumstances change, talk to us early. What is possible depends on where the part is in the journey, and early is always better than late.',
      ],
    },
  ],
};

/**
 * What happens after a quote lands, in order.
 *
 * Deliberately describes the shape of the process rather than inventing a
 * deposit percentage or a payment schedule — those are commercial terms only
 * the owner can set, and each quote states them for that part. `payable`
 * marks the one stage where money moves.
 */
export const PAYMENT_STAGES = [
  {
    step: 'You send a request',
    detail:
      'Free, and no deposit. Tell us the car and the part; you do not need the part number and you do not need to be sure it exists.',
  },
  {
    step: 'We search and inspect',
    detail:
      'We look for the specific part, in Japanese, where the parts actually are. Nothing is bought sight unseen — a part is inspected and photographed before we buy it.',
  },
  {
    step: 'We quote',
    detail: `Free, and no obligation. Usually within ${TRADE.quoteDays} business days you get one landed A$ figure with duty, GST and freight to your postcode already in it, plus the grade and an honest description of the wear.`,
  },
  {
    step: 'You accept',
    detail:
      'This is the first point anything is payable. The quote sets out the amount and the payment terms for that part. Until you say yes, nothing is charged and nothing is owed.',
    payable: true,
  },
  {
    step: 'We buy it in Japan',
    detail:
      'The part is purchased and moves to consolidation. From here it is bought to order specifically for your car.',
  },
  {
    step: 'Freight, duty and clearance',
    detail:
      'Sea freight, customs, duty and GST — all handled, and all already inside the price you agreed. There is no second invoice.',
  },
  {
    step: 'It arrives',
    detail:
      'Delivered to your postcode. Check it before it goes near the car, and tell us straight away if anything is not as described.',
  },
];
