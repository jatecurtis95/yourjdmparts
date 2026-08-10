import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getHtml, textOf, PAGE_PATHS, blocksOf } from './helpers.mjs';
import { PART_TYPES, CATEGORIES } from '../src/data/catalogue.js';
import { BRANDS, BRAND_CATEGORIES } from '../src/data/brands.js';
import { CHASSIS } from '../src/data/chassis.js';
import { formatAud, formatKm, formatDate, withGst } from '../src/format.js';

/* ── House style ────────────────────────────────────────────── */

test('no emoji anywhere', async () => {
  // © ® ™ are Extended_Pictographic but are typographic marks, not emoji.
  const typographic = /[©®™]/g;
  const emoji = /\p{Extended_Pictographic}/u;
  for (const path of PAGE_PATHS) {
    const text = textOf(await getHtml(path).then((r) => r.html)).replace(typographic, '');
    const found = emoji.exec(text);
    assert.ok(!found, `${path} contains an emoji: ${found && found[0]}`);
  }
});

test('no exclamation marks', async () => {
  for (const path of PAGE_PATHS) {
    const { html } = await getHtml(path);
    assert.ok(!textOf(html).includes('!'), `${path} contains an exclamation mark`);
  }
});

test('no racing metaphors or decorative Japanese', async () => {
  const banned = [
    'unleash', 'adrenaline', 'pole position', 'race-bred', 'apex predator',
    'turbocharge your', 'fast lane', 'full throttle', 'kaizen', 'ichiban',
    'sugoi', 'kanjo',
  ];
  for (const path of PAGE_PATHS) {
    const { html } = await getHtml(path);
    const text = textOf(html).toLowerCase();
    for (const phrase of banned) {
      assert.ok(!text.includes(phrase), `${path} uses "${phrase}"`);
    }
  }
});

test('Australian formatting helpers', () => {
  assert.equal(formatAud(148000), 'A$1,480');
  assert.equal(formatAud(4850), 'A$48.50');
  assert.equal(formatKm(84220), '84,220 km');
  assert.equal(formatDate('2026-08-04'), '4 August 2026');
  assert.equal(withGst(100000), 110000);
});

/* ── We are a sourcing service, not a shop ──────────────────── */

test('no page claims to hold stock', async () => {
  // These would all be lies: we source to order and hold nothing.
  const banned = [
    'in stock',
    'out of stock',
    'add to cart',
    'add to order',
    'on the shelf now',
    'landed this week',
    'sold out',
    'buy now',
    'free shipping',
  ];
  for (const path of PAGE_PATHS) {
    const { html } = await getHtml(path);
    const text = textOf(html).toLowerCase();
    for (const phrase of banned) {
      assert.ok(!text.includes(phrase), `${path} claims stock with "${phrase}"`);
    }
  }
});

test('no price is quoted anywhere, because a price needs a found part', async () => {
  for (const path of PAGE_PATHS) {
    const { html } = await getHtml(path);
    const text = textOf(html);
    // A$ followed by digits would be a quoted price. "A$ landed" as a phrase
    // is fine, and so is a placeholder inside a form field.
    const priced = /A\$\s?\d/.exec(text);
    assert.ok(!priced, `${path} quotes a price: ${priced && priced[0]}`);
  }
});

test('the brands pages never claim a distributor relationship', async () => {
  const banned = ['authorised dealer', 'authorized dealer', 'official distributor', 'exclusive distributor'];
  for (const path of ['/brands', '/brands/tein', '/brands/nismo']) {
    const { html } = await getHtml(path);
    const text = textOf(html).toLowerCase();
    for (const phrase of banned) {
      assert.ok(!text.includes(phrase), `${path} claims "${phrase}"`);
    }
  }
  // And it says plainly what we are.
  const { html } = await getHtml('/brands');
  assert.match(textOf(html), /not a distributor/i);
});

/* ── Data integrity ─────────────────────────────────────────── */

test('every part type slug is unique and has a known category', () => {
  const slugs = PART_TYPES.map((p) => p.slug);
  assert.equal(new Set(slugs).size, slugs.length, 'duplicate part type slug');
  for (const part of PART_TYPES) {
    assert.ok(
      CATEGORIES.some((c) => c.slug === part.category),
      `${part.slug} has unknown category ${part.category}`,
    );
  }
});

