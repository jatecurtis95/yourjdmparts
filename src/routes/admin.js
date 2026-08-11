/**
 * Requests export.
 *
 * A convenience for getting the request list out of D1 without writing SQL —
 * useful for a spreadsheet, a backup, or handing the list to an accountant.
 * The D1 console remains the primary way to read them; this is the door for
 * everything that is not a browser.
 *
 * It stays shut unless `ADMIN_TOKEN` is set, and a shut door answers 404
 * rather than 401: an unconfigured deployment should not advertise that an
 * admin route exists at all.
 */

const MAX_ROWS = 1000;

/**
 * Compare in time that does not depend on how much of the token matched.
 * A plain `===` leaks the length of the common prefix through timing, which
 * is the whole game when the secret is guessable one character at a time.
 */
function tokensMatch(given, expected) {
  if (typeof given !== 'string' || given.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= given.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0;
}

/** RFC 4180: quote everything, double the quotes inside. */
function csvCell(value) {
  if (value === null || value === undefined) return '""';
  return `"${String(value).replace(/"/g, '""')}"`;
}

const COLUMNS = [
  'reference',
  'received_at',
  'handled',
  'forwarded',
  'name',
  'business',
  'email',
  'phone',
  'state',
  'postcode',
  'heard_from',
  'marketing_consent',
  'vehicle_summary',
  'parts_summary',
  'urgency',
  'budget',
  'photo_count',
];

/**
 * @param {Request} request
 * @param {{ADMIN_TOKEN?: string, REQUESTS_DB?: object}} env
 * @returns {Promise<Response|null>} null when the route is not configured
 */
export async function requestsExport(request, env = {}) {
  if (!env.ADMIN_TOKEN || !env.REQUESTS_DB) return null;

  const url = new URL(request.url);
  const header = request.headers.get('authorization') ?? '';
  const bearer = header.startsWith('Bearer ') ? header.slice(7) : '';
  const given = bearer || url.searchParams.get('token') || '';

  if (!tokensMatch(given, env.ADMIN_TOKEN)) {
    return new Response('Unauthorised\n', {
      status: 401,
      headers: {
        'content-type': 'text/plain; charset=utf-8',
        // Without this the browser cannot offer to re-prompt for credentials.
        'www-authenticate': 'Bearer realm="requests"',
        'cache-control': 'no-store',
      },
    });
  }

  const openOnly = url.searchParams.get('open') === '1';
  const { results } = await env.REQUESTS_DB.prepare(
    `SELECT ${COLUMNS.join(', ')} FROM requests
     ${openOnly ? 'WHERE handled = 0' : ''}
     ORDER BY received_at DESC LIMIT ${MAX_ROWS}`,
  ).all();

  const lines = [
    COLUMNS.join(','),
    ...results.map((row) => COLUMNS.map((column) => csvCell(row[column])).join(',')),
  ];

  return new Response(lines.join('\n') + '\n', {
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': 'attachment; filename="yourjdmparts-requests.csv"',
      // Customer contact details. Never cached anywhere, by anyone.
      'cache-control': 'no-store, private',
      'x-robots-tag': 'noindex, nofollow',
    },
  });
}
