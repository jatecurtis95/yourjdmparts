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

## 2. Point the domain at the site ⚠️ this is why nothing is indexed

`yourjdmparts.com` sits on Cloudflare nameservers but has **no A record and no
`www` record**, so the apex serves nothing at all today. The site itself is
live and correct at
`https://yourjdmparts.jate-curtis.workers.dev`.

Every page canonicalises to `https://yourjdmparts.com`, and any host that is
not that domain is deliberately marked `noindex`. So until this is done, none
of the SEO work counts for anything.

**Do this:**

Cloudflare dashboard → **Workers & Pages** → `yourjdmparts` → **Settings** →
**Domains & Routes** → **Add** → **Custom domain**.

Add both, one at a time:

- `yourjdmparts.com`
- `www.yourjdmparts.com`

Cloudflare creates the DNS records itself and issues the certificate. It
usually takes a few minutes.

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

### Email — very likely already working

The domain's DNS shows a fully provisioned Microsoft 365 tenant:

| Record | Value | Means |
|---|---|---|
| MX | `yourjdmparts-com.mail.protection.outlook.com` | Mail is routed to Microsoft 365 |
| TXT | `MS=ms77363601` | Domain ownership verified with Microsoft |
| TXT | `v=spf1 include:spf.protection.outlook.com ~all` | Microsoft is authorised to send as you |
| CNAME | `autodiscover` → `autodiscover.outlook.com` | Mail clients can configure themselves |

So the domain accepts mail. What DNS cannot tell anyone is whether the
**`info@`** mailbox specifically exists inside that tenant.

**Do this:** send an email from your phone to `info@yourjdmparts.com`. If it
arrives, the site is correct as published. If it bounces, create the mailbox
or the alias in Microsoft 365 — or tell me a different address and it is a
one-line change.

This matters because it is the exact failure the old site had: the previous
address was on a domain that no longer exists, so every message sent to it had
been bouncing.

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
