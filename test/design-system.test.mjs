import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { getHtml, PAGE_PATHS, blocksOf } from './helpers.mjs';
import { ToriiMark } from '../src/components/logo.js';
import { render } from '../src/html.js';

const ASSETS = new URL('../public/assets/', import.meta.url).pathname;
const SRC = new URL('../src/', import.meta.url).pathname;

const tokens = readFileSync(join(ASSETS, 'tokens.css'), 'utf8');
const styles = readFileSync(join(ASSETS, 'styles.css'), 'utf8');

/* ── Colour ─────────────────────────────────────────────────── */

test('the palette is exactly five colours', () => {
  const hexes = [...tokens.matchAll(/#[0-9A-Fa-f]{6}\b/g)].map((m) => m[0].toUpperCase());
  assert.deepEqual(
    [...new Set(hexes)].sort(),
    ['#0B1624', '#16335E', '#C8A44D', '#F55A14', '#FBF3E7'],
    'tokens.css must define the five palette colours and no others',
  );
});

test('no hex value appears outside tokens.css', () => {
  const offenders = [];

  const hexRe = /#[0-9A-Fa-f]{3,8}\b|%23[0-9A-Fa-f]{3,8}\b/g;
  if (hexRe.test(styles)) offenders.push('public/assets/styles.css');

  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) walk(path);
      else if (entry.name.endsWith('.js')) {
        const source = readFileSync(path, 'utf8');
        // logo.js legitimately emits standalone SVG files for the favicon,
        // which cannot reference CSS custom properties.
        if (entry.name === 'logo.js') continue;
        for (const match of source.matchAll(/#[0-9A-Fa-f]{6}\b/g)) {
          offenders.push(`${path}: ${match[0]}`);
        }
      }
    }
  };
  walk(SRC);

  assert.deepEqual(offenders, [], 'colour must come from a token, never a literal');
});

