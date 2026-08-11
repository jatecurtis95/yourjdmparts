import { html, render } from '../html.js';
import { Page } from '../layout.js';
import { SITE, TRADE } from '../config.js';
import { Button, Input, Select, Checkbox, Pattern, Card } from '../components/ui.js';
import { Breadcrumb } from '../components/blocks.js';
import { Icon } from '../components/icon.js';
import { chassisCodes } from '../data/chassis.js';
import { getPartType, PART_TYPES } from '../data/catalogue.js';
import { getBrand, BRANDS } from '../data/brands.js';
import {
  AU_STATES,
  MAKES,
  TRANSMISSIONS,
  DRIVETRAINS,
  BODY_STYLES,
  ACCEPTABLE_CONDITIONS,
  URGENCY,
  HEARD_FROM,
} from '../data/form-options.js';

/**
 * Request a part.
 *
 * This form is the whole business. We hold no stock, so this is not a
 * fallback for when something is sold out — it is the front door.
 *
 * One vehicle, any number of parts. A workshop chasing five parts for one
 * car should not fill this in five times, so the part block repeats. It
 * degrades honestly: with no JavaScript you get one part block and a
 * description field big enough to list the rest.
 *
 * Required is kept to what makes a request actionable. Everything that
 * merely narrows the search is optional and says so.
 */

const MAX_PARTS = 8;

/* ── Validation ─────────────────────────────────────────────── */

const REQUIRED_VEHICLE = ['make', 'model'];
const REQUIRED_CONTACT = ['name'];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const BUILD_DATE_RE = /^\d{4}-\d{2}$/;

/**
 * @param {Record<string, string>} data flat field map
 * @param {Array<Record<string, string>>} parts one entry per part block
 * @returns {{errors: Record<string, string>, partErrors: Array<Record<string, string>>}}
 */
export function validateRequest(data, parts = []) {
  const errors = {};

  for (const field of [...REQUIRED_VEHICLE, ...REQUIRED_CONTACT]) {
    if (!String(data[field] ?? '').trim()) errors[field] = 'This one we do need.';
  }

  // One way to reach you is enough. Demanding both turns people away, and
  // plenty of buyers will give a phone number but not an email, or vice versa.
  const hasEmail = Boolean(String(data.email ?? '').trim());
  const hasPhone = Boolean(String(data.phone ?? '').trim());
  if (!hasEmail && !hasPhone) {
    errors.email = 'Give us one way to reach you — email or phone.';
  }

  if (hasEmail && !EMAIL_RE.test(data.email.trim())) {
    errors.email = 'That email address does not look right.';
  }

  if (data.buildDate && !BUILD_DATE_RE.test(data.buildDate.trim())) {
    errors.buildDate = 'Give us the month and year, for example 1997-04.';
  } else if (data.buildDate) {
    const year = Number(data.buildDate.slice(0, 4));
    const month = Number(data.buildDate.slice(5, 7));
    if (month < 1 || month > 12) errors.buildDate = 'That month does not exist.';
    else if (year < 1960 || year > 2030) errors.buildDate = 'That build year looks wrong.';
  }

  if (data.postcode && !/^\d{4}$/.test(data.postcode.trim())) {
    errors.postcode = 'Australian postcodes are four digits.';
  }

  if (data.odometer && !/^\d{1,7}$/.test(String(data.odometer).replace(/[\s,]/g, ''))) {
    errors.odometer = 'Use digits only, in kilometres.';
  }

  if (data.chassisNumber && String(data.chassisNumber).trim().length < 6) {
    errors.chassisNumber = 'A chassis number is usually at least six characters.';
  }

  // At least one part must actually describe something.
  const partErrors = parts.map(() => ({}));
  const described = parts.filter((p) => String(p.description ?? '').trim());
  if (!described.length) {
    if (partErrors.length) partErrors[0].description = 'Tell us at least one part to look for.';
    errors.parts = 'Tell us at least one part to look for.';
  }

  parts.forEach((part, i) => {
    const qty = String(part.quantity ?? '').trim();
    if (qty && !/^\d{1,3}$/.test(qty)) partErrors[i].quantity = 'Digits only.';
  });

  return { errors, partErrors };
}

