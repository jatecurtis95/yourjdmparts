import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Every class name the markup uses must exist in the stylesheet.
 *
 * This exists because a class was once removed from styles.css during a
 * cleanup while the markup kept using it. Nothing failed — the page simply
 * rendered as an unstyled block, which no unit test and no overflow check
 * would notice.
 */

const SRC = new URL('../src/', import.meta.url).pathname;
const CSS = readFileSync(new URL('../public/assets/styles.css', import.meta.url).pathname, 'utf8');

/** Classes applied only by app.js at runtime, or by the browser. */
const APPLIED_AT_RUNTIME = new Set([]);

function sourceFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...sourceFiles(path));
    else if (entry.name.endsWith('.js')) out.push(path);
  }
  return out;
}

test('every class used in markup is defined in the stylesheet', () => {
  const used = new Map(); // class -> first file that used it

  for (const file of sourceFiles(SRC)) {
    // Strip comments: JSDoc examples mention classes that are not markup.
    const source = readFileSync(file, 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, ' ')
      .replace(/^\s*\/\/.*$/gm, ' ');
    for (const match of source.matchAll(/class="([^"]*)"/g)) {
      // Skip interpolated segments; only static tokens can be checked.
      for (const token of match[1].split(/\s+/)) {
        if (!token || token.includes('${') || token.includes('}')) continue;
        if (!/^[a-z][a-z0-9_-]*$/i.test(token)) continue;
        if (!used.has(token)) used.set(token, file.replace(SRC, 'src/'));
      }
    }
  }

  assert.ok(used.size > 40, `expected to find plenty of classes, found ${used.size}`);

  const missing = [];
  for (const [name, file] of used) {
    if (APPLIED_AT_RUNTIME.has(name)) continue;
    // Word-boundary match so .btn does not satisfy .btn--sunrise.
    const defined = new RegExp(`\\.${name.replace(/[-]/g, '\\-')}(?![a-zA-Z0-9_-])`).test(CSS);
    if (!defined) missing.push(`${name} (used in ${file})`);
  }

  assert.deepEqual(missing, [], 'these classes are used but have no CSS');
});
