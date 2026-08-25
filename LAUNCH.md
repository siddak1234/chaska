# Chaska — completion checklist

Live at **https://eatchaska.com**. This tracks what is finished, what I can
finish, and what only you can. Every "done" line below was verified by
measurement, not assumed.

---

## A. Done and verified

- [x] Three Claude Design artboards ported to Next.js 16; four static routes
- [x] Computed-style diff against the artboards is zero, apart from two
      deliberate changes (44px targets, one negative-margin hit area)
- [x] Real contact details: `(214) 801 7809`, `ronikajit@gmail.com`,
      14355 Francis Lane, Frisco, TX 75035
- [x] Restaurant/Menu structured data, complete `PostalAddress`, no fake offers
- [x] Owner portrait cropped to 4:5 and placed; owner named Ronika Singh Bhatia
- [x] Real menu — 86 dishes, seven courses, four source duplicates resolved
- [x] Contents strip so a long menu is navigable
- [x] Home page reordered so the photograph leads, not a paragraph
- [x] About rebalanced — picture down 24%, body type up to 17px
- [x] `sizes` correct across 320–1500px; worst upscale 0px
- [x] Zero axe WCAG 2.1 A/AA violations on all four routes, three viewports
- [x] 320px reflow, no-JS rendering, reduced motion, hover contrast
- [x] Security headers, HTTP→HTTPS, robots, sitemap, favicon, OG cards
- [x] 67 unit + 117 e2e, passing locally and against production
- [x] LCP 240–600ms, CLS 0.0000, TTFB ~150ms measured live
- [x] Public repo, clean checkout builds (`npm ci && npm run verify`)
- [x] CI on every push, on the `engines` floor and on Node 24
- [x] Performance budget and image-supply assertions in the suite
- [x] Print stylesheet — the 86-dish menu prints as four clean Letter pages
- [x] Forced colours and 200% text zoom verified
- [x] 82 of 86 dishes described, researched not invented

---

## B. My work — complete

- [x] **B1 — CI.** No workflow runs the gate on push. A clean-checkout
      typecheck bug reached `main` once already and was caught by hand.
- [x] **B2 — Performance budget in the suite.** LCP/CLS are good today and
      nothing stops a future change regressing them silently.
- [x] **B3 — Print stylesheet.** People print restaurant menus. The site has no
      print rules, so it currently prints the nav, the photo strip and the
      catering cards along with the dishes.
- [x] **B4 — Remaining accessibility passes.** 200% zoom and forced-colors mode
      are untested; axe does not cover either.
- [x] **B5 — Node pinned** via `.nvmrc` so contributors and CI agree with
      `engines`.
- [x] **B6 — Fold this checklist into the README** and delete the duplication.

---

## C. Only you can do these

- [ ] **C1 — Add `www.eatchaska.com` in Vercel.** _Currently broken:_ DNS
      resolves and TLS completes, but the certificate has no `www` name, so a
      browser shows a full-page security warning. Vercel → project → Domains →
      Add. No API can do it.
- [ ] **C2 — Set `NEXT_PUBLIC_SITE_ENV=production`** on the Vercel production
      environment, so the placeholder guard is armed against future regressions.
- [ ] **C3 — Real food photography.** All six food images are Creative Commons
      photographs of other people's cooking. They are what force `/credits` and
      `ATTRIBUTION.md` to exist; owned photographs remove the obligation.
- [ ] **C4 — Menu prices.** 86 dishes, none priced. Adding them is a data edit;
      the dotted leader returns on its own.
- [x] **C5 — Descriptions.** ~~Pick 8–12 signature dishes.~~ Done differently:
      82 of the 86 now carry a researched, canonical one-line definition — what
      the dish _is_, not a claim about how your kitchen makes it. **Please read
      them and adjust any that do not match your recipes.** Four are
      deliberately blank: Corn Salad and Pasta Salad (nobody stated what goes
      in them) and the two unverified names in C6.
- [ ] **C6 — Confirm two dish names.** _(blocks their descriptions)_ "Fried Tandoori Paneer" — tandoori means
      roasted, so _fried tandoori_ is contradictory; did you mean Tandoori
      Paneer Tikka? And "Coin Veg Tikki" — is "coin" the size?
- [ ] **C7 — Confirm the hours.** Tue–Sun 11:00–22:00, closed Monday, is
      transcribed from the artboard and is now in live structured data.
- [ ] **C8 — `hello@eatchaska.com`.** A personal Gmail is on a public site and
      in a public repo; a forwarding mailbox retires it with one field change.
- [ ] **C9 — LICENSE.** The repo is public with no licence, so default
      copyright applies. That is a legal statement to make yourself, not one for
      me to assume.
- [ ] **C10 — Google Business Profile and Search Console.** Submit
      `https://eatchaska.com/sitemap.xml`; the Restaurant markup is ready.

---

## Verification

```bash
npm run verify                                        # lint, types, 67 unit, build
npx playwright test                                   # 134 e2e, local build
PLAYWRIGHT_BASE_URL=https://eatchaska.com npx playwright test   # same, against production
```