/** Pull repeated part blocks out of a flat form payload. */
export function collectParts(entries) {
  /** @type {Map<string, Record<string,string>>} */
  const byIndex = new Map();
  for (const [key, value] of entries) {
    const match = /^parts\[(\d+)]\[(\w+)]$/.exec(key);
    if (!match) continue;
    const [, index, field] = match;
    if (!byIndex.has(index)) byIndex.set(index, {});
    byIndex.get(index)[field] = value;
  }
  return [...byIndex.entries()]
    .sort((a, b) => Number(a[0]) - Number(b[0]))
    .map(([, part]) => part);
}

/* ── Part block ─────────────────────────────────────────────── */

function PartBlock({ index, values = {}, errors = {}, removable = true, required = false }) {
  const name = (field) => `parts[${index}][${field}]`;
  const v = (field) => values[field] ?? '';

  return html`<fieldset class="part-block" data-part-block>
    <legend class="part-block__legend">
      <span>Part <span data-part-number>${index + 1}</span></span>
      ${removable
        ? html`<button class="btn btn--ghost" type="button" data-remove-part>
            ${Icon('trash', { size: 16 })}Remove
          </button>`
        : ''}
    </legend>

    <div class="form-grid">
      ${Input({
        name: name('description'),
        id: `part-${index}-description`,
        label: 'What you need',
        required,
        multiline: true,
        rows: 3,
        wide: true,
        placeholder: 'Right-hand front guard, and the indicator repeater if it comes with it.',
        value: v('description'),
        error: errors.description ?? null,
        hint: 'Plain description is fine. Tell us what it is doing on your car if that helps.',
      })}
      ${Input({
        name: name('partNumber'),
        id: `part-${index}-partNumber`,
        label: 'Part number',
        required: false,
        placeholder: '22030-46110',
        value: v('partNumber'),
        hint: 'The fastest route to the right part, if you have it.',
      })}
      ${Input({
        name: name('brand'),
        id: `part-${index}-brand`,
        label: 'Brand preference',
        required: false,
        placeholder: 'Genuine, Tein, HKS, whatever fits',
        value: v('brand'),
        hint: 'Leave blank and we will quote the best value option we find.',
      })}
      ${Input({
        name: name('quantity'),
        id: `part-${index}-quantity`,
        label: 'How many',
        type: 'number',
        required: false,
        inputmode: 'numeric',
        value: v('quantity') || '1',
        error: errors.quantity ?? null,
      })}
      ${Select({
        name: name('condition'),
        id: `part-${index}-condition`,
        label: 'Condition you will take',
        required: false,
        placeholder: 'Select',
        options: ACCEPTABLE_CONDITIONS,
        value: v('condition'),
      })}
    </div>
  </fieldset>`;
}

/* ── Form ───────────────────────────────────────────────────── */

