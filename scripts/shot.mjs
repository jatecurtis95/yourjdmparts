/**
 * Screenshot a URL and report any console errors.
 *   node scripts/shot.mjs <url> <outfile> [width] [height]
 *
 * Uses the Chromium already present in the image rather than downloading one,
 * so it works in a sandbox with no browser-CDN access.
 */
import { chromium } from '@playwright/test';
import { existsSync } from 'node:fs';

const CANDIDATES = [
  process.env.CHROMIUM_PATH,
  '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  '/opt/pw-browsers/chromium/chrome-linux/chrome',
  '/usr/bin/chromium',
  '/usr/bin/google-chrome',
].filter(Boolean);

export function findChromium() {
  return CANDIDATES.find((p) => existsSync(p)) ?? null;
}

export async function launch() {
  const executablePath = findChromium();
  return chromium.launch(executablePath ? { executablePath } : {});
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [url, out, w = '1280', h = '900'] = process.argv.slice(2);
  const browser = await launch();
  const page = await browser.newPage({ viewport: { width: +w, height: +h } });
  const errors = [];
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.screenshot({ path: out, fullPage: true });
  await browser.close();
  console.log(errors.length ? 'CONSOLE ERRORS:\n' + errors.join('\n') : 'no console errors');
}
