# Chaska

The website for Chaska — a Punjabi family kitchen in Frisco, Texas, serving the
Dallas–Fort Worth area with pickup orders and catering.

**eatchaska.com**

Built from the Claude Design project **Chaska Restaurant Web Design**
(`7391c903-8037-4740-b3a3-a1c0a1906a52`). The four source artboards — Home,
Menu, Order, About — are kept verbatim in [`design-source/`](design-source/) as
the visual reference. They are never imported by application code.

```bash
npm install
npm run dev          # http://localhost:3000
npm run verify       # lint · typecheck · unit tests · build
npm run test:e2e     # Playwright: 5 routes x 3 viewports, axe, link integrity
```

Requires Node ≥ 22.18 (the setup scripts are TypeScript run directly through
Node's type stripping, on by default from that release). Developed on Node 24.13;
`.nvmrc` pins 24.

---

## Before this goes live

Outstanding work is tracked in **[LAUNCH.md](LAUNCH.md)** — what is done, what I
can still do, and what only you can. The short version: the site is live on
`eatchaska.com` and `www.eatchaska.com`, every placeholder is cleared, and every
photograph is the kitchen's own.

### Location wording

The kitchen is in Frisco; the copy says so. "Dallas–Fort Worth" appears only
as `site.metroArea`, used in the search description and as schema.org
`areaServed`, because that is the area the catering side actually covers.

No street address is published anywhere — not on the page, not in the
structured data — by decision. `site.contact.address` holds only the town,
state and country, and the schema has no field for a street, so one cannot
creep back in through a data edit. The schema.org `PostalAddress` is
town-level, which schema.org accepts.

### Placeholder guard

`scripts/check-placeholders.mjs` runs before every build and refuses a
production build (`NEXT_PUBLIC_SITE_ENV=production`) while any field group in
`src/content/site.data.json` still carries `"placeholder": true`. All four
groups — `url`, `contact.phone`, `contact.email`, `contact.address` — are real
today; the guard stays armed against a future regression.

---

## Architecture

```
design-source/          Imported artboards. Reference only.
src/
  app/                  Routes. Group layouts differ only in the masthead.
    (home)/             /                           — tall masthead + tagline
    (site)/             /menu /order /catering /about — compact masthead
    globals.css         @theme tokens, @utility, base layer
  components/
    ui/                 Primitives: Container, Section, Heading, Kicker, Prose, Button, icons
    layout/             Masthead, Topbar, SiteNav, SiteFooter, InstagramLink, Logotype, SkipLink
    media/              Figure, ImageFrame, EmptyFrame
    sections/           Composed blocks: DishSummary, DishGrid, MenuCourse, CourseHeading, …
    order/              The Order page: order bar, cart store and provider, cards, drawer, checkout
  content/              JSON data + Zod schemas + typed accessors + image manifest
  lib/                  cart, categories, daily-menu, shopify, checkout, cn, format, routes, seo, jsonld
  assets/images/        The kitchen's photographs, committed
scripts/                check-placeholders, fetch-og-fonts
tests/ e2e/
```

**Layering.** `content/` never imports `components/`. `components/ui` never
imports `components/sections`. A page file is a layout declaration — no price
or phone number is ever typed into JSX.

**Content.** Data lives in `src/content/*.data.json`, is validated by Zod at
module load, and is read _only_ through the accessors in `src/content/index.ts`.
A malformed file fails the build with a path-precise error, and so does a page
naming a dish or a photograph that does not exist.

**One dish, one record.** The eleven photographed dishes live once, in
`dishes.data.json`: name, photograph, category, the Menu page's line, the Order
card's shorter line where the design gives one, and the price. The home page,
the Menu page's signature section, the Order page and the structured data all
read that record by id.

**Categories belong to the dish.** `dishes.data.json` lists the categories
(Shuruaat, Ghar di Rasoi, Chaat te Sliders, Mitha) in page order, and each dish
names one. The Order page groups whatever is on sale today with
`groupByCategory` in `src/lib/categories.ts`: groups follow the category list,
an empty category is left out, and a dish with an unknown category is listed
last under "Hor · More from the kitchen" rather than dropped. The Menu page's
signature bands name categories, never dishes, so a dish appears in exactly one
place.

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
artboards are named theme values (`text-hero`, `py-sec-md`, `gap-x-gap-split`),
so no component re-types a `clamp()`.

---

## Common tasks

### Change the signature dishes or their prices

Edit `src/content/dishes.data.json`. A new dish needs a `category` from the
`categories` list there. Each dish is sold either as a container —
`{"kind": "container", "small": 9, "large": 16}`, a 16 oz pint and a 32 oz
quart — or by the piece — `{"kind": "each", "unit": "Per dabeli", "each": 5}`.
Prices are whole dollars. `menu.data.json` sets out the signature section by
category, and `home.data.json` picks three dishes for "From the Kitchen".
With Shopify connected, the prices customers pay are Shopify's (see below).

### Change the full menu

Edit `courses` in `src/content/menu.data.json`. Seven courses, 86 dishes.

- **Prices are optional** and absent everywhere on the full menu. Adding them is
  a data edit — `{"price": {"amount": 15, "currency": "USD"}}` — and `MenuRow`
  brings back the dotted leader and figure with no layout change.
- **`layout`** picks the presentation: `columns` for the long courses, `stack`
  for the narrow two-up pair, `grid` for rows with descriptions.
- **`nonVeg: true`** marks a meat or fish dish inside an otherwise vegetarian
  course; a test enforces that every such dish is flagged, signature dishes
  included.
- **`origin`** adds a small label for dishes that are not Punjabi — South
  Indian, Bengali, Mumbai.
- **`description`** is a canonical one-line definition of the dish, researched
  rather than invented. Four dishes have none on purpose;
  `tests/content/content.test.ts` names them.

The menu page reads courses by `layout`, never by index. An earlier version
destructured `menu.courses` positionally and silently dropped three of the seven
courses when the menu grew.

### Today's menu and Shopify checkout

The Order page ("Today's Menu") sells one of two things, decided by three
environment variables on the Vercel project:

| Variable                          | Example                     |
| --------------------------------- | --------------------------- |
| `SHOPIFY_STORE_DOMAIN`            | `your-store.myshopify.com`  |
| `SHOPIFY_STOREFRONT_ACCESS_TOKEN` | the public Storefront token |
| `SHOPIFY_MENU_COLLECTION`         | `daily-menu`                |

**All three set:** the page lists the products in that collection, re-read
from Shopify's Storefront API (version 2026-04) at most once a minute, and
"Checkout" creates a Shopify cart and opens Shopify's own checkout. Payment,
pickup details and the receipt are Shopify's. Change the collection each day
and the page follows.

How a product becomes a dish (`src/lib/daily-menu.ts`):

- **Handle = dish id.** A product with handle `dahi-bhalla` uses our name,
  line, photograph and category; Shopify supplies only availability and price.
  So categories hold however the daily menu is shuffled.
- **Sizes** are variants with an option value of `Small` and `Large` (the
  option can be called anything, e.g. Size). A product with one variant is sold
  singly. If one size is sold out, the other is sold on its own as
  "Large · 32 oz". Any other variant shape, or a non-USD price, leaves the
  product off with a warning in the logs instead of guessing a price.
- **A product we have no record of** is still sold, with its Shopify title,
  description and image, under the category its **product type** names
  (`Small plates`, `Shuruaat` or `small-plates` all work), else under "More".
- **If Shopify cannot be read**, or the collection does not exist, the page
  says today's menu could not load and gives the kitchen's number. It never
  falls back to the static list, which could sell something not on today's
  menu. An empty collection says nothing is on the menu yet.

**Any of them missing:** the page sells the catalogue in `dishes.data.json`
and orders go out by message, as described next. This is how the site runs
until Shopify is connected.

The token is read only on the server (no `NEXT_PUBLIC_` prefix), and checkout
runs through a server action, so the Content-Security-Policy is unchanged.
Product images from `cdn.shopify.com` are allowed in `next.config.ts`.

### How an order reaches the kitchen (without Shopify)

There is no server. "Place pickup order" writes the order out as plain text and
opens the customer's messaging app with it addressed to the kitchen's number —
or, on a mouse-driven device, their email app addressed to the kitchen's email.
The order arrives when the customer presses send; the confirmation view says so
and keeps both "Send by text" and "Send by email" one tap away. The message is
built by `orderMessage` in `src/lib/cart.ts`.

The cart is kept in `localStorage` under the design's key,
`chaska-order-cart-v1`, so a refresh does not lose it.

### Replace a photograph

Drop a JPEG over the file in `src/assets/images/`, keeping its name. Each file
is one entry in `src/content/images.ts`, keyed by what it shows;
`tests/content/images.test.ts` fails if a file and the manifest disagree. The
dish photographs are cropped from the @tasteofchaska Instagram posts the design
was built from, at 1159–1260px wide.

### Add Snoopy's photograph

The design leaves Snoopy's frame empty, so the About page shows the designed
empty frame. Add the file to `src/assets/images/`, add an entry to
`src/content/images.ts`, and set `family.figure.imageId` in
`src/content/about.data.json`. `Figure` switches to the photograph on its own.

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
   letterspaced phrases into thirds on a phone. Below `sm` it is one line —
   place and Instagram — and the descriptor, also in the footer, returns
   from `sm` up.
7. **Typographic quotes.** Straight `'` and `"` — an HTML-authoring artifact —
   are curled consistently across all prose.
8. **Home page.** Cut to what a visitor comes for: one line on what Chaska
   is, "Order for pickup" and "Catering" on the first screen of a phone, three
   dishes, and a short line on the family. The design's long lead, family
   feature and catering notice were removed by the owner's decision.
9. **Order size picker.** The design's `role="radio"` buttons are real radio
   inputs, styled identically, so arrow keys and screen readers work natively.
10. **Cart drawer.** A native modal `<dialog>` rather than a positioned `div`:
    it traps focus, closes on Escape and returns focus to the cart button.
11. **Order confirmation.** The design says "Order received". Nothing is
    received until the customer sends the message, so the view says "Send your
    order" and offers both ways to send it.
12. **Phone number.** The design removes it; it stays in the footer on every
    page, by the owner's decision, since orders are confirmed by text.
13. **Menu page.** The design lists only the eleven photographed dishes, marked
    "Full menu to follow". The page shows them first, in the design's layout,
    then the full 86-dish menu under its own heading, by the owner's decision.
14. **Owner's name and portrait.** The design still says "Ronika Singh" over an
    empty frame. The site keeps the owner's full name, Ronika Singh Bhatia, and
    her portrait.
15. **Catering** is its own page, `/catering`, rather than the end of the Menu
    page: heading, the Instagram button, the three packages.
16. **Order page.** Dishes are grouped under their categories with a bar of
    jump links and the cart held at the top of the screen. On a phone each card
    sets a 104px photograph beside the name, so several dishes fit on a screen.
    "Add" adds one and confirms on the button instead of opening the cart over
    the page; quantities are changed in the cart.
17. **Navigation** is Menu, Order, Catering, About — four fit on one line on a
    phone. Home is the wordmark above it and the first footer link.
18. **Type on a phone** is one step smaller than on a desktop: each display
    size is a `clamp()` whose floor is its phone size, and the smallest text
    anywhere is 12px.

Everything else follows the design. Body copy is one size step above the
artboards throughout — 17px rather than 15.5px — a deliberate readability
change made before the current design and kept for consistency.

Two subtleties that diff caught and are worth not re-breaking:

- **`Container` must stay `box-content`.** The artboards have no `box-sizing`
  reset, so their column is 1240px of _content_ with the gutter outside it.
  Under Tailwind's border-box preflight the same markup yields a 1144px column —
  8% narrower, which changes every line break on the site.
- **Line-height tokens are mostly `normal` on purpose.** The artboards set no
  line-height on kickers, headings, dish names or prices. Forcing one (1.2 on a
  12px kicker) made every kicker block 3–6px too tall. Elements that genuinely
  need a fixed leading — the ruled figcaption, the 44px targets — declare it
  themselves. Note that Tailwind's `leading-normal` is
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
  in `src/lib/og-card.tsx`. An e2e test asserts `og:image` on every route.

## Target sizes

- Navigation, buttons and standalone links: **44px** (WCAG 2.5.5 AAA).
- Other content links: **24px** (WCAG 2.5.8 AA).
- Links whose height is constrained by the line-height of surrounding text are
  exempt under 2.5.8's inline exception. `e2e/a11y.spec.ts` detects that structurally (a link
  inside a `<p>` that holds more than the link) rather than by matching phone
  numbers or addresses, which would rot the moment the details change.