function Form({ values = {}, errors = {}, parts = [{}], partErrors = [] }) {
  const v = (name) => values[name] ?? '';
  const e = (name) => errors[name] ?? null;

  return html`<form
    class="stack-6"
    method="post"
    action="/request"
    enctype="multipart/form-data"
    novalidate
    data-request-form
    data-max-parts="${MAX_PARTS}"
  >
    <!-- Spam trap. Real people never see it, so anything in it is a bot.
         inert as well as aria-hidden: aria-hidden alone leaves the input
         programmatically focusable, which is a focusable element inside a
         hidden subtree. Bots parse the HTML and ignore both. -->
    <div class="visually-hidden" aria-hidden="true" inert>
      <label for="company-website">Leave this field empty</label>
      <input id="company-website" type="text" name="companyWebsite" tabindex="-1" autocomplete="off" />
    </div>

    <fieldset class="fieldset" data-step data-step-title="Your car">
      <legend class="fieldset__legend">The car</legend>
      <p class="fieldset__intro">
        Fitment on these cars turns on details that a make and model alone will not settle. The
        more of this you can give us, the less likely we are to find you the wrong part.
      </p>
      <div class="form-grid">
        ${Select({ name: 'make', label: 'Make', required: true, placeholder: 'Select a make', options: MAKES, value: v('make'), error: e('make') })}
        ${Input({ name: 'model', label: 'Model', required: true, placeholder: 'Supra, Skyline GT-R, RX-7', value: v('model'), error: e('model') })}
        ${Input({
          name: 'chassisCode',
          label: 'Chassis code',
          required: false,
          placeholder: 'JZA80',
          value: v('chassisCode'),
          hint: `The code on the build plate. We know ${chassisCodes.slice(0, 4).join(', ')} and more well.`,
        })}
      </div>

      <details class="details" data-vehicle-extra>
        <summary class="details__summary">Add more vehicle details</summary>
        <p class="fieldset__intro" style="margin-top: var(--space-4)">
          None of this is required. Every field you can fill in is one fewer thing we have to
          guess, and it is what stops us finding you a part that does not fit.
        </p>
        <div class="form-grid">
        ${Input({
          name: 'chassisNumber',
          label: 'Chassis number or VIN',
          required: false,
          placeholder: 'JZA80-0012345',
          value: v('chassisNumber'),
          error: e('chassisNumber'),
          hint: 'The single most useful field on this form. It settles fitment where a model changed mid-production.',
        })}
        ${Input({
          name: 'buildDate',
          label: 'Build month and year',
          type: 'month',
          required: false,
          value: v('buildDate'),
          error: e('buildDate'),
          hint: 'On the build plate. Several of these cars changed parts mid-year.',
        })}
        ${Input({ name: 'grade', label: 'Grade or trim', required: false, placeholder: 'RZ, V-Spec, Type R, Spec-R', value: v('grade'), hint: 'Grades differ in brakes, gearbox, differential and seats.' })}
        ${Input({ name: 'engineCode', label: 'Engine code', required: false, placeholder: '2JZ-GTE, RB26DETT, 13B-REW', value: v('engineCode') })}
        ${Select({ name: 'transmission', label: 'Transmission', required: false, placeholder: 'Select', options: TRANSMISSIONS, value: v('transmission') })}
        ${Select({ name: 'drivetrain', label: 'Drivetrain', required: false, placeholder: 'Select', options: DRIVETRAINS, value: v('drivetrain') })}
        ${Select({ name: 'bodyStyle', label: 'Body style', required: false, placeholder: 'Select', options: BODY_STYLES, value: v('bodyStyle') })}
        ${Input({ name: 'paintCode', label: 'Paint colour code', required: false, placeholder: 'TV2, NH-0', value: v('paintCode'), hint: 'Only matters if you want a panel that arrives already the right colour.' })}
        ${Input({ name: 'odometer', label: 'Odometer', required: false, inputmode: 'numeric', placeholder: '84220', value: v('odometer'), error: e('odometer'), hint: 'In kilometres. Helps us judge what wear is reasonable on a matching part.' })}
        </div>
      </details>
    </fieldset>

    <fieldset class="fieldset" data-step data-step-title="The part">
      <legend class="fieldset__legend">The parts</legend>
      <p class="fieldset__intro">
        One request covers as many parts as you need for this car — you do not have to send
        this form more than once.
      </p>

      ${errors.parts ? html`<p class="field__error" role="alert">${errors.parts}</p>` : ''}

      <div data-parts-list>
        ${parts.map((part, i) =>
          PartBlock({
            index: i,
            values: part,
            errors: partErrors[i] ?? {},
            removable: i > 0,
            required: i === 0,
          }),
        )}
      </div>

      <!-- Blueprint for blocks added in the browser. Index 0 here is a
           placeholder that app.js renumbers; it is never submitted. -->
      <template data-part-template>
        ${PartBlock({ index: 0, removable: true, required: false })}
      </template>

      <div class="cluster" style="margin-top: var(--space-5)">
        <button class="btn btn--outline" type="button" data-add-part>
          ${Icon('plus', { size: 16 })}Add another part
        </button>
        <p class="muted" style="font-size: var(--size-small)">
          Up to ${MAX_PARTS} parts on one request.
        </p>
      </div>

      <div class="field field--wide" style="margin-top: var(--space-6)">
        <span class="field__label">Photographs <span class="muted">(optional)</span></span>
        <span class="field__hint" id="photos-hint">
          The part on the car, the part number stamp, or the damage you are replacing. Up to
          six images.
        </span>
        <label class="file-input" for="photos">
          ${Icon('upload', { size: 18 })}
          <input id="photos" type="file" name="photos" accept="image/*" multiple aria-describedby="photos-hint" />
        </label>
      </div>

      <div class="form-grid" style="margin-top: var(--space-5)">
        ${Select({ name: 'urgency', label: 'How soon', required: false, placeholder: 'Select', options: URGENCY, value: v('urgency'), hint: 'Sea freight is materially cheaper than air. Knowing your deadline lets us pick.' })}
        ${Input({ name: 'budget', label: 'Budget', required: false, placeholder: 'A$2,000', value: v('budget'), hint: 'Optional, and it does not raise the price. It tells us when to stop looking.' })}
      </div>
    </fieldset>

    <fieldset class="fieldset" data-step data-step-title="Your details">
      <legend class="fieldset__legend">You</legend>
      <p class="fieldset__intro">
        We come back with a landed A$ price within ${TRADE.quoteDays} business days. No deposit
        is taken to quote.
      </p>
      <div class="form-grid">
        ${Input({ name: 'name', label: 'Full name', required: true, autocomplete: 'name', value: v('name'), error: e('name') })}
        ${Input({ name: 'business', label: 'Workshop or business', required: false, autocomplete: 'organization', value: v('business') })}
        ${Input({ name: 'email', label: 'Email', type: 'email', required: false, autocomplete: 'email', value: v('email'), error: e('email'), hint: 'Email or phone — whichever you prefer. One is enough.' })}
        ${Input({ name: 'phone', label: 'Phone', type: 'tel', required: false, autocomplete: 'tel', inputmode: 'tel', value: v('phone'), error: e('phone') })}
        ${Select({ name: 'state', label: 'State or territory', required: false, placeholder: 'Select', options: AU_STATES, value: v('state') })}
        ${Input({ name: 'postcode', label: 'Postcode', required: false, inputmode: 'numeric', maxlength: 4, autocomplete: 'postal-code', value: v('postcode'), error: e('postcode'), hint: 'So we can quote freight with the parts.' })}
        ${Select({ name: 'heardFrom', label: 'How you found us', required: false, placeholder: 'Select', options: HEARD_FROM, value: v('heardFrom') })}
      </div>

      <div style="margin-top: var(--space-5)">
        ${Checkbox({
          name: 'consent',
          label: 'You may contact me about this request and about parts that match it.',
          checked: values.consent === 'yes',
        })}
      </div>
    </fieldset>

    <div class="cluster" data-submit-row>
      ${Button({ label: 'Request my free landed quote', variant: 'bone', size: 'lg', type: 'submit' })}
      <p class="muted" style="font-size: var(--size-small)">
        Answer within ${TRADE.quoteDays} business days. Nothing is charged to quote.
      </p>
    </div>
  </form>`;
}

