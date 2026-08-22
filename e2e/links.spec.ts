import { expect, test } from "@playwright/test";

const ROUTES = ["/", "/menu", "/about", "/credits"] as const;

test("no artboard filename survives anywhere in the site", async ({ page }) => {
  for (const route of ROUTES) {
    await page.goto(route);
    const stale = await page.evaluate(() =>
      [...document.querySelectorAll("a[href]")]
        .map((a) => a.getAttribute("href") ?? "")
        .filter((href) => href.includes(".dc.html")),
    );
    expect(stale, `${route} still links to an artboard`).toEqual([]);
  }
});

test("every internal link resolves to a real page", async ({ page, request }) => {
  const seen = new Set<string>();

  for (const route of ROUTES) {
    await page.goto(route);
    const hrefs = await page.evaluate(() =>
      [...document.querySelectorAll("a[href]")]
        .map((a) => a.getAttribute("href") ?? "")
        .filter((href) => href.startsWith("/")),
    );
    for (const href of hrefs) seen.add(href.split("#")[0] || "/");
  }

  expect(seen.size).toBeGreaterThan(0);
  for (const href of seen) {
    const response = await request.get(href);
    expect(response.status(), `${href} returned ${response.status()}`).toBe(200);
  }
});

test("the catering anchor exists and scrolls into view", async ({ page }) => {
  await page.goto("/menu#catering");
  await expect(page.locator("#catering")).toBeVisible();

  // `scroll-behavior: smooth` animates the jump, so allow it to settle. The
  // catering section is last on the page, so on a short viewport the browser
  // lands at the document end rather than exactly at scroll-margin-top; what
  // must be true at every width is that the heading is on screen.
  const heading = page.getByRole("heading", { name: "Catering" });
  await expect(heading).toBeInViewport({ timeout: 5000 });

  const scrolled = await page.evaluate(() => window.scrollY);
  expect(scrolled).toBeGreaterThan(0);
});

test("an unknown path renders the styled 404, not a bare error", async ({ page }) => {
  const response = await page.goto("/not-a-real-page");
  expect(response?.status()).toBe(404);
  await expect(
    page.getByRole("heading", { name: "This page is not on the menu" }),
  ).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Primary" })).toBeVisible();
});

test("the phone and email links are dialable and mailable", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("a[href^='tel:']").first()).toHaveAttribute(
    "href",
    /^tel:\+\d{7,}$/,
  );
  await expect(page.locator("a[href^='mailto:']").first()).toBeVisible();
});
