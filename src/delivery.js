/**
 * Getting a part request to a person.
 *
 * The form used to depend entirely on `REQUEST_WEBHOOK`. With that unset —
 * which it was in production — a submission was written to the log and
 * nothing else, while the visitor was told "we have your request". Nobody
 * had it. That is the failure this module exists to prevent.
 *
 * Two independent routes, tried in this order:
 *
 *   1. D1 (`REQUESTS_DB`). Durable, needs no secret, and readable in the
 *      Cloudflare dashboard. This is the one that works out of the box.
 *   2. `REQUEST_WEBHOOK`. Any URL — an inbox relay, a CRM, a form service.
 *      Optional, and set independently of the above.
 *
 * If both fail the visitor is told so, and given the phone number, rather
 * than being thanked for something that went nowhere. An honest failure is
 * recoverable; a silent one is not.
 */

/**
 * A short, human-quotable reference. Deliberately not sequential: a
 * customer reading "request 4" out over the phone learns how few there
 * have been, and guessable ids invite people to try their luck at a URL.
 *
 * Ambiguous characters are left out so it survives being read aloud and
 * written down — no O/0, no I/1/L, no S/5.
 */
export function newReference(random = crypto.getRandomValues.bind(crypto)) {
  const ALPHABET = 'ABCDEFGHJKMNPQRTUVWXYZ2346789';
  const bytes = random(new Uint8Array(6));
  let out = '';
  for (const byte of bytes) out += ALPHABET[byte % ALPHABET.length];
  return `YJP-${out.slice(0, 3)}${out.slice(3)}`;
}

/** One line summarising the car, for a dashboard list that has to be skimmable. */
export function vehicleSummary(vehicle) {
  return [vehicle.make, vehicle.model, vehicle.chassisCode, vehicle.buildDate]
    .filter(Boolean)
    .join(' · ');
}

/** One line summarising what was asked for. */
export function partsSummary(parts) {
  if (!parts.length) return '';
  const first = parts[0].description;
  return parts.length === 1 ? first : `${first} (+${parts.length - 1} more)`;
}

/**
 * Write the request to D1.
 *
 * @param {object} db the REQUESTS_DB binding
 * @param {object} payload
 * @param {boolean} forwarded whether the webhook already took it
 * @returns {Promise<boolean>} true when the row is committed
 */
async function store(db, payload, forwarded) {
  await db
    .prepare(
      `INSERT INTO requests (
         reference, received_at, handled, forwarded, name, business, email, phone,
         state, postcode, heard_from, marketing_consent, vehicle_summary,
         parts_summary, urgency, budget, photo_count, payload
       ) VALUES (?, ?, 0, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      payload.reference,
      payload.receivedAt,
      forwarded ? 1 : 0,
      payload.contact.name ?? null,
      payload.contact.business ?? null,
      payload.contact.email ?? null,
      payload.contact.phone ?? null,
      payload.contact.state ?? null,
      payload.contact.postcode ?? null,
      payload.contact.heardFrom ?? null,
      payload.contact.marketingConsent ? 1 : 0,
      vehicleSummary(payload.vehicle),
      partsSummary(payload.parts),
      payload.request.urgency ?? null,
      payload.request.budget ?? null,
      payload.request.photos.length,
      JSON.stringify(payload),
    )
    .run();
  return true;
}

/**
 * Deliver a validated request by every route available.
 *
 * Never throws: a delivery problem must not turn into a 500 on top of a
 * lost request. The returned flags are what the success page renders from.
 *
 * @param {object} payload
 * @param {{REQUESTS_DB?: object, REQUEST_WEBHOOK?: string}} env
 * @returns {Promise<{stored: boolean, forwarded: boolean, reachedSomeone: boolean}>}
 */
export async function deliverRequest(payload, env = {}) {
  let forwarded = false;
  let stored = false;

  if (env.REQUEST_WEBHOOK) {
    try {
      const response = await fetch(env.REQUEST_WEBHOOK, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      // A 500 from the other end is not delivery, however willing we were.
      forwarded = response.ok;
      if (!forwarded) console.error('Request webhook returned', response.status);
    } catch (error) {
      console.error('Request webhook failed', error);
    }
  }

  if (env.REQUESTS_DB) {
    try {
      stored = await store(env.REQUESTS_DB, payload, forwarded);
    } catch (error) {
      console.error('Request store failed', error);
    }
  }

  // The log is the last resort, not a delivery route — it is only ever seen
  // by someone already looking. Printed whenever a real route failed, so
  // the request is at least recoverable from `wrangler tail`.
  if (!stored || !forwarded) {
    console.log('Part request', JSON.stringify(payload));
  }

  return { stored, forwarded, reachedSomeone: stored || forwarded };
}