test('gold is never set directly against orange', () => {
  // Look for any rule that pairs a gold background with a sunrise
  // foreground, or the reverse.
  const rules = styles.split('}');
  const bad = rules.filter((rule) => {
    const hasGoldBg = /background(-color)?:\s*var\(--gold/.test(rule);
    const hasSunriseBg = /background(-color)?:\s*var\(--sunrise/.test(rule);
    const hasGoldFg = /(?<!background-)color:\s*var\(--gold/.test(rule);
    const hasSunriseFg = /(?<!background-)color:\s*var\(--sunrise/.test(rule);
    const hasGoldBorder = /border(-[a-z]+)?-color:\s*var\(--gold/.test(rule);
    return (
      (hasGoldBg && (hasSunriseFg || /border[^:]*:\s*[^;]*var\(--sunrise/.test(rule))) ||
      (hasSunriseBg && (hasGoldFg || hasGoldBorder))
    );
  });
  assert.deepEqual(bad, [], 'gold must never sit directly against orange');
});

test('type on a Sunrise fill is Midnight, not Bone', () => {
  // Bone on Sunrise is 3.00:1, which fails. Midnight on Sunrise is 5.57:1.
  assert.match(tokens, /--text-on-sunrise:\s*var\(--midnight\)/);
  assert.match(styles, /\.btn--sunrise\s*\{[^}]*color:\s*var\(--text-on-sunrise\)/);
});

/* ── Flatness ───────────────────────────────────────────────── */

test('nothing is gradiented, bevelled or textured', () => {
  assert.doesNotMatch(styles, /linear-gradient|radial-gradient|conic-gradient/);
  assert.doesNotMatch(styles, /text-shadow/);
  assert.doesNotMatch(styles, /filter:\s*drop-shadow/);
});

test('the modal carries the only shadow in the system', () => {
  const shadows = [...styles.matchAll(/box-shadow:\s*([^;]+);/g)].map((m) => m[1].trim());
  assert.deepEqual(shadows, ['var(--shadow-modal)'], 'only the dialog may have a shadow');
  const dialogRule = styles.slice(styles.indexOf('.dialog {'));
  assert.match(dialogRule.slice(0, 400), /box-shadow:\s*var\(--shadow-modal\)/);
});

/* ── Motion ─────────────────────────────────────────────────── */

test('the chassis ticker is the only keyframe animation, and it is guarded', () => {
  const keyframes = [...styles.matchAll(/@keyframes\s+([\w-]+)/g)].map((m) => m[1]);
  assert.deepEqual(keyframes, ['ticker-scroll']);
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\)/);
  const guard = styles.slice(styles.indexOf('@media (prefers-reduced-motion: reduce)'));
  assert.match(guard.slice(0, 400), /\.ticker__track\s*\{\s*animation:\s*none/);
});

test('transitions are 180ms and touch only colour and opacity', () => {
  assert.match(tokens, /--motion:\s*180ms/);
  const transition = /--transition:\s*([^;]+);/.exec(tokens)[1];
  for (const property of transition.split(',').map((s) => s.trim().split(/\s+/)[0])) {
    assert.ok(
      ['color', 'background-color', 'border-color', 'opacity'].includes(property),
      `${property} may not be transitioned`,
    );
  }
});

/* ── Pattern placement ──────────────────────────────────────── */

test('the pattern layer never sits behind a listing', async () => {
  // Footers and page headers are permitted surfaces, so scope this to the
  // listing itself rather than counting patterns across the whole document.
  for (const path of ['/what-we-source', '/brands', '/JZA80', '/']) {
    const { html } = await getHtml(path);
    assert.ok(
      html.includes('source-card') || html.includes('brand-card') || html.includes('brand-chip'),
      `${path} should be showing a listing`,
    );

    for (const grid of blocksOf(html, 'div', 'grid')) {
      assert.ok(!grid.includes('class="pattern"'), `${path}: pattern found behind a grid`);
    }
    for (const region of blocksOf(html, 'div', 'catalogue')) {
      assert.ok(!region.includes('class="pattern"'), `${path}: pattern found in the browse region`);
    }
    for (const strip of blocksOf(html, 'div', 'brand-strip')) {
      assert.ok(!strip.includes('class="pattern"'), `${path}: pattern found behind the brand strip`);
    }
  }
});

test('the pattern layer never sits behind a form', async () => {
  for (const path of ['/request', '/order']) {
    const { html } = await getHtml(path);
    for (const form of blocksOf(html, 'form', 'stack-6')) {
      assert.ok(!form.includes('class="pattern"'), `${path}: pattern found inside a form`);
    }
  }
});

test('the pattern layer never sits behind a spec table', async () => {
  const { html } = await getHtml('/part/jza80-2jz-gte-throttle-body');
  for (const table of blocksOf(html, 'table', 'spec-table')) {
    assert.ok(!table.includes('class="pattern"'));
  }
});

test('every pattern layer is a dedicated element, so opacity never touches content', () => {
  assert.match(styles, /\.pattern\s*\{[^}]*position:\s*absolute/);
  assert.match(styles, /\.pattern\s*\{[^}]*opacity:\s*var\(--pattern-opacity\)/);
  assert.match(tokens, /--pattern-opacity:\s*0?\.06/);
  assert.match(tokens, /--pattern-size:\s*350px/);
});

/* ── Action registers ───────────────────────────────────────── */

test('at most one filled-orange action per section', async () => {
  for (const path of PAGE_PATHS) {
    const { html } = await getHtml(path);
    const sections = html.split(/<section\b/).slice(1);
    sections.forEach((section, i) => {
      const fills = (section.match(/btn--sunrise/g) ?? []).length;
      assert.ok(fills <= 1, `${path} section ${i} has ${fills} filled-orange actions`);
    });
  }
});

test('the request form spends no orange at all', async () => {
  // The form itself is a working surface, so it holds the Bone register.
  const { html } = await getHtml('/request');
  for (const form of blocksOf(html, 'form', 'stack-6')) {
    assert.ok(!form.includes('btn--sunrise'), 'the request form must not use an orange fill');
  }
});

test('scarcity is an orange outline, never a fill', () => {
  assert.match(styles, /\.badge--scarcity\s*\{[^}]*border-color:\s*var\(--sunrise\)/);
  const rule = /\.badge--scarcity\s*\{([^}]*)\}/.exec(styles)[1];
  assert.doesNotMatch(rule, /background/, 'the scarcity badge must not be filled');
});

/* ── Logo ───────────────────────────────────────────────────── */

test('the torii never renders below its 40px minimum', () => {
  for (const requested of [0, 12, 39, 40, 120]) {
    const svg = render(ToriiMark({ size: requested }));
    const width = Number(/width="(\d+)"/.exec(svg)[1]);
    assert.ok(width >= 40, `asked for ${requested}px, got ${width}px`);
  }
});

test('the mono build drops the sun rather than tinting it', () => {
  assert.doesNotMatch(render(ToriiMark({ size: 48, mono: true })), /logo__sun/);
  assert.match(render(ToriiMark({ size: 48 })), /logo__sun/);
});

test('the torii is legible at 40px in the header', async () => {
  const { html } = await getHtml('/');
  const header = html.slice(html.indexOf('<header'), html.indexOf('</header>'));
  const width = Number(/class="logo__mark"[^>]*width="(\d+)"/.exec(header)[1]);
  assert.ok(width >= 40, `header mark is ${width}px`);
});

/* ── Accessibility ──────────────────────────────────────────── */

test('the focus ring is gold and visible on every interactive element', () => {
  assert.match(styles, /:focus-visible\s*\{[^}]*outline:\s*2px solid var\(--focus-ring\)/);
  assert.match(tokens, /--focus-ring:\s*var\(--gold\)/);
});

test('hit targets are at least 44px', () => {
  assert.match(tokens, /--hit:\s*44px/);
  for (const selector of ['.btn', '.icon-btn', '.nav__link']) {
    const rule = new RegExp(`\\${selector}\\s*\\{[^}]*(min-height|height):\\s*var\\(--hit\\)`);
    assert.match(styles, rule, `${selector} must be at least 44px`);
  }
});

test('no italics anywhere in the system', () => {
  assert.doesNotMatch(styles, /font-style:\s*italic/);
  assert.match(styles, /font-style:\s*normal/);
});
