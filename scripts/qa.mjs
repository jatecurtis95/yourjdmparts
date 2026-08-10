/**
 * Browser checks against a real Worker.
 *
 * Boots `wrangler dev`, then for every route asserts the two things the
 * definition of done calls for and that no unit test can see:
 *   - zero console errors
 *   - no horizontal overflow at any width
 *
 * Exits non-zero on the first failure so CI fails loudly.
 */
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';
import { launch } from './shot.mjs';

const PORT = Number(process.env.QA_PORT ?? 8788);
const BASE = `http://127.0.0.1:${PORT}`;
const WIDTHS = [1440, 1280, 900, 768, 375, 320];

/** `status` is the expected status of the document itself. */
const ROUTES = [
  { path: '/' },
  { path: '/what-we-source' },
  { path: '/what-we-source?category=engine' },
  { path: '/what-we-source?category=wheels&chassis=BNR34' },
  { path: '/brands' },
  { path: '/brands?category=suspension' },
  { path: '/brands/tein' },
  { path: '/brands/nismo' },
  { path: '/JZA80' },
  { path: '/BNR34' },
  { path: '/request' },
  { path: '/request?chassis=JZA80&part=coilovers' },
  { path: '/request?brand=tein' },
  { path: '/how-it-works' },
  // The 404 page is supposed to 404. Its document status is not a defect,
  // but a missing stylesheet or font on it still would be.
  { path: '/no-such-page', status: 404 },
];

async function waitForServer(timeoutMs = 90_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(BASE + '/', { signal: AbortSignal.timeout(2000) });
      if (response.ok) return;
    } catch {
      /* not up yet */
    }
    await sleep(500);
  }
  throw new Error(`wrangler dev did not come up on ${BASE}`);
}

const server = spawn(
  'npx',
  ['wrangler', 'dev', '--port', String(PORT), '--local', '--ip', '127.0.0.1'],
  { stdio: ['ignore', 'pipe', 'pipe'] },
);

let serverLog = '';
server.stdout.on('data', (chunk) => (serverLog += chunk));
server.stderr.on('data', (chunk) => (serverLog += chunk));

const failures = [];

try {
  await waitForServer();

  const browser = await launch();

  for (const { path: route, status: expectedStatus = 200 } of ROUTES) {
    const consoleErrors = [];
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    const documentUrl = BASE + route;

    page.on('console', (message) => {
      if (message.type() !== 'error') return;
      // Chromium logs the document's own non-2xx status as a console error.
      // Where that status is the intended one, it is not a defect.
      const isExpectedDocumentStatus =
        expectedStatus >= 400 && message.text().includes(`status of ${expectedStatus}`);
      if (!isExpectedDocumentStatus) consoleErrors.push(message.text());
    });
    page.on('pageerror', (error) => consoleErrors.push('pageerror: ' + error.message));
    page.on('response', (response) => {
      // A subresource that fails is always a bug, even on the 404 page.
      if (response.status() >= 400 && response.url() !== documentUrl) {
        consoleErrors.push(`${response.status()} ${response.url()}`);
      }
    });

    const response = await page.goto(documentUrl, { waitUntil: 'networkidle' });
    if (response && response.status() !== expectedStatus) {
      failures.push(`${route} returned ${response.status()}, expected ${expectedStatus}`);
    }

    for (const width of WIDTHS) {
      await page.setViewportSize({ width, height: 900 });
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      );
      if (overflow > 0) {
        failures.push(`${route} @ ${width}px overflows horizontally by ${overflow}px`);
      }
    }

    if (consoleErrors.length) {
      failures.push(`${route} console: ${consoleErrors.join(' | ')}`);
    }

    await page.close();
    process.stdout.write(failures.length ? 'x' : '.');
  }

  await browser.close();
  process.stdout.write('\n');
} catch (error) {
  failures.push(String(error && error.message ? error.message : error));
  if (serverLog) console.error(serverLog.slice(-2000));
} finally {
  server.kill('SIGTERM');
}

if (failures.length) {
  console.error('\nQA failed:\n' + failures.map((f) => '  - ' + f).join('\n'));
  process.exit(1);
}

console.log(`QA passed: ${ROUTES.length} routes × ${WIDTHS.length} widths, no console errors, no overflow.`);
process.exit(0);
