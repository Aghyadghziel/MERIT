# MERIT

The storefront for MERIT, a contemporary fashion label based in Riyadh.

Built around one idea — **quiet structure, expressive movement**. The interface is a set of
hairlines that content hangs from; the photography and the motion carry the personality.

## Running it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build
```

## Stack

- Next.js 16 (App Router, Turbopack) · React 19 · TypeScript
- Tailwind CSS v4 — all tokens live in `src/app/globals.css`
- GSAP + ScrollTrigger for every animation. No smooth-scroll library: native scrolling is
  faster and never fights ScrollTrigger.

## Where things are

| Path | What |
| --- | --- |
| `src/app/globals.css` | Design tokens, the rule system, type scale, motion gate |
| `src/lib/brand.ts` | Wordmark geometry — the letters are drawn, not typeset |
| `tools/logo/build.mjs` | Renders that geometry to `public/brand/*.svg` |
| `src/lib/catalog.ts` | Products, collections and editorial |
| `src/lib/filter.ts` | Facets, filtering and the query-string encoding |
| `src/lib/search.ts` | The weighted predictive search |
| `src/components/providers/` | Bag, wishlist, currency (`Store`), overlays (`Ui`), reveals (`Motion`) |
| `public/img/CREDITS.md` | Photography sources — **attribution incomplete, see the file** |

## The outfit carousel

The homepage's centrepiece is one model in one pose changing jackets. It runs on a strict image
contract in `src/lib/outfits.ts`: one full-frame picture per outfit, same model, same pose, same
light, 1200×1800 on `#F4F2ED` (or transparent), model in the same pixel position. The base frame
never moves; jackets crossfade over it through a mask that admits only the torso and arms.

The frames shipped here are **drawn placeholders** (`tools/outfits/build.mjs`), labelled as such
in the UI. To use photography: drop `base.webp` and `jacket-01…04.webp` into `public/img/outfits/`,
point the `file` fields at them, and set `PLACEHOLDER = false`. Nothing else changes.

## Motion

Three attributes cover most of the page and are driven by one `ScrollTrigger.batch` set per route
in `components/providers/Motion.tsx`:

- `data-reveal` — fade and lift, batched so rows stagger
- `data-reveal-img` — the house image reveal: a mask travelling up, photograph settling out of scale
- `data-reveal-line` — word-masked headline, produced by `<Lines>`

Bespoke timelines (hero, carousel, mega menu, panels, the product story) live with their
components. Everything respects `prefers-reduced-motion`, and the hidden-until-revealed state is
set in CSS behind `prefers-reduced-motion: no-preference` with a `<noscript>` fallback, so the page
is never left blank.

## Honest by design

Online payment, accounts and order history are not connected yet, and the site says so ("coming
soon") in those places rather than imitating them. Until then, checkout and the contact and
newsletter forms open a ready email to MERIT.
