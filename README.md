# Chaska

The website for Chaska — a Punjabi family restaurant at 14355 Francis Lane,
Frisco, Texas, serving the Dallas–Fort Worth area.

**eatchaska.com**

Built from the Claude Design project **Chaska Restaurant Web Design**
(`7391c903-8037-4740-b3a3-a1c0a1906a52`). The three source artboards are kept
verbatim in [`design-source/`](design-source/) as the visual reference. They are
never imported by application code.

```bash
npm install
npm run dev          # http://localhost:3000
npm run verify       # lint · typecheck · unit tests · build
npm run test:e2e     # Playwright: 4 routes x 3 viewports, axe, link integrity
```

Requires Node ≥ 22.6 (the setup scripts are TypeScript run directly through
Node's type stripping). Developed on Node 24.13.

---

## Before this goes live

All four placeholder groups are cleared — domain, phone, email and address are
real — so `NEXT_PUBLIC_SITE_ENV=production npm run build` succeeds. The guard in
`scripts/check-placeholders.mjs` stays armed to catch any future regression.

Two items remain, neither of which blocks a build or a deploy:

- **A photograph of Ronika Singh.** The About artboard's `about-ronika` slot is
  genuinely empty, so the page ships a designed empty frame rather than a stock
  photo of a stranger. See "Adding the owner's portrait" below.
- **Owned photography.** All six food photographs are Creative Commons and
  legally require the `/credits` page and `ATTRIBUTION.md`. Replacing them with
  the restaurant's own removes that obligation entirely.

Worth doing at some point: `ronikajit@gmail.com` is a personal address on a
public site and in a public repository. A forwarding mailbox on `eatchaska.com`
would let it be retired by editing one field.

### Location wording

The restaurant is in Frisco; the copy says so. "Dallas–Fort Worth" appears only
as `site.metroArea`, used in the search description and as schema.org
`areaServed`, because that is the area the catering side actually covers. The
schema.org `PostalAddress` is the real Frisco address — getting that wrong is
what breaks Google Maps and local search.

------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `url` | The production domain. Still `chaskadallas.com`, which is a placeholder — and worth reconsidering now that the address is in Frisco. |

Set its `"placeholder"` flag to `false` once the domain is real. Phone, email
and address are done.

Two more, which do not block a build:

- **A photograph of Ronika Singh.** The About artboard's `about-ronika` slot is
  genuinely empty, so the page ships a designed empty frame rather than a stock
  photo of a stranger. See "Adding the owner's portrait" below.
- **Owned photography.** Every current photograph is Creative Commons and
  legally requires the `/credits` page and `ATTRIBUTION.md`. Replacing them with
  the restaurant's own removes that obligation entirely.

### Location wording

The restaurant is in Frisco; the copy says so. "Dallas–Fort Worth" appears only
as `site.metroArea`, used in the search description and as schema.org
`areaServed`, because that is the area the catering side actually covers. The
schema.org `PostalAddress` is the real Frisco address — getting that wrong is
what breaks Google Maps and local search.

------------------------------------- | --------------------------------------------------------------------------------------------- |
| `url` | The production domain |
| `contact.phone` | A real number — `(214) 000 0000` is from the artboard |
| `contact.email` | Confirm `hello@` and `catering@chaskadallas.com` exist |
| `contact.address` | Street address and postal code. None is invented anywhere, including in the schema.org markup |

Set that group's `"placeholder"` flag to `false` once it is real.

Two more, which do not block a build:

- **A photograph of Ronika Singh.** The About artboard's `about-ronika` slot is
  genuinely empty, so the page ships a designed empty frame rather than a stock
  photo of a stranger. See "Adding the owner's portrait" below.
- **Owned photography.** Every current photograph is Creative Commons and
  legally requires the `/credits` page. Replacing them with the restaurant's own
  photographs removes that obligation entirely.

---

## Architecture

```
design-source/          Imported artboards. Reference only.
src/
  app/                  Routes. Two group layouts differ only in masthead size.
    (home)/             /            — tall masthead + tagline
    (site)/             /menu /about /credits — compact masthead
    globals.css         @theme tokens, @utility, base layer
  components/
    ui/                 Primitives: Container, Section, Rule, Kicker, Button, …
    layout/             Masthead, SiteNav, SiteFooter, Logotype, SkipLink
    media/              Figure, ImageFrame, EmptyFrame
    sections/           Composed blocks: DishGrid, MenuCourse, NoticeCard, …
  content/              JSON data + Zod schemas + typed accessors
    generated/images.ts GENERATED — do not edit
  lib/                  cn, format, routes, seo, jsonld
  assets/images/        GENERATED — vendored photographs, committed
scripts/                fetch-images, check-placeholders
tests/ e2e/
```

**Layering.** `content/` never imports `components/`. `components/ui` never
imports `components/sections`. A page file is a layout declaration — no menu
price or phone number is ever typed into JSX.

**Content.** Data lives in `src/content/*.data.json`, is validated by Zod at
module load, and is read _only_ through the accessors in `src/content/index.ts`.
A malformed file fails the build with a path-precise error. Moving to a CMS
later means reimplementing those five functions and nothing else.

---

## Design system

Extracted from the artboards, not from `design-source/_ds/`. That bundled
"Modernist" design system is dead code — its `_ds_bundle.js` exports zero
components, no page links its stylesheet, and its tokens (Archivo, vermilion
`#ec3013`) contradict the site's actual look. It was deliberately not ported.

Tokens live in one place, `src/app/globals.css`, as a Tailwind v4 `@theme`
block. Tailwind's default colour and font palettes are cleared there, so
`text-blue-500` is a visible mistake rather than a silent one.

| Token             | Value                 | Contrast on paper |
| ----------------- | --------------------- | ----------------- |
| `paper`           | `#f7f3ea`             | —                 |
| `ink`             | `#1a1712`             | 16.14:1           |
| `ink-secondary`   | `#3d382f`             | 10.51:1           |
| `oxblood`         | `#8b1e1e`             | 8.24:1            |
| `ink-muted`       | `#5c554a`             | 6.65:1            |
| `rule` / `leader` | `#c9c0af` / `#a89e8c` | decorative only   |

Type: **Libre Caslon Display** (headings, wordmark), **Libre Caslon Text**
(body), **Libre Franklin** (all uppercase letterspaced UI), **Noto Serif
Gurmukhi** (ਚਸਕਾ, ਮੀਨੂ). Self-hosted via `next/font`; the artboards used a
blocking Google Fonts `<link>`.

The nine `clamp()` display sizes and the section-padding ladder from the
artboards are named theme values (`text-lead`, `py-sec-md`, `gap-x-gap-split`),
so no component re-types a `clamp()`.

---

## Common tasks

### Change the menu

Edit `src/content/menu.data.json`. Seven courses, 86 dishes.

- **Prices are optional** and currently absent everywhere. Adding them is a data
  edit — `{"price": {"amount": 15, "currency": "USD"}}` — and `MenuRow` brings
  back the dotted leader and figure with no layout change. The leader is drawn
  only when there is a price for it to lead to; a dotted rule running to nothing
  reads as a missing value rather than a design.
- **`layout`** picks the presentation: `columns` for the long name-only courses,
  `stack` for the narrow two-up pair, `grid` for rows with descriptions.
- **`nonVeg: true`** marks a meat or fish dish inside an otherwise vegetarian
  course; a test enforces that every such dish is flagged.
- **`origin`** adds a small label for dishes that are not Punjabi — South
  Indian, Bengali, Mumbai.

The menu page reads courses by `layout`, never by index. An earlier version
destructured `menu.courses` positionally and silently dropped three of the seven
courses when the menu grew.

`tests/content/content.test.ts` asserts the course names and the dish count, so
update it when the menu genuinely changes.

### Replace a photograph

Drop a JPEG over the file in `src/assets/images/` keeping the same name, then
edit its `credit` entry in `src/content/generated/images.ts` — or, for an owned
photograph, remove the Commons entry from `SOURCE_FILES` in
`scripts/fetch-images.ts` first so a re-run does not overwrite it.

### Adding the owner's portrait

1. Put the file at `src/assets/images/ronika-singh.jpg`.
2. Add it to `images` in `src/content/generated/images.ts` under the id
   `about-ronika` (no `credit` needed if it is owned — adjust `ImageCredit`
   accordingly).
3. Set `owner.figure.imageId` to `"about-ronika"` in
   `src/content/about.data.json`.

`Figure` switches from `EmptyFrame` to the photograph automatically.

### Re-fetch the Commons photographs

```bash
npm run images:fetch
```

Resolves each file through the Commons API, pulls author and licence, downloads
the original, **scales only** (never crops or re-tones — so no ShareAlike
obligation on an adapted work is triggered), and regenerates the manifest.
Output is committed, so `npm ci && npm run build` needs no network.

---

## Departures from the artboards

Each was a defect in the source, not a preference:

1. **Button hover.** The artboards let the global `a:hover { color: #8b1e1e }`
   apply to solid ink buttons — oxblood on near-black, **1.96:1**, effectively
   invisible. Each variant now declares its own hover.
2. **Touch targets.** Nav links and buttons were ~13px text with no padding.
   All interactive targets now clear 44px; an e2e test enforces it.
3. **Menu semantics.** Rows were `<div>`s. They are now `<dl>`/`<dt>`/`<dd>`,
   the dotted leaders are `aria-hidden`, and prices carry a spoken currency.
4. **`aria-current`** was hardcoded per file and would drift. It is derived from
   the route.
5. **Skip link and focus rings** did not exist. Both added.
6. **Topbar on mobile.** `justify-content: space-between` squeezed three
   letterspaced phrases into thirds on a phone. They now stack as centred lines
   below `sm`; nothing is hidden.
7. **Dish-card dividers.** `border-right` on the first two cards left a dangling
   rule whenever the grid wrapped. The divider now appears only from `lg`, where
   three columns are guaranteed.
8. **Typographic quotes.** Straight `'` and `"` — an HTML-authoring artifact —
   are curled consistently across all prose.

Everything else is faithful. Fidelity is verified mechanically, not by eye:
`design-source/` is served over HTTP, rendered in the same headless Chromium as
the built site, and computed styles are diffed element-by-element at 1440px
(`fontSize`, `lineHeight`, `letterSpacing`, `color`, every margin, padding and
border). That diff is currently **zero** apart from the two changes above:
the 44px targets, and the `-my-3` that widens the "Full menu" hit area without
moving anything (row height and the gap below it both stay identical).

Two subtleties that diff caught and are worth not re-breaking:

- **`Container` must stay `box-content`.** The artboards have no `box-sizing`
  reset, so their column is 1240px of _content_ with the gutter outside it.
  Under Tailwind's border-box preflight the same markup yields a 1144px column —
  8% narrower, which changes every line break on the site.
- **Line-height tokens are mostly `normal` on purpose.** The artboards set no
  line-height on kickers, headings, dish names or prices. Forcing one (1.2 on a
  12px kicker) made every kicker block 3–6px too tall. Elements that genuinely
  need a fixed leading — the ruled figcaption, the 44px targets, the Visiting
  labels — declare it themselves. Note that Tailwind's `leading-normal` is
  **1.5**, not `normal`; use `leading-[normal]`.

---

## Generated images

`app/icon.tsx`, `app/apple-icon.tsx` and the per-segment `opengraph-image.tsx`
files render through `next/og` at build time, using the TTFs vendored by
`npm run fonts:fetch` into `src/assets/fonts` (SIL OFL 1.1, licence included).

Two constraints, both found the hard way:

- **satori cannot parse the upstream variable builds** of Libre Franklin and
  Noto Serif Gurmukhi — it throws `Cannot read properties of undefined
(reading '256')`. The fetch script pins each to a single weight with
  `fontTools.varLib.instancer` before writing it, so only static instances are
  committed.
- **The OG image needs one route file per page segment.** Next _replaces_, never
  deep-merges, a child segment's `openGraph` object; since every page sets one
  through `buildMetadata`, a single root-level `opengraph-image` is dropped from
  the resolved metadata. Each page segment re-exports the shared implementation
  in `src/lib/og-card.tsx`. An e2e test asserts `og:image` on all four routes.

## Target sizes

- Navigation, buttons and standalone links: **44px** (WCAG 2.5.5 AAA).
- Other content links: **24px** (WCAG 2.5.8 AA).
- Links whose height is constrained by the line-height of surrounding text —
  the phone number and email inside the Visiting block — are exempt under
  2.5.8's inline exception. They are listed explicitly in `e2e/a11y.spec.ts` so
  the exemption is a decision rather than an oversight.

## Notes on dependencies

- **TypeScript is pinned to 5.9.3.** `latest` is 7.0.2, but
  `typescript-eslint@8.67` peer-requires `>=4.8.4 <6.1.0`; TS 7 breaks typed
  linting today.
- **ESLint is pinned to 9.39.5.** `eslint-plugin-jsx-a11y` (a dependency of
  `eslint-config-next`) supports ESLint 9 at most, so ESLint 10 cannot resolve.
- **jsdom is pinned to 29.1.1.** jsdom 30 requires Node ≥ 24.15.

---

## Testing

- **Unit** (`tests/`, Vitest + Testing Library): content schemas and counts
  against the artboards, image-credit completeness, `cn` class-group merging,
  `MenuRow` semantics, `SiteNav` active state, `Figure` empty state, button
  variants and link handling.
- **E2E** (`e2e/`, Playwright at 1440 / iPad Mini / iPhone SE):
  - `smoke` — routes render, one `h1` each, site frame present, 18 dishes.
  - `links` — no `.dc.html` survives, every internal link returns 200, the
    `/menu#catering` anchor lands on screen, a styled 404, dialable `tel:`.
  - `a11y` — axe WCAG 2.1 A/AA with zero violations per route, skip-link focus
    order, visible focus, and the target-size policy on **every** route.
  - `production` — `og:image` and `twitter:image` resolve on all four routes,
    icon and apple-touch-icon resolve, `/credits` is reachable from the footer,
    declared route anchors exist, security headers set, sitemap complete.
  - `resilience` — 320px reflow (WCAG 1.4.10, below the smallest device),
    no-JS rendering, hover contrast on solid buttons, reduced motion.

## Licensing

The site code in this repository has no open-source licence granted; it is the
property of the restaurant. The third-party assets it vendors do carry licences,
and they travel with the files:

| Asset                                                                           | Licence                                                           | Where the terms live                                           |
| ------------------------------------------------------------------------------- | ----------------------------------------------------------------- | -------------------------------------------------------------- |
| Six photographs in `src/assets/images`                                          | CC BY 2.0 / 2.5 and CC BY-SA 2.0 / 4.0 — **attribution required** | `src/assets/images/ATTRIBUTION.md`, and `/credits` on the site |
| Libre Caslon Display, Libre Franklin, Noto Serif Gurmukhi in `src/assets/fonts` | SIL Open Font License 1.1                                         | `src/assets/fonts/OFL.txt`                                     |
| The same three families plus Libre Caslon Text, served to pages by `next/font`  | SIL Open Font License 1.1                                         | upstream Google Fonts                                          |

If you copy an image out of this repository, the credit in `ATTRIBUTION.md` has
to go with it. The vendored copies are scaled only — never cropped, re-toned or
otherwise adapted — so each remains the photographer's own work under its stated
licence, and no ShareAlike obligation on a derivative is triggered.

Replacing these photographs with the restaurant's own removes the obligation
entirely; see "Replace a photograph" above.

## Deployment

Vercel, zero config. Framework, build command and install command are all
detected; there is no `vercel.json`.

Set **`NEXT_PUBLIC_SITE_ENV=production`** on the Vercel production environment.
That arms the placeholder guard, so any future deploy that reintroduces
artboard contact details fails the build instead of shipping.

`NEXT_PUBLIC_SITE_URL` is optional and only needed to point a staging
deployment at its own origin. Resolution order — explicit override, then the
configured domain, then the deployment origin, then the configured value — is
pinned by `tests/content/site-url.test.ts`.

Node: `engines` requires ≥ 22.18, the first version where TypeScript type
stripping is on by default, since `npm run images:fetch` and
`npm run fonts:fetch` are TypeScript run directly by Node. The `prebuild` guard
is deliberately plain JavaScript so the build itself never depends on that.
