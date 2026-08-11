# Your JDM Parts

The public website for yourjdmparts.com.

**We are a sourcing service, not a shop.** We hold no stock. Someone tells us
the car and the part, we go and find it in Japan, and we come back with a
landed Australian dollar price.

**Parts only.** The site makes no claim about vehicle imports, auction
sourcing, compliance or registration, and should not start making one
without the pages to back it up.

That model is load-bearing throughout this codebase: there are no prices, no
stock counts and no SKUs anywhere in the data or the markup, and there are
tests that fail if any appear.

A Cloudflare Worker that server-renders every page. No client framework, no
build step, no third-party runtime dependencies.

---

## Ship from anywhere

This repository is operated from a browser. Nothing here needs a particular
computer, a terminal, or `wrangler` on your machine.

**To get a change live: branch → PR → merge to `main` → watch the Actions tab.**

`.github/workflows/deploy.yml` runs the regression tests and then
`wrangler deploy`. The CLI commands below are for a local dev loop, not the
publishing path.

| Task | Route |
|------|-------|
| Deploy | Merge to `main`, or Actions → *Deploy to Cloudflare* → Run workflow |
| Secrets | Cloudflare dashboard → Workers → `yourjdmparts` → Settings → Variables and Secrets |
| Logs | Cloudflare dashboard → the Worker → Logs |

## First-time setup

**One repository secret**, at Settings → Secrets and variables → Actions:

- `CLOUDFLARE_API_TOKEN` — the *Edit Cloudflare Workers* template. The same
  token the `jdm-vehicle-finder` repo already uses works here; it is the same
  Cloudflare account.

The account ID is not a secret and is set directly in `deploy.yml`.

Optional Worker variables:

- `REQUEST_WEBHOOK` — optional. A URL that part requests are POSTed to as
  JSON. Independent of the D1 store: requests are recorded either way, and a
  webhook that breaks costs a notification rather than a customer.
- `ADMIN_TOKEN` — optional. Set it to open `/admin/requests.csv`. Unset, that
  route is a 404 rather than a 401, so an unconfigured deployment does not
  advertise that it exists.

Bindings:

- `REQUESTS_DB` — D1 (`yourjdmparts-requests`). Every validated request is
  written here on arrival. This is what makes a submission durable without any
  secret being set. Schema in `migrations/0001_requests.sql`.

## Before the domain points here

1. **Add the brand logos.** Every entry in `src/data/brands.js` has
   `logo: null`, so the cards set the brand name in the site's own condensed
   face. Drop files in `public/assets/brands/` and set the path — see that
   directory's README for the format.
2. **Set `REQUEST_WEBHOOK`** so part requests notify you. They are already
   stored in D1 the moment they arrive, so nothing is lost without it — but
   D1 has to be checked, whereas a webhook comes to you.
3. **Attach the domain to the Worker.** It is on Cloudflare nameservers but
   has no A record, so the apex serves nothing today.
4. **Fill in `LEGAL` in `src/config.js`** — registered entity name and ABN.
   Both are `null`, and the site prints nothing rather than a placeholder.
5. Read `docs/OWNER-REVIEW.md` — everything still waiting on real material or
   an owner decision, including the one real case study the Recent finds
   section needs before it appears at all.
6. Read `SUBSTITUTIONS.md` — it lists everything derived because the design
   system files were not available, and how to swap each one.

## Local development

```
npm install
npm run dev        # wrangler dev on :8787
npm test           # 137 regression tests, no browser needed
npm run qa         # boots a Worker, checks 23 routes × 6 widths in Chromium
npm run verify     # links, touch targets, keyboard, the form with and without JS
```

## Layout

