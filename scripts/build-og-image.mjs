/**
 * Render the social card to public/assets/og.png.
 *
 *   node scripts/build-og-image.mjs
 *
 * og:image has to be a raster file — Facebook, LinkedIn and X all reject
 * SVG — so this rasterises the design system rather than pointing at the
 * torii SVG and hoping.
 *
 * Re-run it whenever the wordmark, palette or proposition changes.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { launch } from './shot.mjs';

const ROOT = new URL('..', import.meta.url).pathname;

const tokens = readFileSync(ROOT + 'public/assets/tokens.css', 'utf8');
const fontsCss = readFileSync(ROOT + 'public/assets/fonts.css', 'utf8');

/** Inline the fonts as data URIs so the render needs no server. */
const fonts = fontsCss.replace(/url\(\/assets\/fonts\/([^)]+)\)/g, (_, file) => {
  const b64 = readFileSync(ROOT + 'public/assets/fonts/' + file).toString('base64');
  return `url(data:font/woff2;base64,${b64})`;
});

const pattern = readFileSync(ROOT + 'public/assets/pattern-seigaiha.svg').toString('base64');
const torii = readFileSync(ROOT + 'public/assets/logo/torii.svg', 'utf8');

const html = `<!doctype html>
<meta charset="utf-8">
<style>
  ${fonts}
  ${tokens}
  * { box-sizing: border-box; margin: 0; }
  body {
    width: 1200px; height: 630px; overflow: hidden;
    background: var(--ground); color: var(--text-primary);
    font-family: var(--font-ui); position: relative;
    display: flex; align-items: center; gap: 64px; padding: 72px 80px;
  }
  .pattern {
    position: absolute; inset: 0;
    background-image: url(data:image/svg+xml;base64,${pattern});
    background-size: 350px 350px; opacity: var(--pattern-opacity);
  }
  .copy { position: relative; flex: 1; }
  .eyebrow {
    font-family: var(--font-condensed); font-weight: 700; font-size: 22px;
    text-transform: uppercase; letter-spacing: var(--track-eyebrow);
    color: var(--gold); margin-bottom: 28px;
  }
  .mega {
    font-family: var(--font-condensed); font-weight: 900; font-size: 92px;
    line-height: 0.88; letter-spacing: var(--track-mega); text-transform: uppercase;
  }
  .mega span { display: block; }
  .b { color: var(--bone); }
  .s { color: var(--sunrise); }
  .o { color: transparent; -webkit-text-stroke: 2px var(--bone-24); }
  .sub {
    margin-top: 34px; font-size: 25px; color: var(--bone-62); max-width: 27ch;
    line-height: 1.45;
  }
  .mark { position: relative; width: 260px; flex: none; }
  .mark svg { width: 100%; height: auto; }
  .mark rect:first-of-type { display: none; }
  .rule {
    position: absolute; left: 0; right: 0; bottom: 0; height: 8px;
    background: var(--sunrise);
  }
</style>
<div class="pattern"></div>
<div class="copy">
  <div class="eyebrow">Perth, Western Australia</div>
  <div class="mega">
    <span class="b">You name the part</span>
    <span class="s">We find it in Japan</span>
    <span class="o">Landed in A$</span>
  </div>
  <div class="sub">Japanese domestic market parts sourced to order, quoted in landed Australian dollars.</div>
</div>
<div class="mark">${torii}</div>
<div class="rule"></div>
`;

const browser = await launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(html, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: ROOT + 'public/assets/og.png' });
await browser.close();

const bytes = readFileSync(ROOT + 'public/assets/og.png').length;
console.log(`Wrote public/assets/og.png (1200x630, ${(bytes / 1024).toFixed(0)} KB)`);