## Notes on dependencies

- **TypeScript is pinned to 5.9.3.** `latest` is 7.0.2, but
  `typescript-eslint@8.67` peer-requires `>=4.8.4 <6.1.0`; TS 7 breaks typed
  linting today.
- **ESLint is pinned to 9.39.5.** `eslint-plugin-jsx-a11y` (a dependency of
  `eslint-config-next`) supports ESLint 9 at most, so ESLint 10 cannot resolve.
- **jsdom is pinned to 29.1.1.** jsdom 30 requires Node ≥ 24.15.

---

## Testing

- **Unit** (`tests/`, Vitest + Testing Library): content schemas, counts and
  prices, the image manifest against the files on disk, the cart rules and the
  order message, the dish card's size picker and cart count, `cn` class-group
  merging, `MenuRow` semantics, `SiteNav` active state, `Figure` empty state,
  button variants and link handling.
- **E2E** (`e2e/`, Playwright at 1440 / iPad Mini / iPhone SE):
  - The Shopify path is covered by unit tests whose fixtures follow Shopify's
    published Storefront API schema (`tests/lib/daily-menu.test.ts`). It was
    also driven end to end in a browser against a local mock of the API; it
    has not yet run against a real store.
  - `smoke` — routes render, one `h1` each, site frame present, every dish in
    the content files appears on `/menu`, every catalogue dish on `/order`
    under its category, catering on its own page, and the home page's first
    screen offering Order and Catering.
  - `order` — add at a size, the category bar's jump links, adjust and remove in the drawer,
    Escape closes it, the cart survives a reload, checkout validation, and the
    exact text message the order produces.
  - `links` — no `.dc.html` survives, every internal link returns 200, the
    `/menu#full-menu` anchor lands on screen, a styled 404, dialable `tel:`.
  - `a11y` — axe WCAG 2.1 A/AA with zero violations per route, skip-link focus
    order, visible focus, and the target-size policy on **every** route.
  - `production` — `og:image` and `twitter:image` resolve on every route,
    icon and apple-touch-icon resolve, Instagram and the phone number on every
    page, declared route anchors exist, security headers set, sitemap complete.
  - `resilience` — 320px reflow (WCAG 1.4.10, below the smallest device),
    no-JS rendering, hover contrast on solid buttons, reduced motion, forced
    colours, and 200% text zoom (1.4.4) — neither of the last two is covered
    by axe.
  - `performance` — an LCP/CLS/TTFB budget, and an assertion that no image is
    served smaller than the box it fills. The `sizes` attributes have drifted
    twice; this catches the third time.