/* ── Page ───────────────────────────────────────────────────── */

/**
 * @param {{url?: URL, values?: object, errors?: object, parts?: Array<object>,
 *   partErrors?: Array<object>, submitted?: boolean}} [props]
 */
export function RequestPage({
  url = null,
  values = {},
  errors = {},
  parts = null,
  partErrors = [],
  submitted = false,
} = {}) {
  const params = url?.searchParams;
  const seeded = { ...values };
  let seededParts = parts;

  if (params && !Object.keys(values).length) {
    const chassis = params.get('chassis');
    if (chassis) seeded.chassisCode = chassis.toUpperCase();

    const first = {};
    const partType = params.get('part') ? getPartType(params.get('part')) : null;
    if (partType) first.description = partType.name;

    const brand = params.get('brand') ? getBrand(params.get('brand')) : null;
    if (brand) first.brand = brand.name;

    if (Object.keys(first).length) seededParts = [first];
  }

  const hasErrors = Object.keys(errors).length > 0;

  const body = html`<div class="container">
      ${Breadcrumb({ trail: [{ href: '/', label: 'Home' }, { label: 'Request a part' }] })}
    </div>

    <section class="page-head patterned">
      ${Pattern()}
      <div class="container page-head__inner">
        <p class="eyebrow">Sourcing</p>
        <h1 class="display-1" style="font-size: clamp(2.25rem, 6vw, 3.5rem)">
          Tell us the part and we will go and find it
        </h1>
        <p class="lede">
          We hold no stock, so this is the front door rather than a fallback. We buy at auction
          in Japan every week and work with dismantlers across the country. If it came on a
          Japanese-market car, it is usually a question of finding the right donor rather than
          whether the part exists.
        </p>
      </div>
    </section>

    ${submitted
      ? html`<div class="container section">
          ${Card({
            children: html`<div class="stack">
              <p class="eyebrow">Received</p>
              <h2 class="display-1">We have your request</h2>
              <p class="prose">
                One of us will read it properly rather than run it through a template. You will
                have a landed A$ price, or an honest answer that we cannot find it, within
                ${TRADE.quoteDays} business days.
              </p>
              <p class="prose">
                If you have photographs that did not attach, send them to
                <a class="accent" href="mailto:${SITE.email}">${SITE.email}</a> and we will put
                them with your request.
              </p>
              <div class="cluster">
                ${Button({ label: 'What we source', href: '/what-we-source', variant: 'bone' })}
                ${Button({ label: 'Send another request', href: '/request', variant: 'outline' })}
              </div>
            </div>`,
          })}
        </div>`
      : html`<div class="container section">
          ${hasErrors
            ? html`<div class="notice notice--urgent" role="alert" style="margin-bottom: var(--space-6)">
                ${Icon('triangle-alert', { size: 16 })}
                <span
                  ><strong>Some of that did not come through.</strong> The fields below are
                  marked. Nothing you typed has been lost.</span
                >
              </div>`
            : ''}
          <div class="split-layout">
            <div>
              ${Form({
                values: seeded,
                errors,
                parts: seededParts ?? [{}],
                partErrors,
              })}
            </div>
            <div>
              ${Card({
                children: html`<h2 class="display-3" style="margin-bottom: var(--space-4)">
                    What happens next
                  </h2>
                  <ol class="stack">
                    ${[
                      'We read the request and check it against what we already have coming over from Japan.',
                      'If it is not inbound, we brief our buyer and watch the auctions and dismantlers for it.',
                      `You get a landed A$ price within ${TRADE.quoteDays} business days, including duty, GST and freight to your postcode.`,
                      'Nothing is charged until you say yes to the price.',
                    ].map(
                      (step, i) =>
                        html`<li class="muted">
                          <span class="label accent">${String(i + 1).padStart(2, '0')}</span>
                          <span style="display:block; margin-top: var(--space-1)">${step}</span>
                        </li>`,
                    )}
                  </ol>
                  <hr class="rule" style="margin-block: var(--space-5)" />
                  <p class="muted" style="font-size: var(--size-small)">
                    If we cannot find one worth buying, we will tell you that rather than quote
                    you something else.
                  </p>`,
              })}
            </div>
          </div>
        </div>`}`;

  return Page({
    title: submitted ? 'Request received' : 'Request a part',
    description:
      'Tell us the chassis number, the build month and the parts you need. We source them from Japan and come back with a landed Australian dollar price within four business days.',
    path: '/request',
    current: '/request',
    noindex: submitted,
    children: body,
  });
}

