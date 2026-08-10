import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateRequest, collectParts, handleRequestSubmit } from '../src/routes/request.js';
import { getHtml, ORIGIN } from './helpers.mjs';

const VEHICLE = {
  make: 'Toyota',
  model: 'Supra',
  buildDate: '1997-04',
  name: 'Sam Rivera',
  email: 'sam@example.com',
  phone: '0400 000 000',
};

const ONE_PART = [{ description: 'Right-hand front guard, original paint preferred.' }];

const submit = (fields, parts = ONE_PART) => {
  const body = new FormData();
  for (const [key, value] of Object.entries(fields)) body.append(key, value);
  parts.forEach((part, i) => {
    for (const [key, value] of Object.entries(part)) body.append(`parts[${i}][${key}]`, value);
  });
  return handleRequestSubmit(new Request(ORIGIN + '/request', { method: 'POST', body }));
};

/* ── Validation ─────────────────────────────────────────────── */

test('a complete request validates', () => {
  const { errors, partErrors } = validateRequest(VEHICLE, ONE_PART);
  assert.deepEqual(errors, {});
  assert.deepEqual(partErrors, [{}]);
});

test('the fields we cannot work without are required', () => {
  const { errors } = validateRequest({}, [{}]);
  for (const field of ['make', 'model', 'buildDate', 'name', 'email', 'phone']) {
    assert.ok(errors[field], `${field} should be required`);
  }
});

test('optional identification fields stay optional', () => {
  const { errors } = validateRequest(VEHICLE, ONE_PART);
  for (const field of ['chassisCode', 'chassisNumber', 'engineCode', 'grade', 'paintCode']) {
    assert.ok(!errors[field], `${field} must not be required`);
  }
});

test('a request with no part described is rejected', () => {
  const { errors, partErrors } = validateRequest(VEHICLE, [{ partNumber: '22030-46110' }]);
  assert.ok(errors.parts, 'a request must name at least one part');
  assert.ok(partErrors[0].description);
});

test('a malformed email is caught', () => {
  assert.ok(validateRequest({ ...VEHICLE, email: 'sam-at-example' }, ONE_PART).errors.email);
  assert.ok(validateRequest({ ...VEHICLE, email: 'sam@example' }, ONE_PART).errors.email);
  assert.ok(!validateRequest({ ...VEHICLE, email: 'sam.rivera+parts@example.co.uk' }, ONE_PART).errors.email);
});

test('the build month must be a real month in a plausible year', () => {
  const bad = (v) => validateRequest({ ...VEHICLE, buildDate: v }, ONE_PART).errors.buildDate;
  assert.ok(bad('1997'));
  assert.ok(bad('1997-13'));
  assert.ok(bad('1850-04'));
  assert.ok(!bad('2002-12'));
});

test('a chassis number that is obviously too short is caught', () => {
  assert.ok(validateRequest({ ...VEHICLE, chassisNumber: 'JZA' }, ONE_PART).errors.chassisNumber);
  assert.ok(!validateRequest({ ...VEHICLE, chassisNumber: 'JZA80-0012345' }, ONE_PART).errors.chassisNumber);
});

test('postcode and odometer are checked when given', () => {
  assert.ok(validateRequest({ ...VEHICLE, postcode: '31' }, ONE_PART).errors.postcode);
  assert.ok(!validateRequest({ ...VEHICLE, postcode: '3121' }, ONE_PART).errors.postcode);
  assert.ok(validateRequest({ ...VEHICLE, odometer: 'lots' }, ONE_PART).errors.odometer);
  assert.ok(!validateRequest({ ...VEHICLE, odometer: '84,220' }, ONE_PART).errors.odometer);
});

test('a bad quantity is reported against the part that has it', () => {
  const { partErrors } = validateRequest(VEHICLE, [
    { description: 'Front guard' },
    { description: 'Tail lights', quantity: 'two' },
  ]);
  assert.ok(!partErrors[0].quantity);
  assert.ok(partErrors[1].quantity);
});

/* ── Repeated part blocks ───────────────────────────────────── */

test('part blocks are collected in order regardless of field order', () => {
  const parts = collectParts([
    ['make', 'Toyota'],
    ['parts[1][description]', 'Tail lights'],
    ['parts[0][description]', 'Front guard'],
    ['parts[0][quantity]', '2'],
    ['parts[1][partNumber]', 'FD01-51-150'],
  ]);
  assert.equal(parts.length, 2);
  assert.equal(parts[0].description, 'Front guard');
  assert.equal(parts[0].quantity, '2');
  assert.equal(parts[1].partNumber, 'FD01-51-150');
});

test('indexes above nine keep their numeric order', () => {
  const parts = collectParts([
    ['parts[10][description]', 'Eleventh'],
    ['parts[2][description]', 'Third'],
  ]);
  assert.deepEqual(parts.map((p) => p.description), ['Third', 'Eleventh']);
});

