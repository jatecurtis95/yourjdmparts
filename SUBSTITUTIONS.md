# Substitutions

The rebuild brief was written for an agent with the Your JDM Parts design
system checked out alongside the repo — `styles.css`, `tokens/`,
`components/*.prompt.md`, `ui_kits/storefront/index-loud.html`,
`CatalogueScreen.jsx`, `PartScreen.jsx`, `OrderScreen.jsx`,
`index-editorial.html`, the `Logo` component and
`assets/pattern-seigaiha.svg`.

**None of those files were available.** Only the brief itself was.

Everything below was therefore derived from the brief's written rules rather
than read from the source system. Each item is isolated so that dropping in
the real asset is a swap, not a rewrite. Everything *not* listed here came
straight from the brief and is not a guess.

---

## 1. Typefaces — derived

The brief names three roles but no families. The owner asked for no
typefaces associated with AI products, which rules out Inter in particular.

| Token | Family | Why |
|---|---|---|
| `--font-display` | Source Serif 4 | Editorial, sturdy, lining figures that hold up in `A$1,480` |
| `--font-condensed` | Barlow Condensed 600–900 | Goes genuinely heavy for the mega headline; industrial, not boy-racer |
| `--font-ui` | IBM Plex Sans | Drawn for technical documentation — right register for spec tables |
| `--font-mono` | IBM Plex Mono | **Not in the brief's three-font list**, but the Home spec requires part numbers in mono |

All four are OFL and **self-hosted** in `public/assets/fonts/` (latin subset,
232 KB total). No third-party font request leaves the visitor's browser.

**To swap:** replace the files in `public/assets/fonts/`, update
`public/assets/fonts.css`, and change the four `--font-*` values in
`tokens.css`. Nothing else references a family name.

## 2. Spacing, radius and type scale — derived

The brief says "do not invent … radii or spacing" but does not supply the
scales. Built as a 4px-based space scale (`--space-1` … `--space-10`), a
restrained radius scale (2/4/8px, because the system is flat), and a type
scale in `tokens.css`.

**To swap:** overwrite those blocks in `tokens.css`.

## 3. The torii mark — derived

Drawn from scratch as a myojin-style torii in a 100×100 box: kasagi with
upturned ends, straight shimaki, inward-leaning posts, nuki, and the Sunrise
sun disc in the upper opening. Verified legible at the 40px minimum.

The mark is **pure geometry with no text**, so it renders identically inline,
as a favicon and in an OG image. Wordmarks are real HTML type so they pick up
`--font-condensed` and stay selectable.

Four lockups (`horizontal`, `vertical`, `mark`, `tile`) each with a `mono`
build, per the brief. The mono build drops the sun entirely rather than
tinting it.

> **This is the one substitution that is visible brand identity.** If a real
> torii exists, replace `TORII_GEOMETRY` in `src/components/logo.js` and
> regenerate `public/assets/logo/*.svg`. Everything else about the logo —
> lockups, clear space, minimum size, mono rules — already matches the brief.

## 4. The seigaiha tile — derived

`public/assets/pattern-seigaiha.svg`, generated geometrically: fans of radius
25 in a 100-unit tile, rows offset half a fan, four nested arcs each, drawn
back-to-front through an SVG `<mask>` so each fan occludes the one behind it
while the tile stays transparent. Tiles seamlessly in both axes.

Applied exactly as specified: 350px repeat, 6% opacity, through a dedicated
absolutely-positioned layer.

## 5. Reference screens — not available

`index-loud.html`, `CatalogueScreen.jsx`, `PartScreen.jsx`, `OrderScreen.jsx`
and `index-editorial.html` could not be read. Each screen was built to the
brief's written description of it instead. Where the brief is specific
(three-line mega headline, "Landed this week" before marketing, tabbed
`SpecTable`, bone-fill register on checkout) that description was followed
literally.

## 6. Hero media — a decision, not a substitution

The owner asked to use an openhero design. The one automotive hero in that
library (`high-performance-automotive-dynamics`) was audited and conflicts
with the design system directly:

| openhero file | Design system |
|---|---|
| 6 × `linear-gradient`, 3 × `radial-gradient` | "Flat only. No gradients" |
| 3 × `box-shadow` | "The only shadow in the system is on the modal" |
| `@keyframes scroll-reveal`, `kinetic-shimmer` | "No scroll reveals"; ticker is the only sanctioned keyframe |
| "liquid asphalt… raw kinetic energy" | "No racing metaphors" |
| Video on `videos.openhero.art`, Tailwind via CDN | Third-party runtime dependency |

Its *structural* idea — full-bleed cinematic media with the headline anchored
over it — was kept and rebuilt natively. The hero is **media-optional**: with
`HERO_MEDIA` empty it renders as the patterned Midnight ground the brief
specifies; set `video` and/or `poster` in `src/config.js` and it becomes
full-bleed behind a **flat** Midnight scrim (`--midnight-86`), never a
gradient. No third-party CDN is involved either way.

## 7. Brand logos — missing, and needed

`src/data/brands.js` lists 29 marques. Every one has `logo: null`, so the
cards and the home-page strip currently set the brand **name in the site's
own condensed face** instead of showing a mark.

That fallback is deliberate rather than a placeholder to be tolerated: an
approximated or redrawn logo would misrepresent someone else's trademark.
Typeset names are honest and look intentional in this system.

The logos on the existing yourjdmparts.com could not be retrieved — the
domain is blocked by this environment's egress proxy, and the site is not on
the Cloudflare or Vercel accounts this session can see. **The files need to
be supplied.** Drop them in `public/assets/brands/` and set the `logo` path
in `src/data/brands.js`; that directory's README covers the format.

## 8. No catalogue data — by design

The site holds no stock, so there is no product catalogue to populate.
`src/data/catalogue.js` describes **part types we source**, not items we
have. There are no prices, no stock counts and no SKUs anywhere in the data,
and there are tests that fail if any appear.

## 9. Not built, and why

- **Payment capture.** There is nothing to check out. Quoting happens by
  email after we have found the part, so a cart would be pretending. If
  deposits are taken later, that is a payment-provider decision and live
  keys, which are the owner's to make.
- **Photo storage for part requests.** The upload field is present and files
  are accepted and recorded; persisting them needs an R2 bucket. The
  confirmation screen tells the sender where to email photographs meanwhile.
- **Request delivery.** Validated submissions POST to `REQUEST_WEBHOOK` if it
  is set, and are logged otherwise. One secret, one integration point.

## 10. Settled with the owner

Two things the brief and the previous live site disagreed on, decided
2026-08-10:

- **The name is Your JDM Parts.** The site it replaced was JDM Bridge, and
  the contact email (`info@jdmbridge.com.au`) and Instagram
  (`@jdmbridge_au`) are still on that name. They are used as-is because
  they work; swapping them is a one-line change in `src/config.js`, which
  carries a comment saying so.
- **Parts only.** JDM Bridge also did vehicle imports, auction sourcing,
  compliance and registration. None of that is claimed here, and the
  "sister company to JDM Connect" line the brief asked for has been removed
  from the footer, How it works and the enquiry form.
