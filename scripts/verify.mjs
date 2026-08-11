/**
 * Launch checks a unit test cannot make.
 *
 * Boots `wrangler dev` and drives a real browser through the things that
 * only exist once the CSS, the JavaScript and the server agree:
 *
 *   1. every internal link resolves, and every image actually loads
 *   2. interactive targets meet the 44px minimum on a phone
 *   3. keyboard focus is visible and reaches the primary action
 *   4. the request form works with JavaScript and, separately, without it
 *   5. server-side rejection returns the visitor to the field at fault
 *   6. the measurement events fire, and carry nothing a customer typed
 *
 * Exits non-zero on the first failure.
 *
 *   node scripts/verify.mjs [--shots <dir>]
 */
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';
import { mkdirSync } from 'node:fs';
import { launch } from './shot.mjs';

const PORT = Number(process.env.QA_PORT ?? 8790);
const BASE = `http://127.0.0.1:${PORT}`;
const shotDir = process.argv.includes('--shots')
  ? process.argv[process.argv.indexOf('--shots') + 1]
  : null;

const PAGES = [
  '/', '/about', '/how-it-works', '/privacy', '/terms', '/shipping-and-returns',
  '/column', '/column/searching-all-of-japan', '/contact', '/request',
  '/what-we-source', '/brands', '/JZA80',
];

const failures = [];
const note = (ok, message) => {
  if (ok) console.log(`  ok    ${message}`);
  else {
    console.log(`  FAIL  ${message}`);
    failures.push(message);
  }
};

async function waitForServer(timeoutMs = 90_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      if ((await fetch(BASE + '/', { signal: AbortSignal.timeout(2000) })).ok) return;
    } catch {
      /* not up yet */
    }
    await sleep(500);
  }
  throw new Error('wrangler dev did not come up');
}

const server = spawn(
  'npx',
  ['wrangler', 'dev', '--port', String(PORT), '--local', '--log-level', 'error'],
  { stdio: 'ignore' },
);

