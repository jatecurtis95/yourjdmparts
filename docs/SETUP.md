# Going live — the three things only you can do

Everything here is a browser action. None of it needs a terminal, a
particular computer, or `wrangler` on your machine.

Ordered by what breaks if you skip it.

---

## 1. Reading the part requests ✅ already working

**Nothing to do to start receiving them.** Every validated request is now
written to a Cloudflare D1 database the moment it is submitted, so a form
submission no longer depends on a webhook being configured. The customer gets
a reference code like `YJP-K4M2PT` and you get a row.

### Where they land

Cloudflare dashboard → **Storage & Databases** → **D1** →
`yourjdmparts-requests` → **Console**.

Paste this to see everything still open, newest first:

```sql
SELECT received_at, reference, name, phone, email,
       vehicle_summary, parts_summary, urgency, budget
FROM requests
WHERE handled = 0
ORDER BY received_at DESC;
```

The whole submission — every specialist field, every photograph filename — is
kept in the `payload` column as JSON:

```sql
SELECT payload FROM requests WHERE reference = 'YJP-K4M2PT';
```

Mark one done once you have quoted it:

```sql
UPDATE requests SET handled = 1 WHERE reference = 'YJP-K4M2PT';
```

Count what is waiting:

```sql
SELECT COUNT(*) AS open_requests FROM requests WHERE handled = 0;
```

### What you still want: a notification

D1 means **nothing is ever lost**. It does not tap you on the shoulder — you
have to go and look. Until you set up the step below, check the console daily.

To get pinged instead, set one variable:

Cloudflare dashboard → **Workers & Pages** → `yourjdmparts` → **Settings** →
**Variables and Secrets** → **Add** →
name `REQUEST_WEBHOOK`, value = a URL that emails you.

Any of these give you such a URL in a couple of minutes with no code, and any
of them will do — this is not a recommendation of a particular vendor, just
the shape of the thing:

- a Zapier or Make "Webhooks → Email" scenario
- a Power Automate flow (you are already on Microsoft 365, so this is the
  path of least resistance)
- a form-relay service that accepts JSON and forwards it

The Worker POSTs JSON to it. No redeploy is needed; the change takes effect on
the next request. The database keeps recording either way, so a webhook that
breaks later costs you a notification, not a customer.

### If both fail

The success page stops saying "we have your request". It says the submission
did not reach us and hands over the phone number and the email address
instead. A customer who cannot get through to us should know that, rather than
waiting on a quote that is never coming.

---

## 2. Point the domain at the site ✅ now done by every deploy

`yourjdmparts.com` and `www.yourjdmparts.com` are declared as custom domains
in `wrangler.toml`, so **every deploy attaches them to the Worker**.
Cloudflare creates the DNS records itself and issues the certificate; it
usually takes a few minutes after the deploy finishes. There is nothing to
click in the dashboard, and re-running the deploy re-asserts the domains if
a record is ever changed or deleted by hand.

The site is also live at `https://yourjdmparts.jate-curtis.workers.dev`,
which stays `noindex` — every page canonicalises to
`https://yourjdmparts.com`, and any host that is not that domain is
deliberately kept out of search.

**This will not touch your email.** Custom domains add proxied records for web
traffic only. Your MX record, the SPF record and the `autodiscover` record are
untouched, and Microsoft 365 keeps working exactly as it does now.

> Do **not** turn on Cloudflare Email Routing on this domain. It replaces the
> MX records, which would break Microsoft 365.

**Check it worked:** open `https://yourjdmparts.com/`. Then view source and
confirm there is no `<meta name="robots" content="noindex">`. If the page
loads and that tag is absent, indexing is live.

Then submit the sitemap once, at `https://yourjdmparts.com/sitemap.xml`, in
Google Search Console.

---

## 3. Confirm the mailbox and the Instagram handle

### Email — working, tested 13 August 2026

The domain's mail all routes into the same Microsoft 365 tenant the
business already uses, and a live delivery test established exactly which
addresses exist:

| Address | State | Where it goes |
|---|---|---|
| `jate@yourjdmparts.com` | **Works** | Jate's normal inbox (an alias on the account) |
| `emi@yourjdmparts.com` | **Works** | Emi Yamauchi's inbox |
| `info@yourjdmparts.com` | **Does not exist** | Bounces |

The site therefore publishes **`jate@`** — a published address that bounces
is the exact failure the old site had, and `info@` bounces today.

**To move the site to `info@`:** create it first —
[admin.microsoft.com](https://admin.microsoft.com) → **Teams & groups** →
**Shared mailboxes** → **Add** → `info@yourjdmparts.com`, then add Jate and
Emi as members (free, no licence). Send it a test email, and once that
arrives change `email` in `src/config.js` — one line, everything else
follows it, including the test suite.

### Instagram — not verifiable from here

The site links `instagram.com/yourjdmparts`. Instagram answers logged-out
requests with a redirect to the login page whether a profile exists or not, so
that link could not be checked automatically.

**Do this:** open `https://instagram.com/yourjdmparts` in a private window. If
it is not your account, tell me the real handle.

Wrong here is worse than missing — a link pointing at a stranger's profile is
on every page of the site.

---

## While you are in the dashboard

Two small things worth doing in the same sitting:

- **Set `ADMIN_TOKEN`** if you want the requests export at
  `/admin/requests.csv`. Without it that route stays a 404. Same place as
  `REQUEST_WEBHOOK`, but add it as a **Secret**, not a variable.
- **Protect the preview host.** `yourjdmparts.jate-curtis.workers.dev` serves
  the whole site to anyone with the URL. It sends `X-Robots-Tag: noindex,
  nofollow` so it will not be indexed, but that is not access control. Zero
  Trust → **Access** → **Applications** puts a login in front of it.

---

## What is still waiting on you elsewhere

`docs/OWNER-REVIEW.md` has the rest: the one real case study that switches on
the Recent finds section, the registered entity name and ABN, the payment
terms, and the seven wordings worth a legal read.
