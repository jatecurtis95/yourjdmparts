import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { getHtml, PAGE_PATHS, textOf } from './helpers.mjs';
import { SITE, LEGAL, hasLegalIdentity } from '../src/config.js';

/**
 * One business, one name, one set of contact details.
 *
 * The site was rebranded from a previous name, and the email and social
 * handle were left behind on a domain that no longer resolves — so the
 * published address bounced. These hold the rebrand complete.
 */

const ROOT = new URL('../', import.meta.url).pathname;
const SKIP_DIRS = new Set(['.git', 'node_modules', '.wrangler', 'dist']);

function trackedFiles(dir = ROOT, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) trackedFiles(path, out);
    else if (statSync(path).size < 2_000_000) out.push(path);
  }
  return out;
}

// Assembled from fragments so this file is not itself a match — otherwise
// the check can never reach zero and stops meaning anything.
const OLD = ['jdm', 'bri', 'dge'];
const OLD_BRAND = new RegExp(`${OLD[0]}[\\s_-]?${OLD[1]}${OLD[2]}`, 'i');
/** The old domain, likewise never written out in full here. */
const OLD_DOMAIN = new RegExp(`${OLD[0]}${OLD[1]}${OLD[2]}`, 'i');

test('the old brand name appears nowhere in the repository', () => {
  const offenders = [];
  for (const path of trackedFiles()) {
    if (!/\.(js|mjs|css|html|md|json|toml|yml|yaml|svg|txt)$/.test(path)) continue;
    // package-lock hashes are base64 and can contain anything.
    if (path.endsWith('package-lock.json')) continue;
    const source = readFileSync(path, 'utf8');
    if (OLD_BRAND.test(source)) {
      // The migration note in content/column.js documents which entry was
      // deliberately not carried over, and must name the old URL to do it.
      offenders.push(path.replace(ROOT, ''));
    }
  }
  assert.deepEqual(offenders, [], 'these files still carry the previous brand name');
});

test('no rendered page mentions the old brand', async () => {
  for (const path of [...PAGE_PATHS, '/about', '/privacy', '/terms', '/column']) {
    const { html } = await getHtml(path);
    assert.doesNotMatch(textOf(html), OLD_BRAND, `${path} still says the old name`);
    assert.doesNotMatch(html, OLD_DOMAIN, `${path} still links to the old domain`);
  }
});

test('the published email is on the brand domain', async () => {
  assert.match(SITE.email, /@yourjdmparts\.com$/);
  const { html } = await getHtml('/contact');
  assert.match(html, new RegExp(`mailto:${SITE.email.replace('.', '\\.')}`));
});

test('every page reaches the contact details and the policies', async () => {
  for (const path of ['/', '/request', '/JZA80']) {
    const { html } = await getHtml(path);
    for (const href of ['/privacy', '/terms', '/shipping-and-returns', '/about', `mailto:${SITE.email}`]) {
      assert.ok(html.includes(`href="${href}"`), `${path} has no link to ${href}`);
    }
  }
});

test('legal identity is printed only when it is actually known', async () => {
  const { html } = await getHtml('/contact');
  if (hasLegalIdentity()) {
    assert.ok(html.includes(LEGAL.abn), 'a known ABN must be shown');
  } else {
    // The one thing that must never happen: a placeholder shipped as fact.
    assert.doesNotMatch(html, /ABN[:\s]*(TBC|pending|xxx|—|\d{2}\s?\d{3}\s?\d{3}\s?\d{3})/i);
    assert.doesNotMatch(textOf(html), /registered name/i);
  }
});

test('the phone number is one number in two formats', async () => {
  assert.equal(SITE.phoneIntl.replace(/^\+61/, '0'), SITE.phone.replace(/\s/g, ''));
  const { html } = await getHtml('/contact');
  assert.ok(html.includes(`tel:${SITE.phoneIntl}`));
});
