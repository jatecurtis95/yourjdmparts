import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { getHtml, getStatus, textOf } from './helpers.mjs';
import { FINDS, isPublishable, publishedFinds, hasPublishedFinds, itemisedTotal } from '../src/data/finds.js';
import { ENTRIES, LEGACY_COLUMN_PATHS } from '../src/content/column.js';
import { PRIVACY, TERMS, SHIPPING, PAYMENT_STAGES } from '../src/content/legal.js';
import { FindPage } from '../src/routes/finds.js';
import { render } from '../src/html.js';

const APP_JS = readFileSync(new URL('../public/assets/app.js', import.meta.url).pathname, 'utf8');

/* ── Policies ───────────────────────────────────────────────── */

test('every policy page renders with its sections and a contents list', async () => {
  const pages = [
    ['/privacy', PRIVACY],
    ['/terms', TERMS],
    ['/shipping-and-returns', SHIPPING],
  ];
  for (const [path, doc] of pages) {
    const { html, status } = await getHtml(path);
    assert.equal(status, 200, `${path} must render`);
    const text = textOf(html);
    for (const section of doc.sections) {
      assert.ok(text.includes(section.heading), `${path} is missing "${section.heading}"`);
    }
    assert.ok(html.includes('doc__toc'), `${path} needs a contents list`);
    // No screen ends in nothing.
    assert.ok(html.includes('href="/request"'), `${path} must offer a way onward`);
  }
});

test('the privacy policy lists the fields the form actually collects', async () => {
  const { html } = await getHtml('/privacy');
  const text = textOf(html);
  for (const claim of ['chassis number', 'build date', 'postcode', 'photographs']) {
    assert.ok(text.toLowerCase().includes(claim), `privacy policy should mention ${claim}`);
  }
});

test('payment stages name exactly one point where money moves', () => {
  const payable = PAYMENT_STAGES.filter((stage) => stage.payable);
  assert.equal(payable.length, 1, 'exactly one stage may be the first payment');
  assert.equal(payable[0].step, 'You accept');
});

test('how it works shows the payment stages and links the full terms', async () => {
  const { html } = await getHtml('/how-it-works');
  const text = textOf(html);
  for (const stage of PAYMENT_STAGES) {
    assert.ok(text.includes(stage.step), `missing stage "${stage.step}"`);
  }
  assert.ok(html.includes('href="/terms"'));
  assert.ok(html.includes('href="/shipping-and-returns"'));
});

/* ── The Column ─────────────────────────────────────────────── */

test('the migrated entry keeps its original date and author', async () => {
  const entry = ENTRIES.find((e) => e.slug === 'searching-all-of-japan');
  assert.ok(entry, 'the parts-sourcing entry must be migrated');
  assert.equal(entry.published, '2026-07-22', 'the original publication date must survive');
  assert.equal(entry.author, 'Emi');

  const { html, status } = await getHtml(`/column/${entry.slug}`);
  assert.equal(status, 200);
  assert.match(html, /<time datetime="2026-07-22">/);
  assert.match(html, /"datePublished":"2026-07-22"/);
  assert.ok(textOf(html).includes('I grew up in Japan'), 'the substance must survive migration');
});

test('every old writing URL redirects rather than 404s', async () => {
  for (const [from, to] of LEGACY_COLUMN_PATHS) {
    const response = await getHtml(from).then((r) => r.response);
    assert.equal(response.status, 301, `${from} must redirect permanently`);
    assert.equal(new URL(response.headers.get('location')).pathname, to, `${from} -> ${to}`);
  }
});

test('the entry that was not migrated is not published anywhere', async () => {
  assert.equal(await getStatus('/column/inside-japans-car-auctions'), 404);
  const { html } = await getHtml('/column');
  assert.doesNotMatch(textOf(html), /car auctions/i, 'the held-back entry must not be listed');
});

test('a migrated entry never advertises the vehicle import service', async () => {
  for (const entry of ENTRIES) {
    const { html } = await getHtml(`/column/${entry.slug}`);
    assert.doesNotMatch(html, /href="\/import-a-car"/);
    assert.doesNotMatch(textOf(html), /import a car/i, `${entry.slug} sells a service we do not offer`);
  }
});

/* ── Recent finds ───────────────────────────────────────────── */

test('no find is published until a real one is supplied', () => {
  assert.deepEqual(FINDS, [], 'seed or example case studies must never ship');
  assert.equal(hasPublishedFinds(), false);
  assert.deepEqual(publishedFinds(), []);
});

