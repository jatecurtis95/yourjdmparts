import { GST_RATE } from './config.js';

/**
 * Money and date formatting.
 *
 * House style: prices print as `A$1,480`. Whole dollars where the cents are
 * zero, two decimals otherwise. Australian spelling and date order.
 */

/** @param {number} cents integer cents of AUD */
export function formatAud(cents) {
  const value = cents / 100;
  const hasCents = cents % 100 !== 0;
  return (
    'A$' +
    value.toLocaleString('en-AU', {
      minimumFractionDigits: hasCents ? 2 : 0,
      maximumFractionDigits: hasCents ? 2 : 0,
    })
  );
}

/** @param {number} cents GST-exclusive */
export const withGst = (cents) => Math.round(cents * (1 + GST_RATE));

/** @param {number} cents GST-exclusive */
export const gstOn = (cents) => withGst(cents) - cents;

/**
 * @param {number} cents GST-exclusive
 * @param {boolean} includeGst
 */
export const priceFor = (cents, includeGst) => (includeGst ? withGst(cents) : cents);

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/** '2026-08-04' -> '4 August 2026' */
export function formatDate(iso) {
  const [y, m, d] = String(iso).split('-').map(Number);
  if (!y || !m || !d) return String(iso);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

/** '2026-08-04' -> '4 Aug 2026' */
export function formatDateShort(iso) {
  const [y, m, d] = String(iso).split('-').map(Number);
  if (!y || !m || !d) return String(iso);
  return `${d} ${MONTHS[m - 1].slice(0, 3)} ${y}`;
}

/** '1997-04' -> 'April 1997' */
export function formatMonth(iso) {
  const [y, m] = String(iso).split('-').map(Number);
  if (!y || !m) return String(iso);
  return `${MONTHS[m - 1]} ${y}`;
}

/** 84220 -> '84,220 km' */
export const formatKm = (km) => `${Number(km).toLocaleString('en-AU')} km`;

/** Plain integer with thousands separators. */
export const formatNumber = (n) => Number(n).toLocaleString('en-AU');
