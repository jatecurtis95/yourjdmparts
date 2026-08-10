import { test } from 'node:test';
import assert from 'node:assert/strict';
import { route } from '../src/worker.js';
import { getHtml, getStatus, ORIGIN, PAGE_PATHS } from './helpers.mjs';
import { escapeHtml, html, render, raw } from '../src/html.js';
import { BRANDS } from '../src/data/brands.js';
import { PART_TYPES } from '../src/data/catalogue.js';

test('every page route renders', async () => {
  for (const path of PAGE_PATHS) {
    assert.equal(await getStatus(path), 200, path);
  }
});

test('unknown pages, brands and chassis 404', async () => {
  assert.equal(await getStatus('/no-such-page'), 404);
  assert.equal(await getStatus('/brands/no-such-brand'), 404);
  assert.equal(await getStatus('/ZZZ99'), 404);
});

test('a lowercase chassis code redirects to the canonical uppercase form', async () => {
  const response = await route(new Request(ORIGIN + '/jza80'));
  assert.equal(response.status, 301);
  assert.equal(response.headers.get('location'), ORIGIN + '/JZA80');
});

/* ── Nothing that was ever linked is allowed to 404 ─────────── */

test('the stock-era paths redirect rather than dying', async () => {
  const cases = [
    ['/catalogue', '/what-we-source'],
    ['/order', '/request'],
    ['/shop', '/what-we-source'],
    ['/part/anything-at-all', '/what-we-source'],
  ];
  for (const [from, to] of cases) {
    const response = await route(new Request(ORIGIN + from));
    assert.equal(response.status, 301, `${from} should redirect`);
    assert.equal(response.headers.get('location'), ORIGIN + to, from);
  }
});

test('a redirected catalogue filter keeps the filter', async () => {
  const response = await route(new Request(ORIGIN + '/catalogue?category=engine&sort=price-asc'));
  assert.equal(response.status, 301);
  const location = new URL(response.headers.get('location'));
  assert.equal(location.pathname, '/what-we-source');
  assert.equal(location.searchParams.get('category'), 'engine');
  assert.equal(location.searchParams.get('sort'), null, 'sorting by price is meaningless now');
});

test('a trailing slash resolves to the same page', async () => {
  assert.equal(await getStatus('/what-we-source/'), 200);
  assert.equal(await getStatus('/'), 200);
});

/* ── Browse ─────────────────────────────────────────────────── */

test('the category filter narrows what we source', async () => {
  const all = await getHtml('/what-we-source');
  const filtered = await getHtml('/what-we-source?category=wheels');
  const count = (s) => (s.match(/class="source-card"/g) ?? []).length;
  assert.equal(count(all.html), PART_TYPES.length);
  assert.ok(count(filtered.html) > 0 && count(filtered.html) < count(all.html));
});

test('the brand filter narrows the brand list', async () => {
  const all = await getHtml('/brands');
  const filtered = await getHtml('/brands?category=wheels');
  const count = (s) => (s.match(/class="brand-card"/g) ?? []).length;
  assert.equal(count(all.html), BRANDS.length);
  assert.ok(count(filtered.html) > 0 && count(filtered.html) < count(all.html));
});

test('a part type links to a request carrying the chassis and the part', async () => {
  const { html: body } = await getHtml('/what-we-source?chassis=JZA80');
  assert.match(body, /\/request\?chassis=JZA80&amp;part=/);
});

test('POST to a page route is rejected rather than rendered', async () => {
  assert.equal(await getStatus('/what-we-source', { method: 'POST' }), 405);
});

test('sitemap and robots serve the right content types', async () => {
  const sitemap = await route(new Request(ORIGIN + '/sitemap.xml'));
  assert.match(sitemap.headers.get('content-type'), /application\/xml/);
  const robots = await route(new Request(ORIGIN + '/robots.txt'));
  assert.match(robots.headers.get('content-type'), /text\/plain/);
  assert.match(await robots.text(), /Sitemap: https:\/\/yourjdmparts\.com\/sitemap\.xml/);
});

test('pages are served with nosniff', async () => {
  const response = await route(new Request(ORIGIN + '/'));
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
});

/* ── Templating safety ──────────────────────────────────────── */

test('interpolated values are escaped', () => {
  const evil = '<script>alert(1)</script>';
  assert.equal(escapeHtml(evil), '&lt;script&gt;alert(1)&lt;/script&gt;');
  assert.ok(!render(html`<p>${evil}</p>`).includes('<script>'));
});

test('raw() opts a value out of escaping deliberately', () => {
  assert.equal(render(html`<p>${raw('<b>ok</b>')}</p>`), '<p><b>ok</b></p>');
});

test('arrays interpolate without separators', () => {
  assert.equal(render(html`${[1, 2, 3]}`), '123');
});

test('null, undefined and false render as nothing', () => {
  assert.equal(render(html`${null}${undefined}${false}`), '');
});

test('a hostile query string cannot break out of an attribute', async () => {
  const { html: body } = await getHtml('/what-we-source?category=' + encodeURIComponent('"><script>x</script>'));
  assert.ok(!body.includes('<script>x</script>'));
});

test('structured data cannot break out of its script tag', async () => {
  const { html: body } = await getHtml('/JZA80');
  for (const match of body.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    assert.ok(!match[1].includes('</script'), 'ld+json must not contain a closing script tag');
  }
});
