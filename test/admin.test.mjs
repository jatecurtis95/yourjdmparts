import { test } from 'node:test';
import assert from 'node:assert/strict';
import worker from '../src/worker.js';
import { ORIGIN } from './helpers.mjs';

/**
 * The export carries customer names, emails, phone numbers and addresses.
 * Everything here is about it not leaking.
 */

const ROWS = [
  {
    reference: 'YJP-ABC234',
    received_at: '2026-08-11T00:00:00.000Z',
    handled: 0,
    forwarded: 1,
    name: 'Sam "Sammy" Rivera',
    business: 'Rivera Motors, Perth',
    email: 'sam@example.com',
    phone: '0400 000 000',
    state: 'WA',
    postcode: '6000',
    heard_from: 'Instagram',
    marketing_consent: 0,
    vehicle_summary: 'Toyota · Supra · JZA80',
    parts_summary: 'Right-hand front guard',
    urgency: 'month',
    budget: null,
    photo_count: 2,
  },
];

const db = {
  prepare: (sql) => ({
    all: async () => ({ results: sql.includes('WHERE handled = 0') ? ROWS : ROWS }),
  }),
};

const get = (path, env, init) => worker.fetch(new Request(ORIGIN + path, init), env);

test('the route does not exist until it is configured', async () => {
  for (const env of [{}, { REQUESTS_DB: db }, { ADMIN_TOKEN: 'secret-token' }]) {
    const response = await get('/admin/requests.csv', env);
    assert.equal(response.status, 404, 'an unconfigured deployment must give nothing away');
    // A 401 with a challenge header would confirm the route exists. The
    // ordinary not-found page confirms nothing.
    assert.equal(response.headers.get('www-authenticate'), null);
    assert.match(await response.text(), /That page is not here/);
  }
});

test('a missing or wrong token is refused', async () => {
  const env = { ADMIN_TOKEN: 'secret-token', REQUESTS_DB: db };
  for (const path of [
    '/admin/requests.csv',
    '/admin/requests.csv?token=',
    '/admin/requests.csv?token=wrong',
    '/admin/requests.csv?token=secret-toke',
    '/admin/requests.csv?token=secret-tokenn',
  ]) {
    const response = await get(path, env);
    assert.equal(response.status, 401, `${path} must be refused`);
    assert.doesNotMatch(await response.text(), /sam@example\.com/, 'no data may leak on refusal');
  }
});

test('the right token returns the rows, by header or by query', async () => {
  const env = { ADMIN_TOKEN: 'secret-token', REQUESTS_DB: db };
  const responses = [
    await get('/admin/requests.csv?token=secret-token', env),
    await get('/admin/requests.csv', env, {
      headers: { authorization: 'Bearer secret-token' },
    }),
  ];
  for (const response of responses) {
    assert.equal(response.status, 200);
    assert.match(response.headers.get('content-type'), /text\/csv/);
    const body = await response.text();
    assert.match(body, /^reference,received_at/, 'a header row makes it openable in a spreadsheet');
    assert.match(body, /YJP-ABC234/);
    // A comma in a field and a quote in a name are the two things that
    // break naive CSV, and both are in the fixture.
    assert.match(body, /"Sam ""Sammy"" Rivera"/, 'quotes must be doubled');
    assert.match(body, /"Rivera Motors, Perth"/, 'a comma must not split the row');
    assert.equal(body.trim().split('\n').length, 2, 'one header, one row');
  }
});

test('the export is never cached and never indexed', async () => {
  const response = await get('/admin/requests.csv?token=secret-token', {
    ADMIN_TOKEN: 'secret-token',
    REQUESTS_DB: db,
  });
  assert.match(response.headers.get('cache-control'), /no-store/);
  assert.match(response.headers.get('cache-control'), /private/);
  assert.equal(response.headers.get('x-robots-tag'), 'noindex, nofollow');
  assert.match(response.headers.get('content-disposition'), /attachment/);
});

test('the admin path is absent from the sitemap', async () => {
  const sitemap = await get('/sitemap.xml', {}).then((r) => r.text());
  assert.doesNotMatch(sitemap, /admin/);
});
