import worker, { route } from '../src/worker.js';

export const ORIGIN = 'https://yourjdmparts.com';

/**
 * Fetch a page the way the Worker does, so unmatched paths fall through to
 * the 404 page rather than returning null.
 */
export async function getHtml(path, init) {
  const response = await worker.fetch(new Request(ORIGIN + path, init), {});
  return { html: await response.text(), status: response.status, response };
}

export async function getStatus(path, init) {
  const response = await worker.fetch(new Request(ORIGIN + path, init), {});
  return response.status;
}

export { route };

/** Strip tags so content rules can be checked against visible text. */
export function textOf(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

/** All page routes that render HTML. */
export const PAGE_PATHS = [
  '/',
  '/what-we-source',
  '/what-we-source?category=engine',
  '/brands',
  '/brands/tein',
  '/brands/nismo',
  '/how-it-works',
  '/request',
  '/JZA80',
  '/BNR34',
];

/** Extract the inner HTML of every element matching a tag+class. */
export function blocksOf(html, tag, className) {
  const out = [];
  const open = new RegExp(`<${tag}[^>]*class="[^"]*\\b${className}\\b[^"]*"[^>]*>`, 'g');
  let match;
  while ((match = open.exec(html))) {
    // Walk forward counting nested tags of the same name.
    let depth = 1;
    const scan = new RegExp(`<${tag}\\b|</${tag}>`, 'g');
    scan.lastIndex = match.index + match[0].length;
    let end = scan.lastIndex;
    let step;
    while (depth > 0 && (step = scan.exec(html))) {
      depth += step[0][1] === '/' ? -1 : 1;
      end = step.index;
    }
    out.push(html.slice(match.index + match[0].length, end));
  }
  return out;
}
