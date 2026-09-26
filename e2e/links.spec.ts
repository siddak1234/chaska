import { expect, test } from "./fixtures";

import { ROUTES } from "../src/lib/routes";

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

test("the full-menu anchor exists and scrolls into view", async ({ page }) => {
  await page.goto("/menu#full-menu");
  await expect(page.locator("#full-menu")).toBeInViewport({ timeout: 5000 });
  expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
});

test("an unknown path renders the styled 404, not a bare error", async ({ page }) => {
  const response = await page.goto("/not-a-real-page");
  expect(response?.status()).toBe(404);
  await expect(
    page.getByRole("heading", { name: "This page is not on the menu" }),
  ).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Primary" })).toBeVisible();
});

test("the phone link is dialable", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("a[href^='tel:']").first()).toHaveAttribute(
    "href",
    /^tel:\+\d{7,}$/,
  );
});

test("catering enquiries go to Instagram, as the design has it", async ({ page }) => {
  await page.goto("/catering");
  await expect(
    page.getByRole("link", { name: "Message us on Instagram" }),
  ).toHaveAttribute("href", "https://www.instagram.com/tasteofchaska/");
});
