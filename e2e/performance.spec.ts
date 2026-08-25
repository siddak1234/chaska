import { expect, test } from "@playwright/test";

/**
 * A budget, not a benchmark.
 *
 * Measured live at the time of writing: LCP 240–600ms, CLS 0.0000, TTFB ~150ms.
 * These thresholds sit well above that, so they do not fail on a slow CI
 * runner, but they do catch the regressions that actually happen — an
 * unoptimised image, a font that stops being preloaded, a layout that starts
 * shifting.
 *
 * Only meaningful on a real browser with a warm server, so it is desktop-only.
 */
const ROUTES = ["/", "/menu", "/about"] as const;

const BUDGET = {
  /** Google's "good" threshold is 2500ms. */
  lcpMs: 2500,
  /** Google's "good" threshold is 0.1. The site measures 0. */
  cls: 0.05,
  /** Every route is statically prerendered. */
  ttfbMs: 1500,
};

for (const route of ROUTES) {
  test(`${route} stays inside the performance budget`, async ({ page }, testInfo) => {
    test.skip(
      testInfo.project.name !== "desktop",
      "Timing on emulated devices measures the emulator, not the site.",
    );

    await page.goto(route, { waitUntil: "networkidle" });

    const metrics = await page.evaluate(
      () =>
        new Promise<{ lcp: number; cls: number; ttfb: number }>((resolve) => {
          let cls = 0;
          let lcp = 0;

          new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              const shift = entry as PerformanceEntry & {
                value: number;
                hadRecentInput: boolean;
              };
              if (!shift.hadRecentInput) cls += shift.value;
            }
          }).observe({ type: "layout-shift", buffered: true });

          new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const last = entries[entries.length - 1];
            if (last) lcp = last.startTime;
          }).observe({ type: "largest-contentful-paint", buffered: true });

          const nav = performance.getEntriesByType(
            "navigation",
          )[0] as PerformanceNavigationTiming;

          setTimeout(
            () =>
              resolve({
                lcp: Math.round(lcp),
                cls,
                ttfb: Math.round(nav.responseStart),
              }),
            1000,
          );
        }),
    );

    expect(metrics.lcp, `LCP ${metrics.lcp}ms`).toBeLessThan(BUDGET.lcpMs);
    expect(metrics.cls, `CLS ${metrics.cls}`).toBeLessThan(BUDGET.cls);
    expect(metrics.ttfb, `TTFB ${metrics.ttfb}ms`).toBeLessThan(BUDGET.ttfbMs);
  });
}

test("images are served no larger than they are displayed", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "one viewport is enough");

  // Guards the `sizes` attributes, which have silently drifted twice: once when
  // the container box-sizing was corrected, once when the About columns moved.
  const oversupplied: string[] = [];

  for (const route of ROUTES) {
    await page.goto(route, { waitUntil: "networkidle" });
    await page.evaluate(async () => {
      window.scrollTo(0, document.body.scrollHeight);
      await new Promise((r) => setTimeout(r, 200));
      window.scrollTo(0, 0);
      await Promise.all(
        [...document.querySelectorAll("img")].map((img) =>
          img.complete ? null : img.decode().catch(() => null),
        ),
      );
    });

    const bad = await page.evaluate(() =>
      [...document.querySelectorAll("img")]
        .filter((img) => img.naturalWidth > 0)
        .map((img) => ({
          alt: img.alt.slice(0, 30),
          box: Math.round(img.getBoundingClientRect().width),
          natural: img.naturalWidth,
        }))
        // Under-serving shows as blur; 2px of rounding is not a defect.
        .filter((img) => img.box - img.natural > 2),
    );

    for (const img of bad) {
      oversupplied.push(`${route} "${img.alt}" box ${img.box} served ${img.natural}`);
    }
  }

  expect(oversupplied).toEqual([]);
});