/* ── Submit handler ─────────────────────────────────────────── */

const HTML_HEADERS = { 'content-type': 'text/html; charset=utf-8' };

/**
 * @param {Request} request
 * @param {{REQUEST_WEBHOOK?: string}} [env]
 */
export async function handleRequestSubmit(request, env = {}) {
  let form;
  try {
    form = await request.formData();
  } catch {
    return new Response(
      render(RequestPage({ errors: { parts: 'We could not read that submission. Try again.' } })),
      { status: 400, headers: HTML_HEADERS },
    );
  }

  const entries = [...form.entries()];

  /** @type {Record<string, string>} */
  const data = {};
  const photos = [];
  for (const [key, value] of entries) {
    if (typeof value === 'string') {
      if (!key.startsWith('parts[')) data[key] = value;
    } else if (value && typeof value === 'object' && 'name' in value && value.name) {
      photos.push({ name: value.name, size: value.size, type: value.type });
    }
  }

  const parts = collectParts(entries.filter(([, v]) => typeof v === 'string'));

  // Anything in the honeypot is a bot. Answer as if it worked, store nothing.
  if (String(data.companyWebsite ?? '').trim()) {
    return new Response(render(RequestPage({ submitted: true })), { headers: HTML_HEADERS });
  }

  const { errors, partErrors } = validateRequest(data, parts.length ? parts : [{}]);
  if (Object.keys(errors).length) {
    return new Response(
      render(RequestPage({ values: data, errors, parts: parts.length ? parts : [{}], partErrors })),
      { status: 422, headers: HTML_HEADERS },
    );
  }

  const payload = {
    receivedAt: new Date().toISOString(),
    vehicle: {
      make: data.make,
      model: data.model,
      chassisCode: data.chassisCode || null,
      chassisNumber: data.chassisNumber || null,
      buildDate: data.buildDate,
      grade: data.grade || null,
      engineCode: data.engineCode || null,
      transmission: data.transmission || null,
      drivetrain: data.drivetrain || null,
      bodyStyle: data.bodyStyle || null,
      paintCode: data.paintCode || null,
      odometerKm: data.odometer ? Number(String(data.odometer).replace(/[\s,]/g, '')) : null,
    },
    parts: parts
      .filter((p) => String(p.description ?? '').trim())
      .map((p) => ({
        description: p.description.trim(),
        partNumber: p.partNumber || null,
        brand: p.brand || null,
        quantity: Number(p.quantity) || 1,
        acceptableCondition: p.condition || null,
      })),
    request: {
      urgency: data.urgency || null,
      budget: data.budget || null,
      photos,
    },
    contact: {
      name: data.name,
      business: data.business || null,
      email: data.email,
      phone: data.phone,
      state: data.state || null,
      postcode: data.postcode || null,
      heardFrom: data.heardFrom || null,
      consent: data.consent === 'yes',
    },
  };

  // Single integration point. Set REQUEST_WEBHOOK to wherever these should
  // land — an inbox relay, a CRM, a Worker of your own. Without it the
  // request is logged so it is visible in `wrangler tail`.
  if (env.REQUEST_WEBHOOK) {
    try {
      await fetch(env.REQUEST_WEBHOOK, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.error('Request webhook failed', error, JSON.stringify(payload));
    }
  } else {
    console.log('Part request', JSON.stringify(payload));
  }

  return new Response(render(RequestPage({ submitted: true })), { headers: HTML_HEADERS });
}
