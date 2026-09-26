import { expect, test } from "@playwright/test";

import {
  about,
  catering,
  categories,
  dishCount,
  dishes,
  home,
  menu,
  order,
} from "./content";

const ROUTES = [
  { path: "/", heading: home.lead.title },
  { path: "/menu", heading: new RegExp(`^${menu.title}`) },
  { path: "/order", heading: order.title },
  { path: "/catering", heading: catering.title },
  { path: "/about", heading: about.title },
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

test("the order page offers every catalogue dish, under its category", async ({
  page,
}) => {
  await page.goto("/order");
  await expect(page.getByRole("button", { name: /^Add .+ to order$/ })).toHaveCount(
    dishes.length,
  );
  for (const category of categories) {
    const section = page.getByRole("region", { name: category.name });
    for (const dish of dishes.filter((d) => d.category === category.id)) {
      await expect(
        section.getByRole("heading", { level: 3, name: dish.name }),
      ).toBeVisible();
    }
  }
});

test("catering is a page of its own, and the menu no longer carries it", async ({
  page,
}) => {
  await page.goto("/menu");
  await expect(page.getByRole("heading", { name: catering.title })).toHaveCount(0);
  await page
    .getByRole("navigation", { name: "Primary" })
    .getByRole("link", { name: "Catering" })
    .click();
  await expect(page).toHaveURL(/\/catering$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(catering.title);
});

test("the home page's first screen offers ordering and catering", async ({ page }) => {
  await page.goto("/");
  const orderLink = page
    .getByRole("main")
    .getByRole("link", { name: "Order for pickup" });
  const cateringLink = page.getByRole("main").getByRole("link", { name: "Catering" });
  await expect(orderLink).toBeInViewport();
  await expect(cateringLink).toBeInViewport();
  await orderLink.click();
  await expect(page).toHaveURL(/\/order$/);
});

test("the credits page is gone, since every photograph is the kitchen's own", async ({
  page,
}) => {
  const response = await page.goto("/credits");
  expect(response?.status()).toBe(404);
});