test('the finds section stays off the site while it is empty', async () => {
  assert.equal(await getStatus('/finds'), 404);
  const { html: home } = await getHtml('/');
  assert.doesNotMatch(home, /href="\/finds/, 'the homepage must not link an empty section');
  const { html: sitemap } = await getHtml('/sitemap.xml');
  assert.doesNotMatch(sitemap, /\/finds/, 'the sitemap must not advertise a 404');
});

test('isPublishable demands a car, a part and a real landed total', () => {
  const complete = {
    published: true,
    slug: 'a',
    title: 'A',
    vehicle: '1997 Toyota Supra RZ',
    requestedPart: 'Right-hand front guard',
    totalCents: 148000,
  };
  assert.equal(isPublishable(complete), true);
  assert.equal(isPublishable({ ...complete, published: false }), false, 'unpublished stays hidden');
  assert.equal(isPublishable({ ...complete, totalCents: null }), false, 'no total, no case study');
  assert.equal(isPublishable({ ...complete, vehicle: null }), false, 'must identify the car');
  assert.equal(isPublishable({ ...complete, requestedPart: null }), false, 'must say what was asked for');
});

test('a find renders with only the fields it actually has', () => {
  // The minimum viable entry: no photos, no grade, no testimonial, no
  // itemised costs. It must still produce a page, and must not invent rows.
  const sparse = {
    slug: 'sparse',
    title: 'Front guard for a JZA80',
    published: true,
    completed: null,
    vehicle: '1997 Toyota Supra RZ',
    chassisCode: 'JZA80',
    problem: null,
    requestedPart: 'Right-hand front guard',
    source: null,
    inspection: null,
    grade: null,
    quoteDays: null,
    partCents: null,
    freightCents: null,
    dutyGstCents: null,
    totalCents: 148000,
    deliveryTimeline: null,
    outcome: null,
    testimonial: null,
    images: [],
  };
  assert.equal(itemisedTotal(sparse), null, 'a partial cost breakdown must not be summed');

  const html = render(FindPage({ find: sparse }));
  assert.ok(html.includes('A$1,480'), 'the landed total must print');
  assert.doesNotMatch(html, /null|undefined|NaN/, 'a missing field must not leak into the page');
  assert.doesNotMatch(html, /find-gallery/, 'no gallery without photographs');
  assert.doesNotMatch(html, /class="quote"/, 'no testimonial block without a testimonial');
  assert.doesNotMatch(html, /Condition grade/, 'no grade row without a grade');
});

test('a complete find shows the money broken out and alt text on every image', () => {
  const full = {
    slug: 'full',
    title: 'Front guard for a JZA80',
    published: true,
    completed: '2026-06-02',
    vehicle: '1997 Toyota Supra RZ',
    chassisCode: 'JZA80',
    problem: 'Parking damage to the right front guard, original paint.',
    requestedPart: 'Right-hand front guard',
    source: 'Dismantler in Ibaraki',
    inspection: 'Straight, no filler. Two stone chips on the leading edge, described in the quote.',
    grade: 'Good',
    quoteDays: 3,
    partCents: 62000,
    freightCents: 48000,
    dutyGstCents: 38000,
    totalCents: 148000,
    deliveryTimeline: '5 weeks from accepted quote',
    outcome: 'Fitted and painted locally.',
    testimonial: { quote: 'Straight answer, no surprises.', attribution: 'Workshop, Perth' },
    images: [
      { src: '/assets/finds/full/guard.jpg', alt: 'Right-hand front guard photographed on a bench, two stone chips visible on the leading edge' },
    ],
  };
  assert.equal(itemisedTotal(full), full.totalCents, 'the itemised costs must sum to the total');

  const html = render(FindPage({ find: full }));
  for (const money of ['A$620', 'A$480', 'A$380', 'A$1,480']) {
    assert.ok(html.includes(money), `${money} must appear in the breakdown`);
  }
  for (const [, tag] of html.matchAll(/(<img[^>]*>)/g)) {
    const alt = /alt="([^"]*)"/.exec(tag);
    assert.ok(alt && alt[1].length > 20, `image needs useful alt text: ${tag}`);
  }
});

/* ── Measurement ────────────────────────────────────────────── */

test('all five quote events are emitted', () => {
  for (const name of [
    'quote_form_started',
    'quote_step_viewed',
    'quote_form_validation_error',
    'quote_form_submitted',
    'quote_form_success',
  ]) {
    assert.ok(APP_JS.includes(`'${name}'`), `${name} is never emitted`);
  }
});

test('the analytics allowlist cannot carry anything a customer typed', () => {
  const allowlist = /var ALLOWED_PARAMS = \[([^\]]*)\]/.exec(APP_JS);
  assert.ok(allowlist, 'the allowlist must exist');
  const keys = allowlist[1].match(/'([^']+)'/g).map((k) => k.replace(/'/g, ''));

  // Counts, positions and field names only.
  assert.deepEqual(keys.sort(), [
    'field', 'field_count', 'part_count', 'step', 'step_count', 'step_title',
  ]);

  for (const banned of [
    'name', 'email', 'phone', 'vin', 'chassis', 'chassisNumber', 'description',
    'partNumber', 'postcode', 'budget', 'filename', 'value',
  ]) {
    assert.ok(!keys.includes(banned), `${banned} must never be a tracked parameter`);
  }
});

test('tracked field identifiers are names, never values', () => {
  // fieldName() reads the name attribute and strips array indices. If it
  // ever reached .value, every part description would become a metric.
  const fn = /function fieldName\(field\) \{[\s\S]*?\n  \}/.exec(APP_JS);
  assert.ok(fn, 'fieldName must exist');
  assert.doesNotMatch(fn[0], /\.value/, 'fieldName must never read a field value');
});
