import { expect, test } from "@playwright/test";

import { about, dishCount, home, menu } from "./content";

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

test("the menu lists every dish in the content", async ({ page }) => {
  await page.goto("/menu");
  await expect(page.locator("main dl dt")).toHaveCount(dishCount);
});

test("every photograph on the site is credited", async ({ page }) => {
  await page.goto("/credits");
  // Six distinct Commons files back the nine artboard slots.
  await expect(page.locator("main dl > div")).toHaveCount(6);
  await expect(
    page.getByRole("link", { name: /creativecommons|CC BY/ }).first(),
  ).toBeVisible();
});
