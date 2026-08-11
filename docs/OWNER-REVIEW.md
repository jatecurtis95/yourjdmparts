# Awaiting the owner

Everything on the site is either a verified fact or it is not published. This
is the list of things that are **not published because nobody has verified
them yet** — plus the handful of wordings that ought to have a second pair of
eyes before the site takes real money.

Nothing here blocks the site from being live. Each item makes it better.

---

## 1. Registered business identity — blocks nothing, improves trust

`src/config.js` → `LEGAL`

```js
export const LEGAL = {
  entityName: null,   // registered entity or business name
  abn: null,          // 11 digits
};
```

Both are `null`. While they are, the site prints **neither** — no placeholder,
no "ABN pending", no guess. Fill them in and they appear automatically in three
places: the footer base line, the "The business" table on `/about`, and the
`legalName` / `taxID` fields of the organisation structured data.

`test/identity.test.mjs` fails the build if a placeholder ABN is ever rendered
as though it were real.

**Why it matters:** an ABN on the site is not legally required, but for a
business asking strangers to send money to Japan it is cheap credibility. It is
also required on tax invoices regardless.

---

## 2. Contact details — changed, needs one confirmation

| Detail | Before | Now | Status |
|---|---|---|---|
| Email | `info@` on the old domain | `info@yourjdmparts.com` | **Confirm the mailbox exists** |
| Instagram | old handle | `instagram.com/yourjdmparts` | **Confirm the handle exists** |
| Phone | `0494 070 106` | unchanged | Verified — it is on the previous live site |

The old domain returns **NXDOMAIN** — it does not resolve at all, so every
email sent to the address the site was publishing has been bouncing. That is
why it was removed rather than kept during a transition.

`yourjdmparts.com` has live Microsoft 365 mail routing
(`yourjdmparts-com.mail.protection.outlook.com`), so the domain accepts mail.
What could not be verified from here is whether the **`info@`** mailbox itself
has been created, and whether the Instagram handle is real. Both were supplied
rather than tested.

**Action:** send a test email to `info@yourjdmparts.com` and open
`instagram.com/yourjdmparts`. If either is wrong it is a one-line change in
`src/config.js`.

---

## 3. Recent finds — the biggest remaining gap

`src/data/finds.js` → `FINDS` is an empty array, so `/finds` returns 404, the
homepage shows no cards, and the sitemap does not mention it. That is
deliberate: a fabricated case study would be the exact thing the audit said
this business is missing, faked.

The structure is built and tested. **One real job** fills it. What is needed:

- [ ] The car — year, make, model, and the chassis code
- [ ] What the customer was actually stuck on
- [ ] The part requested
- [ ] Where it was found (no need to name the supplier)
- [ ] What the inspection turned up — **including the faults**
- [ ] Condition grade — Excellent / Good / Fair / Spares or repair
- [ ] Quote turnaround in business days
- [ ] **The money, itemised:** part, freight, duty+GST+clearance, total landed
- [ ] Delivery timeline, e.g. "5 weeks from accepted quote"
- [ ] How it ended for the customer
- [ ] A testimonial, if they will give one, with how they want to be credited
- [ ] Photographs — real ones, into `public/assets/finds/<slug>/`

Any field except the car, the part and the landed total may be left `null`; the
page omits it cleanly. There is a test proving a sparse entry renders without
leaking `null` into the markup.

Photographs need alt text describing **the part and its condition** — "right-hand
front guard on a bench, two stone chips on the leading edge", not "guard photo".
A test enforces a minimum length.

---

## 4. Held-back Column entry — a decision, not a gap

The previous site had two Logbook posts, both dated 22 July 2026, both by Emi.

- **"How I search all of Japan for one part"** — migrated to
  `/column/searching-all-of-japan`, original date and authorship preserved,
  substance unchanged. Only the business name and a dead link were edited.
- **"Inside Japan's car auctions"** — **not published.** It is a guide to
  bidding at dealer-only *vehicle* auctions and closes by selling the vehicle
  import service. This site is parts only, so publishing it would advertise
  something the business does not currently do.

