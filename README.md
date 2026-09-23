# MERIT

A concept storefront for a fictional contemporary fashion label based in Riyadh.

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
| `src/lib/catalog.ts` | Products, collections and editorial. All invented |
| `src/lib/filter.ts` | Facets, filtering and the query-string encoding |
| `src/lib/search.ts` | The weighted predictive search |
| `src/components/providers/` | Bag, wishlist, currency (`Store`), overlays (`Ui`), reveals (`Motion`) |
| `public/img/CREDITS.md` | Photography sources — **attribution incomplete, see the file** |

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

There is no payment processor, no authentication and no order history, and the site says so
in those places rather than imitating them. Prices, stock, mills, counts and stores are invented.
