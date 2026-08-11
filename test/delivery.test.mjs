import { test } from 'node:test';
import assert from 'node:assert/strict';
import { deliverRequest, newReference, vehicleSummary, partsSummary } from '../src/delivery.js';
import { handleRequestSubmit } from '../src/routes/request.js';
import { ORIGIN } from './helpers.mjs';

/**
 * A submitted request must reach a person, or the visitor must be told it
 * did not. The old code did neither: with no webhook configured it wrote to
 * the log and thanked the customer regardless.
 */

const VALID = {
  make: 'Toyota',
  model: 'Supra',
  buildDate: '1997-04',
  name: 'Sam Rivera',
  email: 'sam@example.com',
};

function submit(env, fields = VALID) {
  const body = new FormData();
  for (const [k, v] of Object.entries(fields)) body.append(k, v);
  body.append('parts[0][description]', 'Right-hand front guard');
  return handleRequestSubmit(new Request(ORIGIN + '/request', { method: 'POST', body }), env);
}

/** A D1 stand-in that records what it was asked to write. */
function fakeDb({ fail = false } = {}) {
  const rows = [];
  return {
    rows,
    prepare(sql) {
      return {
        bind(...params) {
          return {
            async run() {
              if (fail) throw new Error('D1 unavailable');
              rows.push({ sql, params });
              return { success: true };
            },
          };
        },
      };
    },
  };
}

const PAYLOAD = {
  reference: 'YJP-ABC234',
  receivedAt: '2026-08-11T00:00:00.000Z',
  vehicle: { make: 'Toyota', model: 'Supra', chassisCode: 'JZA80', buildDate: '1997-04' },
  parts: [{ description: 'Right-hand front guard' }, { description: 'Coilovers' }],
  request: { urgency: null, budget: null, photos: [] },
  contact: { name: 'Sam', email: 'sam@example.com', phone: null, marketingConsent: false },
};

/* ── References ─────────────────────────────────────────────── */

test('a reference is short, quotable and free of ambiguous characters', () => {
  for (let i = 0; i < 200; i++) {
    const ref = newReference();
    assert.match(ref, /^YJP-[ABCDEFGHJKMNPQRTUVWXYZ2346789]{6}$/, ref);
    // O/0, I/1/L and S/5 are the pairs that get misheard and mistyped.
    assert.doesNotMatch(ref.slice(4), /[OI1L0S5]/, `${ref} contains an ambiguous character`);
  }
});

test('references do not collide in ordinary volumes', () => {
  const seen = new Set();
  for (let i = 0; i < 2000; i++) seen.add(newReference());
  assert.equal(seen.size, 2000, 'references must not repeat');
});

/* ── Summaries ──────────────────────────────────────────────── */

test('summaries stay readable when fields are missing', () => {
  assert.equal(vehicleSummary(PAYLOAD.vehicle), 'Toyota · Supra · JZA80 · 1997-04');
  assert.equal(vehicleSummary({ make: 'Nissan', model: null }), 'Nissan');
  assert.equal(partsSummary(PAYLOAD.parts), 'Right-hand front guard (+1 more)');
  assert.equal(partsSummary([{ description: 'Coilovers' }]), 'Coilovers');
  assert.equal(partsSummary([]), '');
});

/* ── Delivery ───────────────────────────────────────────────── */

test('with only a database bound, the request is stored', async () => {
  const db = fakeDb();
  const result = await deliverRequest(PAYLOAD, { REQUESTS_DB: db });
  assert.deepEqual(result, { stored: true, forwarded: false, reachedSomeone: true });
  assert.equal(db.rows.length, 1);
  const [row] = db.rows;
  assert.ok(row.params.includes('YJP-ABC234'));
  assert.ok(row.params.includes('Toyota · Supra · JZA80 · 1997-04'));
  // The whole payload survives, so nothing typed is lost to the summary.
  assert.ok(row.params.some((p) => typeof p === 'string' && p.includes('"reference"')));
});