let browser;
try {
  await waitForServer();
  browser = await launch();

  /* ── 1. Links and images ──────────────────────────────────── */

  console.log('\nInternal links and images');
  const seen = new Map();
  const missingImages = [];
  {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    for (const path of PAGES) {
      await page.goto(BASE + path, { waitUntil: 'networkidle' });

      for (const href of await page.$$eval('a[href]', (as) => as.map((a) => a.getAttribute('href')))) {
        if (!href || !href.startsWith('/')) continue;
        const url = href.split('#')[0];
        if (!url || seen.has(url)) continue;
        const response = await fetch(BASE + url, { redirect: 'manual' });
        seen.set(url, response.status);
      }

      const broken = await page.$$eval('img', (imgs) =>
        imgs.filter((i) => !i.complete || i.naturalWidth === 0).map((i) => i.getAttribute('src')),
      );
      for (const src of broken) missingImages.push(`${path} -> ${src}`);

      if (shotDir) {
        mkdirSync(shotDir, { recursive: true });
        const name = path === '/' ? 'home' : path.slice(1).replace(/\//g, '-');
        await page.screenshot({ path: `${shotDir}/${name}.png`, fullPage: true });
      }
    }
    await page.close();
  }

  const deadLinks = [...seen].filter(([, status]) => status >= 400);
  note(deadLinks.length === 0, `${seen.size} internal links resolve` +
    (deadLinks.length ? ` — dead: ${deadLinks.map(([u, s]) => `${u} (${s})`).join(', ')}` : ''));
  note(missingImages.length === 0, `every image loads` +
    (missingImages.length ? ` — missing: ${missingImages.join(', ')}` : ''));

  /* ── 2. Touch targets at phone width ──────────────────────── */

  console.log('\nTouch targets at 375px');
  {
    const page = await browser.newPage({ viewport: { width: 375, height: 800 }, isMobile: true });
    const small = [];
    for (const path of PAGES) {
      await page.goto(BASE + path, { waitUntil: 'networkidle' });
      const undersized = await page.$$eval(
        'a[href], button, summary, input[type="checkbox"], label.checkbox',
        (els) =>
          els
            .filter((el) => {
              const style = getComputedStyle(el);
              if (style.display === 'none' || style.visibility === 'hidden') return false;

              // A "stretched" link paints an absolutely-positioned ::after
              // over its positioned ancestor, so the real target is that
              // ancestor's box, not the text's. Measuring the text would
              // report a card-sized target as 30px.
              const after = getComputedStyle(el, '::after');
              const stretched =
                after.content !== 'none' &&
                after.position === 'absolute' &&
                after.top === '0px' &&
                after.bottom === '0px';
              const box = stretched && el.offsetParent ? el.offsetParent : el;

              const r = box.getBoundingClientRect();
              if (r.width === 0 && r.height === 0) return false;
              // A link inside running text is a word, not a thumb target;
              // holding those to 44px would mean 44px-tall sentences. Nav
              // lists are the opposite — a footer column of links is exactly
              // where a thumb goes — so `li` alone is not an exemption.
              const inProse = el.closest(
                'p, dd, figcaption, .prose, .muted, .lede, .notice, .quote__cite, .fieldset__intro',
              );
              if (el.tagName === 'A' && inProse) return false;
              return r.height < 44;
            })
            .map((el) => {
              const id = el.getAttribute('href') ?? el.textContent.trim().slice(0, 24) ?? '';
              const cls = el.getAttribute('class') || '-';
              return `${el.tagName.toLowerCase()} [${cls}] ${id}: ${Math.round(el.getBoundingClientRect().height)}px`;
            }),
      );
      for (const item of new Set(undersized)) small.push(`${path} ${item}`);
    }
    await page.close();
    note(small.length === 0, `all interactive targets ≥44px tall` +
      (small.length ? `\n        ${[...new Set(small)].slice(0, 12).join('\n        ')}` : ''));
  }

  /* ── 3. Keyboard focus ────────────────────────────────────── */

  console.log('\nKeyboard');
  {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await page.goto(BASE + '/', { waitUntil: 'networkidle' });

    await page.keyboard.press('Tab');
    const first = await page.evaluate(() => document.activeElement?.className ?? '');
    note(first.includes('skip-link'), `first Tab reaches the skip link (got "${first}")`);

    const ring = await page.evaluate(() => {
      const el = document.activeElement;
      const s = getComputedStyle(el);
      return { width: s.outlineWidth, style: s.outlineStyle, color: s.outlineColor };
    });
    note(
      ring.style !== 'none' && parseFloat(ring.width) > 0,
      `focus ring is visible (${ring.width} ${ring.style} ${ring.color})`,
    );

    // Tab through the header and confirm the primary action is reachable.
    let reachedCta = false;
    for (let i = 0; i < 25 && !reachedCta; i++) {
      await page.keyboard.press('Tab');
      reachedCta = await page.evaluate(
        () => document.activeElement?.getAttribute('href') === '/request',
      );
    }
    note(reachedCta, 'the quote action is reachable by keyboard alone');
    await page.close();
  }

  /* ── 4. The form, with JavaScript and without ─────────────── */

  console.log('\nRequest form with JavaScript');
  {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    const events = [];
    await page.goto(BASE + '/request', { waitUntil: 'networkidle' });
    await page.evaluate(() => {
      window.__events = [];
      document.addEventListener('yjp:event', (e) => window.__events.push(e.detail));
    });

    const steps = await page.$$eval('[data-step]', (s) => s.length);
    const visible = await page.$$eval('[data-step]', (s) => s.filter((el) => !el.hidden).length);
    note(steps === 3 && visible === 1, `three steps, one shown (${steps} steps, ${visible} visible)`);

    await page.selectOption('[name="make"]', 'Toyota');
    await page.fill('[name="model"]', 'Supra');
    await page.click('button:has-text("Next")');
    await sleep(150);
    const onStep2 = await page.evaluate(
      () => document.querySelectorAll('[data-step]')[1]?.hidden === false,
    );
    note(onStep2, 'Next advances to step two');

    events.push(...(await page.evaluate(() => window.__events)));
    const names = events.map((e) => e.name);
    note(names.includes('quote_form_started'), 'quote_form_started fired on first input');
    note(names.includes('quote_step_viewed'), 'quote_step_viewed fired');

    const leaked = events.filter((e) =>
      JSON.stringify(e.params).match(/Toyota|Supra|1997/i),
    );
    note(leaked.length === 0, `no typed value appears in any event payload`);

    const cookies = await page.context().cookies();
    note(cookies.length === 0, `no cookies set (${cookies.length})`);
    await page.close();
  }

  console.log('\nRequest form with JavaScript disabled');
  {
    const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1280, height: 900 } });
    const page = await context.newPage();
    await page.goto(BASE + '/request', { waitUntil: 'domcontentloaded' });

    const hidden = await page.$$eval('[data-step]', (s) => s.filter((el) => el.hidden).length);
    note(hidden === 0, `every step is visible without JavaScript (${hidden} hidden)`);

    const submits = await page.$$eval('button[type="submit"]', (b) => b.length);
    note(submits >= 1, `the form can still be submitted (${submits} submit button)`);

    await page.selectOption('[name="make"]', 'Toyota');
    await page.fill('[name="model"]', 'Supra');
    await page.fill('[name="name"]', 'Test Person');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="parts[0][description]"]', 'Right-hand front guard');
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
      page.click('button[type="submit"]'),
    ]);
    const received = await page.locator('[data-quote-success]').count();
    note(received === 1, 'a no-JavaScript submission reaches the success page');
    await context.close();
  }

  /* ── 5. Server-side rejection ─────────────────────────────── */

  console.log('\nServer-side validation');
  {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await page.goto(BASE + '/request', { waitUntil: 'networkidle' });

    // Force the server to be the one that rejects this. The browser's own
    // required checks are switched off, and every step is revealed, so the
    // submission goes up incomplete exactly as it would from a client that
    // never ran the step script at all.
    await page.evaluate(() => {
      const form = document.querySelector('[data-request-form]');
      form.setAttribute('novalidate', '');
      form.querySelectorAll('[data-step]').forEach((step) => {
        step.hidden = false;
      });
    });
    await page.selectOption('[name="make"]', 'Toyota');
    await page.fill('[name="model"]', 'Supra');
    await page.fill('[name="parts[0][description]"]', 'Front guard');
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle' }),
      page.click('button[type="submit"]'),
    ]);

    const errors = await page.locator('.field__error').count();
    note(errors > 0, `the server rejects a missing contact detail (${errors} field errors)`);

    const keptMake = await page.inputValue('[name="make"]');
    note(keptMake === 'Toyota', 'what was typed survives the rejection');

    const openStep = await page.evaluate(() => {
      const steps = [...document.querySelectorAll('[data-step]')];
      const shown = steps.findIndex((s) => !s.hidden);
      return { shown, title: steps[shown]?.getAttribute('data-step-title') };
    });
    note(openStep.title === 'Your details', `the step holding the error is opened (${openStep.title})`);
    await page.close();
  }

  console.log(
    failures.length
      ? `\n${failures.length} check(s) failed.`
      : '\nAll launch checks passed.',
  );
} finally {
  await browser?.close();
  server.kill('SIGTERM');
}

process.exit(failures.length ? 1 : 0);