```
src/
  worker.js            router; legacy redirects; assets fall through to ./public
  layout.js            document shell, header, trade strip, footer
  html.js              escaping template layer — everything escapes by default
  format.js            money, dates, distances (Australian formatting)
  config.js            site details, trade strip, hero media, nav
  components/          logo, icon, ui primitives, cards, blocks
  routes/              one file per page
  content/             policy text and Column entries, kept as data
  data/                catalogue (part types), brands, chassis, finds, form options
  delivery.js          getting a submitted request to a person
public/assets/
  tokens.css           THE source of truth for colour, type, space, motion
  styles.css           everything else; references only var()
  fonts.css            self-hosted @font-face
  app.js               progressive enhancement only
  brands/              supplier logos go here (see its README)
migrations/            D1 schema
docs/                  SETUP.md (what only the owner can do), OWNER-REVIEW.md
test/                  node --test, no browser
scripts/qa.mjs         browser checks (console errors, horizontal overflow)
scripts/verify.mjs     launch checks (links, targets, keyboard, the real form)
```

## Pages

| Page | Route |
|---|---|
| Home | `/` |
| What we source | `/what-we-source` — part types by category, no prices |
| Brands | `/brands`, `/brands/{slug}` |
| Chassis landing pages | `/{CHASSIS}` — the SEO surface |
| Request a part | `/request` — one car, up to eight parts |
| How it works | `/how-it-works` — includes the payment stages |
| About | `/about` |
| The Column | `/column`, `/column/{slug}` |
| Recent finds | `/finds`, `/finds/{slug}` — 404 until a real case study is published |
| Privacy, Terms | `/privacy`, `/terms` |
| Shipping and returns | `/shipping-and-returns` |
| Requests export | `/admin/requests.csv` — 404 unless `ADMIN_TOKEN` is set |

`/catalogue`, `/order`, `/shop` and `/part/{slug}` are permanent redirects
from when the site was modelled as a stock-holding shop. `/blog/*`,
`/logbook`, `/parts-request` and `/import-a-car` redirect from the previous
site. Nothing that was ever linked is allowed to 404.

## The rules this site holds itself to

These are enforced by `test/design-system.test.mjs`, so breaking one fails
the build rather than reaching production quietly.

- **Five colours, no sixth.** Midnight ground, Navy surface, Bone type,
  Sunrise action, Champagne Gold hairlines. Alpha ramps of those five are not
  new colours. No hex value exists outside `tokens.css`.
- **Gold never sits directly against orange.**
- **Type on a Sunrise fill is Midnight, not Bone.** Bone on Sunrise is
  3.00:1 and fails; Midnight on Sunrise is 5.57:1.
- **Flat.** No gradients, bevels, 3D or texture. The modal carries the only
  shadow in the system.
- **The pattern is a separate layer** at 350px and 6% opacity, so opacity
  never touches content. Permitted on hero, page headers, footers, section
  dividers and empty states. Never behind listings, body copy, spec tables,
  product photos, checkout or forms.
- **Motion is 180ms of colour and opacity.** The chassis ticker is the only
  keyframe animation and carries its own `prefers-reduced-motion` guard.
- **One filled-orange action per section, at most.** Marketing surfaces spend
  it on the section's single action; working surfaces such as the request
  form hold the Bone register and spend no Sunrise at all.
- **Scarcity is an orange outline, never a fill.**
- **The torii is never redrawn, recoloured, rotated, stretched or patterned**,
  and never renders below 40px.
- **No screen ends in nothing.** Every empty state, 404 and sold lot has a
  button that goes somewhere.
- **44px minimum hit targets, a visible gold focus ring on everything
  interactive**, and alt text on all part photography naming part and chassis.

## House style

Australian spelling. Prices as `A$1,480`. "We" for the business, "you" for
the buyer. Sentence case for headings and body; uppercase only for the
wordmark, eyebrows, labels, badges and buttons, always tracked. Specificity
is the tone — "Removed from a 1997 JZA80 with 84,220 km" beats "quality used
part". State wear honestly.

No emoji, no exclamation marks, no racing metaphors, no Japanese words used
decoratively. There are tests for all of these.

## SEO

Chassis-code pages (`/JZA80`, `/BNR34`, …) are the SEO surface and say what we
source for that chassis. Lowercase codes 301 to the canonical uppercase form.
Brand pages (`/brands/tein`) are the second surface. Every page has a
canonical URL; chassis pages carry `Service` structured data and brand pages
carry `Brand`. **Nothing carries an `Offer` or a `price`** — we have no stock
to offer, and a test enforces that.