test('with only a webhook set, the request is forwarded', async () => {
  const sent = [];
  const original = globalThis.fetch;
  globalThis.fetch = async (url, init) => {
    sent.push({ url, body: JSON.parse(init.body) });
    return new Response('ok', { status: 200 });
  };
  try {
    const result = await deliverRequest(PAYLOAD, { REQUEST_WEBHOOK: 'https://example.invalid/h' });
    assert.deepEqual(result, { stored: false, forwarded: true, reachedSomeone: true });
    assert.equal(sent[0].body.reference, 'YJP-ABC234');
  } finally {
    globalThis.fetch = original;
  }
});

test('a webhook that answers with an error is not counted as delivered', async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async () => new Response('nope', { status: 500 });
  try {
    const result = await deliverRequest(PAYLOAD, { REQUEST_WEBHOOK: 'https://example.invalid/h' });
    assert.equal(result.forwarded, false, 'a 500 is not delivery, however willing we were');
    assert.equal(result.reachedSomeone, false);
  } finally {
    globalThis.fetch = original;
  }
});

test('a failing webhook still leaves the request stored', async () => {
  const db = fakeDb();
  const original = globalThis.fetch;
  globalThis.fetch = async () => {
    throw new Error('network down');
  };
  try {
    const result = await deliverRequest(PAYLOAD, {
      REQUESTS_DB: db,
      REQUEST_WEBHOOK: 'https://example.invalid/h',
    });
    assert.equal(result.forwarded, false);
    assert.equal(result.stored, true, 'the two routes must be independent');
    assert.equal(result.reachedSomeone, true);
  } finally {
    globalThis.fetch = original;
  }
});

test('a database failure never throws out of delivery', async () => {
  const result = await deliverRequest(PAYLOAD, { REQUESTS_DB: fakeDb({ fail: true }) });
  assert.deepEqual(result, { stored: false, forwarded: false, reachedSomeone: false });
});

test('with nothing configured, nothing claims to have delivered', async () => {
  const result = await deliverRequest(PAYLOAD, {});
  assert.equal(result.reachedSomeone, false);
});

/* ── What the visitor is told ───────────────────────────────── */

test('a stored request shows a quotable reference', async () => {
  const db = fakeDb();
  const html = await submit({ REQUESTS_DB: db }).then((r) => r.text());
  assert.match(html, /We have your request/);
  const ref = /YJP-[A-Z0-9]{6}/.exec(html);
  assert.ok(ref, 'the success page must show a reference');
  assert.ok(
    db.rows[0].params.includes(ref[0]),
    'the reference shown must be the one that was stored',
  );
});

test('when delivery fails the visitor is told, not thanked', async () => {
  const html = await submit({}).then((r) => r.text());
  assert.doesNotMatch(html, /We have your request/, 'must not claim receipt of a lost request');
  assert.match(html, /That did not reach us/);
  // And is handed a channel that does not depend on us working.
  assert.match(html, /href="tel:\+61494070106"/);
  assert.match(html, /href="mailto:info@yourjdmparts\.com"/);
});

test('the honeypot still answers as though it worked, and stores nothing', async () => {
  const db = fakeDb();
  const html = await submit({ REQUESTS_DB: db }, { ...VALID, companyWebsite: 'http://spam' }).then(
    (r) => r.text(),
  );
  assert.match(html, /We have your request/, 'a bot must not learn it was caught');
  assert.equal(db.rows.length, 0, 'nothing from a bot may be written');
});

test('a rejected request is never stored', async () => {
  const db = fakeDb();
  const response = await submit({ REQUESTS_DB: db }, { make: 'Toyota', model: 'Supra' });
  assert.equal(response.status, 422);
  assert.equal(db.rows.length, 0);
});

test('the success marker distinguishes delivered from undelivered', async () => {
  const store = { prepare: () => ({ bind: () => ({ run: async () => ({ success: true }) }) }) };
  const delivered = await submit({ REQUESTS_DB: store }).then((r) => r.text());
  assert.match(delivered, /data-quote-success/);
  assert.doesNotMatch(delivered, /data-quote-failed/);

  // quote_form_success is fired off the first marker. If an undelivered
  // request carried it too, the metric would say the form works while
  // requests were being lost.
  const lost = await submit({}).then((r) => r.text());
  assert.match(lost, /data-quote-failed/);
  assert.doesNotMatch(lost, /data-quote-success/);
});
