import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getHtml, textOf } from './helpers.mjs';
import { CHASSIS } from '../src/data/chassis.js';
import { BRANDS, brandsFor } from '../src/data/brands.js';
import { TRADE } from '../src/config.js';

/**
 * Chassis pages are the pages that claim "we know exactly what fits", so
 * they cannot carry another car's facts. An external audit caught two on
 * the JZA80 page: S15 grade copy in a generic category blurb, and Nismo
 * offered under "Brands we source for JZA80". These hold the fixes.
 */

/**
 * Grade, engine and platform names that belong to particular chassis
 * pages. Any of these appearing on a chassis page outside its owners is a
 * leak. Add a token when a new chassis entry introduces one.
 */
const OWNED_TOKENS = {
  'Spec-R': ['S15'],
  'Spec-S': ['S15'],
  'V-Spec': ['BNR32', 'BCNR33', 'BNR34'],
  'Type R': ['EK9', 'DC2'],
  MIVEC: ['CT9A'],
  hawkeye: ['GDB'],
  RB26: ['BNR32', 'BCNR33', 'BNR34'],
  '2JZ': ['JZA80'],
  '1JZ': ['JZX100'],
  '13B': ['FD3S'],
  '4G63': ['CT9A'],
  EJ207: ['GDB'],
  B16B: ['EK9'],
  B18C: ['DC2'],
  SR20: ['S15'],
  '4A-GE': ['AE86'],
};

test("no chassis page mentions another car's grades or engines", async () => {
  for (const chassis of CHASSIS) {
    const { html, status } = await getHtml('/' + chassis.code);
    assert.equal(status, 200, `${chassis.code} page must render`);
    const text = textOf(html);
    for (const [token, owners] of Object.entries(OWNED_TOKENS)) {
      if (owners.includes(chassis.code)) continue;
      assert.ok(
        !text.includes(token),
        `${chassis.code} page says "${token}", which belongs to ${owners.join(', ')}`,
      );
    }
  }
});

test("a marque brand never appears on another marque's chassis page", async () => {
  for (const chassis of CHASSIS) {
    const { html } = await getHtml('/' + chassis.code);
    const text = textOf(html);
    for (const brand of BRANDS) {
      if (!brand.makes || brand.makes.includes(chassis.make)) continue;
      assert.ok(
        !text.includes(brand.name),
        `${chassis.code} is a ${chassis.make}; it must not offer ${brand.name} (${brand.makes.join(', ')})`,
      );
    }
  }
});

test('brandsFor serves every make something, and nothing wrong', () => {
  for (const chassis of CHASSIS) {
    const brands = brandsFor(chassis.make);
    assert.ok(
      brands.length >= 6,
      `${chassis.make} must not end up with a thin brand strip (got ${brands.length})`,
    );
    for (const brand of brands) {
      assert.ok(
        !brand.makes || brand.makes.includes(chassis.make),
        `brandsFor(${chassis.make}) returned ${brand.name}, which serves ${brand.makes?.join(', ')}`,
      );
    }
  }
});

test('the audit case: the Supra page offers TRD and never Nismo', async () => {
  const { html } = await getHtml('/JZA80');
  const text = textOf(html);
  assert.ok(text.includes('TRD'), 'the Toyota factory brand belongs on the Supra page');
  assert.ok(!text.includes('Nismo'), "Nissan's factory brand does not");
});

test('the quote-time promise is always qualified, never absolute', async () => {
  const pages = ['/', '/request', '/how-it-works', '/JZA80', '/brands/tein', '/contact', '/about', '/terms', '/shipping-and-returns'];
  const claim = new RegExp(`within ${TRADE.quoteDays} business days`, 'gi');
  for (const path of pages) {
    const { html } = await getHtml(path);
    const text = textOf(html);
    let match;
    while ((match = claim.exec(text))) {
      const lead = text.slice(Math.max(0, match.index - 30), match.index).toLowerCase();
      assert.ok(
        lead.includes('usually') || lead.includes('aim'),
        `${path} promises "${text.slice(Math.max(0, match.index - 30), match.index + 30)}" without qualification`,
      );
    }
  }
});