Continuous integration runs the whole gate on every push and pull request
(`.github/workflows/verify.yml`), on **both** Node 22.18 — the `engines` floor,
so the floor is real rather than aspirational — and Node 24. A clean-checkout
typecheck failure once reached `main` and was caught by hand; this is that
safety net.

## Printing

The menu prints. `@media print` in `globals.css` drops the navigation, the
photographs, the footer and the contents strip, moves to ink on white, and
replaces the multi-column dish lists with a two-up grid — Chrome will not
fragment a multi-column block across a page break, which left a course heading
stranded above most of a blank sheet. The full 86-dish menu comes out as four
Letter pages with the origin and non-vegetarian labels intact.

## Licensing

The site code in this repository has no open-source licence granted; it is the
property of the kitchen. Every photograph is the kitchen's own. The fonts it
vendors carry their licence with them:

| Asset                                                                           | Licence                   | Where the terms live       |
| ------------------------------------------------------------------------------- | ------------------------- | -------------------------- |
| Libre Caslon Display, Libre Franklin, Noto Serif Gurmukhi in `src/assets/fonts` | SIL Open Font License 1.1 | `src/assets/fonts/OFL.txt` |
| The same three families plus Libre Caslon Text, served to pages by `next/font`  | SIL Open Font License 1.1 | upstream Google Fonts      |

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
stripping is on by default, since `npm run fonts:fetch` is TypeScript run
directly by Node. The `prebuild` guard
is deliberately plain JavaScript so the build itself never depends on that.
