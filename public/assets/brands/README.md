# Brand logos

Drop supplier logo files in here and point `logo` at them in
`src/data/brands.js`, for example:

```js
{ slug: 'tein', name: 'Tein', logo: '/assets/brands/tein.svg', ... }
```

**Until a file exists, the brand name is set in the site's own condensed
face instead.** That is deliberate. An approximated or redrawn logo would
misrepresent someone else's trademark, so the fallback is honest type
rather than a guess at their mark.

## What is here already

Seven marks recovered from the previous site: bride, hks, momo, mugen,
rays, spoon-sports, tein. The other 23 brands still fall back to type.

These arrive as black-on-transparent artwork drawn for a light background,
and `rays.svg` carries its own brand colour. They are painted through a CSS
`mask-image` rather than shown as an `<img>`, so the shape stays exact
while the colour comes from a token — that is what makes them legible on
the navy panel without introducing a sixth colour into the palette.

A consequence worth knowing: **multi-colour logos render as one colour.**
That is deliberate, not a bug. The palette rule allows no sixth colour.

Marks that are roughly square (MOMO is 0.97:1 where the others are 1.7–6.3)
read as smaller beside wide wordmarks, because `mask-size: contain` fits
them by height. MOMO is therefore listed but kept out of the home strip.

## What to supply

- **SVG preferred**, PNG at 2× otherwise.
- **Single colour, light** — these sit on a dark navy panel. A white or
  bone one-colour version reads best; full-colour logos with white
  backgrounds will look like stickers.
- Trim the artboard to the mark itself. Padding is applied by the card.
- Displayed at up to 64px tall on a brand card, 40px in the home strip.

## A note on usage

We are a sourcing service, not a distributor or authorised reseller. Using
a manufacturer's logo to indicate that we source their parts is normally
fine as nominative reference, but check anything a supplier has given you
specific terms about.