test('one request can carry several parts through to the payload', async () => {
  const captured = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url, init) => {
    captured.push(JSON.parse(init.body));
    return new Response('ok');
  };

  try {
    const body = new FormData();
    for (const [key, value] of Object.entries({
      ...VEHICLE,
      chassisCode: 'JZA80',
      chassisNumber: 'JZA80-0012345',
      grade: 'RZ',
      engineCode: '2JZ-GTE',
      transmission: 'manual',
      drivetrain: 'rwd',
      bodyStyle: 'coupe',
      paintCode: 'TV2',
      odometer: '84,220',
      postcode: '3121',
      state: 'VIC',
      urgency: 'month',
      consent: 'yes',
    })) {
      body.append(key, value);
    }
    body.append('parts[0][description]', 'Right-hand front guard');
    body.append('parts[0][partNumber]', '53801-14140');
    body.append('parts[0][quantity]', '1');
    body.append('parts[1][description]', 'Coilovers');
    body.append('parts[1][brand]', 'Tein');
    body.append('parts[1][quantity]', '4');

    await handleRequestSubmit(new Request(ORIGIN + '/request', { method: 'POST', body }), {
      REQUEST_WEBHOOK: 'https://example.invalid/hook',
    });
  } finally {
    globalThis.fetch = originalFetch;
  }

  assert.equal(captured.length, 1);
  const payload = captured[0];

  assert.equal(payload.vehicle.chassisNumber, 'JZA80-0012345');
  assert.equal(payload.vehicle.engineCode, '2JZ-GTE');
  assert.equal(payload.vehicle.odometerKm, 84220, 'odometer is normalised to a number');

  assert.equal(payload.parts.length, 2);
  assert.equal(payload.parts[0].partNumber, '53801-14140');
  assert.equal(payload.parts[1].brand, 'Tein');
  assert.equal(payload.parts[1].quantity, 4);

  assert.equal(payload.contact.consent, true);
  assert.equal(payload.contact.email, 'sam@example.com');
});

test('empty part blocks are dropped rather than sent as blanks', async () => {
  const captured = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url, init) => {
    captured.push(JSON.parse(init.body));
    return new Response('ok');
  };
  try {
    const body = new FormData();
    for (const [k, v] of Object.entries(VEHICLE)) body.append(k, v);
    body.append('parts[0][description]', 'Front guard');
    body.append('parts[1][description]', '   ');
    body.append('parts[1][quantity]', '1');
    await handleRequestSubmit(new Request(ORIGIN + '/request', { method: 'POST', body }), {
      REQUEST_WEBHOOK: 'https://example.invalid/hook',
    });
  } finally {
    globalThis.fetch = originalFetch;
  }
  assert.equal(captured[0].parts.length, 1);
});

/* ── Submission ─────────────────────────────────────────────── */

test('a valid submission is accepted and confirmed', async () => {
  const response = await submit(VEHICLE);
  assert.equal(response.status, 200);
  assert.match(await response.text(), /We have your request/);
});

test('an invalid submission returns 422 and keeps what was typed', async () => {
  const response = await submit({ ...VEHICLE, email: 'nope' });
  assert.equal(response.status, 422);
  const body = await response.text();
  assert.match(body, /does not look right/);
  assert.match(body, /value="Supra"/, 'the model field should still hold what was typed');
  assert.match(body, /Right-hand front guard/, 'the part description should survive');
});

test('the honeypot silently absorbs bots', async () => {
  const response = await submit({ ...VEHICLE, companyWebsite: 'http://spam.example' });
  assert.equal(response.status, 200);
  assert.match(await response.text(), /We have your request/);
});

/* ── Deep links ─────────────────────────────────────────────── */

test('a request deep-linked from a part type arrives pre-filled', async () => {
  const { html } = await getHtml('/request?chassis=JZA80&part=coilovers');
  assert.match(html, /value="JZA80"/, 'chassis code should be seeded');
  assert.match(html, /Coilovers and dampers/, 'the part type should be seeded');
});

test('a request deep-linked from a brand arrives pre-filled', async () => {
  const { html } = await getHtml('/request?brand=tein');
  assert.match(html, /value="Tein"/);
});

test('an unknown deep link seeds nothing rather than breaking', async () => {
  const { html, status } = await getHtml('/request?brand=not-a-brand&part=not-a-part');
  assert.equal(status, 200);
  assert.doesNotMatch(html, /not-a-brand/);
});

test('the form posts as multipart so photographs can travel with it', async () => {
  const { html } = await getHtml('/request');
  assert.match(html, /enctype="multipart\/form-data"/);
  assert.match(html, /type="file"[^>]*name="photos"/);
});

test('the form ships a template so more parts can be added in the browser', async () => {
  const { html } = await getHtml('/request');
  assert.match(html, /<template data-part-template>/);
  assert.match(html, /data-add-part/);
  assert.match(html, /data-max-parts="\d+"/);
});
