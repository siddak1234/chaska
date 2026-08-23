import { readFileSync } from "node:fs";
import path from "node:path";

import { expect, test } from "@playwright/test";

/**
 * Headings are read from the content files rather than frozen as literals:
 * this test is about the page rendering what the content layer holds. That the
 * content itself matches the artboards is asserted in
 * `tests/content/content.test.ts`.
 *
 * Read with `fs` rather than imported — Playwright's loader will not resolve a
 * JSON module import, and this needs no module graph anyway.
 */
function content(file: string): Record<string, never> {
  return JSON.parse(
    readFileSync(path.join(process.cwd(), "src", "content", file), "utf8"),
  ) as Record<string, never>;
}

const home = content("home.data.json") as unknown as { lead: { title: string } };
const menu = content("menu.data.json") as unknown as { title: string };
const about = content("about.data.json") as unknown as { title: string };

const ROUTES = [
  { path: "/", heading: home.lead.title },
  { path: "/menu", heading: new RegExp(`^${menu.title}`) },
  { path: "/about", heading: about.title },
  { path: "/credits", heading: "Photograph credits" },
] as const;

for (const route of ROUTES) {
  test(`${route.path} renders with one h1 and the site frame`, async ({ page }) => {
    await page.goto(route.path);

    await expect(page.getByRole("heading", { level: 1 })).toHaveText(route.heading);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.getByRole("navigation", { name: "Primary" })).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Footer" })).toBeVisible();
    await expect(page.locator("main#main")).toBeVisible();
  });

  test(`${route.path} never scrolls sideways`, async ({ page }) => {
    await page.goto(route.path);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
}

test("the home masthead is the tall one, inner pages the compact one", async ({
  page,
}) => {
  await page.goto("/");
  const home = await page
    .locator("header a[href='/'] span")
    .last()
    .evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
  await page.goto("/menu");
  const inner = await page
    .locator("header a[href='/'] span")
    .last()
    .evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
  expect(home).toBeGreaterThan(inner);
});

test("the menu lists all eighteen dishes", async ({ page }) => {
  await page.goto("/menu");
  await expect(page.locator("main dl dt")).toHaveCount(18);
});

test("every photograph on the site is credited", async ({ page }) => {
  await page.goto("/credits");
  // Six distinct Commons files back the nine artboard slots.
  await expect(page.locator("main dl > div")).toHaveCount(6);
  await expect(
    page.getByRole("link", { name: /creativecommons|CC BY/ }).first(),
  ).toBeVisible();
});