Its old URL redirects to `/column` rather than 404ing, so nothing is lost. The
text is preserved in git history and it is good writing — if vehicle importing
ever returns, restoring it is straightforward.

**Decision needed:** leave it held back, or bring vehicle importing back into
scope and restore it.

---

## 5. Wording worth a second look

None of this is invented and none of it states a term that was not already on
the site. But these are the sentences that carry commercial or legal weight, so
they should be read by the owner and, where marked, by a lawyer.

| Where | Wording | Who should read it |
|---|---|---|
| `/terms` → Quotes | "a quote holds for the period stated on it" | Owner — decide the period and make sure quotes actually state one |
| `/terms` → Your rights | Australian Consumer Law non-excludable guarantees; liability limited to the amount paid | **Lawyer** — this is the one genuinely legal paragraph |
| `/shipping-and-returns` → Used parts | "not sold with a working-life guarantee … what we guarantee is the description" | **Lawyer**, and owner |
| `/shipping-and-returns` → Change of mind | "once a part is bought in Japan it is bought" | Owner — this is a real commercial position |
| `/shipping-and-returns` → Damaged | "We handle the claim with the freight forwarder" | Owner — confirm this is what actually happens |
| `/privacy` → How long we keep it | Retention framed as "while live, then as a record" | Owner |
| How it works → payment stages | Stage 4 says the quote sets out amount and terms | Owner — see below |

### Payment terms specifically

`src/content/legal.js` → `PAYMENT_STAGES` describes **when** money moves (once,
at acceptance) but deliberately does **not** state a deposit percentage, a
payment method or a payment schedule, because none was supplied and inventing
one would be a commercial term made up by a website.

If there is a standard structure — say, payment in full on acceptance, or a
deposit then a balance before shipping — tell me and it goes in. Until then the
site says the quote states the terms, which is true and is the honest floor.

---

## 6. The request form — now stores, still does not notify

**Fixed:** requests are written to a D1 database (`yourjdmparts-requests`) the
moment they validate, so a submission no longer depends on a webhook existing.
Nothing is lost. Read them in the dashboard: D1 → `yourjdmparts-requests` →
Console. `docs/SETUP.md` has the queries.

The customer now gets a reference code, and if **both** delivery routes fail
the success page says so and hands over the phone number rather than thanking
them for something that went nowhere.

**Still worth doing:** D1 does not tap you on the shoulder. Setting
`REQUEST_WEBHOOK` (Workers → `yourjdmparts` → Settings → Variables and
Secrets) to a URL that emails you turns storage into notification. Until then,
check the console daily.

---

## 7. The domain is not pointing at this site

`yourjdmparts.com` is on Cloudflare nameservers but has **no A record and no
`www` CNAME**, so the apex currently serves nothing. The Worker is live and
correct at its `workers.dev` address; the domain simply is not attached to it.

Cloudflare dashboard → Workers → `yourjdmparts` → Settings → Domains & Routes →
add `yourjdmparts.com` and `www.yourjdmparts.com`.

Everything on the site canonicalises to `https://yourjdmparts.com`, so until
this is done the live pages carry `noindex` and none of the SEO work counts.

---

## 8. Analytics — deliberately not wired

No third-party tracker was added, because none is approved for this project.

The five events the audit asked for are emitted as in-page DOM events with a
hard allowlist of parameters (`public/assets/app.js`). Nothing leaves the
browser: no script is loaded, no request is made, no cookie is set, no
identifier is minted. `test/trust.test.mjs` proves the allowlist cannot carry a
name, email, phone number, chassis number, part description, budget, postcode
or filename.

To turn it on later, pick a sink and add one listener:

```js
document.addEventListener('yjp:event', function (e) {
  send(e.detail.name, e.detail.params);
});
```

Note that `/privacy` currently states, as a fact, that the site runs no
analytics and sets no cookies — and `test/privacy.test.mjs` enforces it. Adding
a tracker means updating that page in the same change. That coupling is on
purpose.
