import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { getHtml, PAGE_PATHS } from './helpers.mjs';

/**
 * The privacy policy makes two falsifiable claims about this site:
 * that it sets no cookies, and that it loads no third-party script.
 *
 * A policy that says so while a tag creeps in later is worse than no
 * policy at all, so these hold the claims to the actual output. If one
 * of them fails, the honest fix is to change the policy — or to not add
 * the tag.
 */

const APP_JS = readFileSync(new URL('../public/assets/app.js', import.meta.url).pathname, 'utf8');

const TRUST_PATHS = ['/privacy', '/terms', '/shipping-and-returns', '/about', '/column'];

test('no page loads a script or stylesheet from another origin', async () => {
  for (const path of [...PAGE_PATHS, ...TRUST_PATHS]) {
    const { html } = await getHtml(path);
    for (const [, url] of html.matchAll(/<script[^>]+src="([^"]+)"/g)) {
      assert.ok(url.startsWith('/'), `${path} loads an off-origin script: ${url}`);
    }
    for (const [, url] of html.matchAll(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"/g)) {
      assert.ok(url.startsWith('/'), `${path} loads an off-origin stylesheet: ${url}`);
    }
    for (const [, url] of html.matchAll(/<link[^>]+rel="preload"[^>]+href="([^"]+)"/g)) {
      assert.ok(url.startsWith('/'), `${path} preloads an off-origin asset: ${url}`);
    }
  }
});

test('nothing sets a cookie or persists to storage', () => {
  assert.doesNotMatch(APP_JS, /document\.cookie/);
  assert.doesNotMatch(APP_JS, /localStorage|sessionStorage|indexedDB/);
});

test('no third-party analytics or advertising tag is present', async () => {
  const vendors = /gtag\(|googletagmanager|google-analytics|fbq\(|connect\.facebook|hotjar|clarity\.ms|segment\.com|mixpanel|plausible|matomo/i;
  assert.doesNotMatch(APP_JS, vendors);
  for (const path of ['/', '/request', '/privacy']) {
    const { html } = await getHtml(path);
    assert.doesNotMatch(html, vendors, `${path} carries a third-party tag`);
  }
});

test('the client never sends a request of its own', () => {
  // No beacon, no fetch, no image pixel. Events are announced in-page and
  // buffered; shipping them anywhere is a separate, deliberate decision.
  assert.doesNotMatch(APP_JS, /sendBeacon|XMLHttpRequest|new Image\(/);
  assert.doesNotMatch(APP_JS, /\bfetch\s*\(/);
});
