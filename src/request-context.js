import { SITE } from './config.js';

/**
 * Per-request context.
 *
 * Rendering is entirely synchronous — a route sets the host, builds the
 * whole page, and returns, with no await in between — so a module-level
 * value cannot be observed by another request mid-render. Anything that
 * introduces an await between setHost() and render() breaks that, so don't.
 */

let currentHost = null;

/** @param {URL} url */
export function setHost(url) {
  currentHost = url.host.toLowerCase();
}

export function getHost() {
  return currentHost;
}

const PRODUCTION_HOSTS = new Set([
  new URL(SITE.origin).host.toLowerCase(),
  'www.' + new URL(SITE.origin).host.toLowerCase(),
]);

/**
 * True only when served from the domain the canonical URLs point at.
 *
 * Every page canonicalises to SITE.origin. On any other host — a
 * workers.dev preview, a staging domain — that combination tells a crawler
 * "the real version of this page is somewhere else", which is a lie while
 * the domain still serves a different site. So those hosts are noindexed
 * and robots.txt disallows everything.
 */
export function isProductionHost() {
  // Before a request has been routed (unit tests calling a page directly)
  // assume production, so tests see the real markup.
  if (currentHost === null) return true;
  return PRODUCTION_HOSTS.has(currentHost);
}