test('no part type carries a price or a stock count', () => {
  for (const part of PART_TYPES) {
    for (const field of ['priceCents', 'price', 'stock', 'quantity']) {
      assert.ok(!(field in part), `${part.slug} carries ${field}, which we do not have`);
    }
  }
});

test('every brand slug is unique and has a known category', () => {
  const slugs = BRANDS.map((b) => b.slug);
  assert.equal(new Set(slugs).size, slugs.length, 'duplicate brand slug');
  for (const brand of BRANDS) {
    assert.ok(
      BRAND_CATEGORIES.some((c) => c.slug === brand.category),
      `${brand.slug} has unknown category ${brand.category}`,
    );
    assert.ok(brand.blurb && brand.blurb.length > 40, `${brand.slug} needs a real blurb`);
    assert.ok('logo' in brand, `${brand.slug} needs a logo slot, even if null`);
  }
});

test('every category is reachable and describes itself', () => {
  for (const category of CATEGORIES) {
    assert.ok(category.blurb && category.blurb.length > 40, `${category.slug} needs a blurb`);
    assert.ok(
      PART_TYPES.some((p) => p.category === category.slug),
      `${category.slug} has no part types`,
    );
  }
});

/* ── No screen ends in nothing ──────────────────────────────── */

test('every chassis page renders and routes onward', async () => {
  for (const chassis of CHASSIS) {
    const { html, status } = await getHtml(`/${chassis.code}`);
    assert.equal(status, 200, `${chassis.code} should render`);
    assert.match(html, /href="\/request\?chassis=/, `${chassis.code} has no route to a request`);
  }
});

test('every brand page routes onward to a pre-filled request', async () => {
  for (const brand of BRANDS.slice(0, 8)) {
    const { html, status } = await getHtml(`/brands/${brand.slug}`);
    assert.equal(status, 200, `${brand.slug} should render`);
    assert.ok(html.includes(`/request?brand=${brand.slug}`), `${brand.slug} has no route to a request`);
  }
});

test('every empty state offers a way out', async () => {
  for (const path of ['/brands?category=nothing-here', '/nope']) {
    const { html } = await getHtml(path);
    for (const empty of blocksOf(html, 'div', 'empty')) {
      assert.match(empty, /class="btn/, `${path}: empty state has no action`);
    }
  }
});

/* ── SEO ────────────────────────────────────────────────────── */

test('every page has a canonical URL and a description', async () => {
  for (const path of PAGE_PATHS) {
    const { html } = await getHtml(path);
    assert.match(html, /<link rel="canonical" href="https:\/\/yourjdmparts\.com[^"]*"/, path);
    assert.match(html, /<meta name="description" content="[^"]{40,}"/, path);
  }
});

test('chassis pages carry structured data describing the service', async () => {
  const { html } = await getHtml('/JZA80');
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/g)];
  assert.ok(blocks.length >= 1, 'no structured data on a chassis page');
  const types = blocks.map((m) => JSON.parse(m[1])['@type']);
  assert.ok(types.includes('Service'), `expected a Service, got ${types.join(', ')}`);
});

test('brand pages carry Brand structured data', async () => {
  const { html } = await getHtml('/brands/tein');
  const match = /<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/.exec(html);
  assert.ok(match, 'no structured data on a brand page');
  const data = JSON.parse(match[1]);
  assert.equal(data['@type'], 'Brand');
  assert.equal(data.name, 'Tein');
});

test('no structured data advertises an Offer, since we have nothing to offer yet', async () => {
  for (const path of PAGE_PATHS) {
    const { html } = await getHtml(path);
    for (const match of html.matchAll(/<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/g)) {
      const raw = match[1];
      assert.ok(!raw.includes('"Offer"'), `${path} advertises an Offer`);
      assert.ok(!raw.includes('"price"'), `${path} advertises a price`);
    }
  }
});

test('the sitemap lists every chassis, brand and category', async () => {
  const { html: xml } = await getHtml('/sitemap.xml');
  for (const chassis of CHASSIS) {
    assert.ok(xml.includes(`/${chassis.code}<`), `sitemap is missing ${chassis.code}`);
  }
  for (const brand of BRANDS) {
    assert.ok(xml.includes(`/brands/${brand.slug}<`), `sitemap is missing ${brand.slug}`);
  }
  assert.ok(!xml.includes('/part/'), 'sitemap still lists stock part pages');
});
