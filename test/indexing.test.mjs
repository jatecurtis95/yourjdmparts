import { test } from 'node:test';
import assert from 'node:assert/strict';
import worker from '../src/worker.js';
import { SITE } from '../src/config.js';

/**
 * Every page canonicalises to the production domain. Serving that markup
 * from anywhere else tells a crawler the real page lives at a URL that may
 * be serving something entirely different, so preview hosts must be
 * noindexed.
 *
 * Noindex, not Disallow. A crawler blocked in robots.txt never fetches the
 * page and so never reads the directive, which leaves the URL eligible for
 * a bare listing. Preview hosts therefore invite the crawl and refuse the
 * index, in the meta tag and the X-Robots-Tag header.
 */

const PREVIEW = 'https://yourjdmparts.jate-curtis.workers.dev';

const get = (origin, path) => worker.fetch(new Request(origin + path), {});

test('a preview host is noindexed', async () => {
  for (const path of ['/', '/brands', '/JZA80', '/what-we-source']) {
    const html = await get(PREVIEW, path).then((r) => r.text());
    assert.match(html, /<meta name="robots" content="noindex, nofollow"/, `${path} must be noindexed off-domain`);
  }
});

test('the production host is indexable', async () => {
  const html = await get(SITE.origin, '/').then((r) => r.text());
  assert.doesNotMatch(html, /content="noindex/, 'the real domain must be indexable');
  assert.match(html, /<link rel="canonical" href="https:\/\/yourjdmparts\.com\/"/);
});

test('robots.txt on a preview host invites the crawl and withholds the sitemap', async () => {
  const body = await get(PREVIEW, '/robots.txt').then((r) => r.text());
  assert.match(body, /Allow: \//, 'the crawler must be able to fetch the page to read the noindex');
  assert.doesNotMatch(body, /Disallow: \//);
  assert.doesNotMatch(body, /Sitemap:/, 'a preview must not advertise the production sitemap');
});

test('a preview host sends X-Robots-Tag on every response', async () => {
  // The meta tag only covers HTML pages we render. robots.txt, the sitemap
  // and the 404 need the header, and so does anything a crawler reaches
  // without parsing a body.
  for (const path of ['/', '/brands', '/robots.txt', '/sitemap.xml', '/nothing-here']) {
    const response = await get(PREVIEW, path);
    assert.equal(
      response.headers.get('x-robots-tag'),
      'noindex, nofollow',
      `${path} must carry the header off-domain`,
    );
  }
});

test('the production host sends no X-Robots-Tag', async () => {
  for (const path of ['/', '/brands', '/robots.txt', '/sitemap.xml']) {
    const response = await get(SITE.origin, path);
    assert.equal(response.headers.get('x-robots-tag'), null, `${path} must be indexable on the real domain`);
  }
});

test('robots.txt allows crawling on the production host', async () => {
  const body = await get(SITE.origin, '/robots.txt').then((r) => r.text());
  assert.match(body, /Allow: \//);
  assert.match(body, /Sitemap: https:\/\/yourjdmparts\.com\/sitemap\.xml/);
});

test('the homepage title says what the business does', async () => {
  const html = await get(SITE.origin, '/').then((r) => r.text());
  const title = /<title>([^<]*)<\/title>/.exec(html)[1];
  assert.ok(title.length > 30, `"${title}" is too thin to be a search result`);
  assert.match(title, /Japan/);
  assert.match(title, /Australia/);
});

test('the social card is a real raster image, not an SVG', async () => {
  // Facebook, LinkedIn and X all reject SVG for og:image.
  const html = await get(SITE.origin, '/').then((r) => r.text());
  const og = /<meta property="og:image" content="([^"]+)"/.exec(html)[1];
  assert.doesNotMatch(og, /\.svg$/, 'og:image must not be an SVG');
  assert.match(og, /\.(png|jpg|jpeg)$/);
  assert.match(html, /<meta property="og:image:width" content="1200"/);
});
