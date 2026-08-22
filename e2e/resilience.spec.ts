import { expect, test } from "@playwright/test";

const ROUTES = ["/", "/menu", "/about", "/credits"] as const;

/** WCAG 1.4.10 sets the reflow floor at 320px, below the smallest test device. */
test.describe("reflow at 320px", () => {
  test.use({ viewport: { width: 320, height: 640 } });

  for (const route of ROUTES) {
    test(`${route} does not scroll sideways at 320px`, async ({ page }) => {
      await page.goto(route);
      const overflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("the menu is fully readable", async ({ page }) => {
    await page.goto("/menu");
    await expect(page.locator("main dl dt")).toHaveCount(18);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    // Server-rendered from the route, not computed on the client.
    await expect(page.locator('[aria-current="page"]')).toHaveText("Menu");
  });

  test("photographs still have a src", async ({ page }) => {
    await page.goto("/");
    const withoutSrc = await page.evaluate(
      () =>
        [...document.querySelectorAll("main img")].filter(
          (img) => !img.getAttribute("src"),
        ).length,
    );
    expect(withoutSrc).toBe(0);
  });
});

test("solid buttons keep a readable label on hover", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "hover needs a pointer");

  // The artboards let the global `a:hover { color: oxblood }` apply to solid
  // ink buttons — 1.96:1. Each variant must override it.
  await page.goto("/");
  const button = page.getByRole("link", { name: "View the menu" });
  await button.hover();

  const { background, color } = await button.evaluate((el) => {
    const style = getComputedStyle(el);
    return { background: style.backgroundColor, color: style.color };
  });

  const luminance = (rgb: string) => {
    const [r, g, b] = (rgb.match(/\d+/g) ?? ["0", "0", "0"]).map(Number) as [
      number,
      number,
      number,
    ];
    const channel = (v: number) => {
      const c = v / 255;
      return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
  };

  const a = luminance(background);
  const b = luminance(color);
  const ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  expect(ratio).toBeGreaterThanOrEqual(4.5);
});

test("reduced motion is respected", async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto("/");
  const scrollBehavior = await page.evaluate(
    () => getComputedStyle(document.documentElement).scrollBehavior,
  );
  expect(scrollBehavior).toBe("auto");
  await context.close();
});
