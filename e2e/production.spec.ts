import { expect, test } from "@playwright/test";

import { ROUTE_ANCHORS, ROUTES } from "../src/lib/routes";

/**
 * The things a screenshot cannot show. Each of these was missing when the site
 * was first built and only surfaced under audit.
 */

test("every page carries a social card", async ({ page, request }) => {
  for (const route of ROUTES) {
    await page.goto(route);
    const og = await page.locator('meta[property="og:image"]').getAttribute("content");
    expect(og, `${route} has no og:image`).toBeTruthy();

    const twitter = await page
      .locator('meta[name="twitter:image"]')
      .getAttribute("content");
    expect(twitter, `${route} has no twitter:image`).toBeTruthy();

    const path = new URL(og as string).pathname;
    const response = await request.get(path);
    expect(response.status(), `${og} did not resolve`).toBe(200);
    expect(response.headers()["content-type"]).toContain("image/png");
  }
});

test("the site has an icon and an apple touch icon", async ({ page, request }) => {
  await page.goto("/");
  for (const selector of ['link[rel="icon"]', 'link[rel="apple-touch-icon"]']) {
    const href = await page.locator(selector).first().getAttribute("href");
    expect(href, `${selector} missing`).toBeTruthy();
    const response = await request.get(href as string);
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("image/png");
  }
});

test("every page links the kitchen's Instagram, in a new tab", async ({ page }) => {
  for (const route of ROUTES) {
    await page.goto(route);
    const href = 'a[href="https://www.instagram.com/tasteofchaska/"]';
    // The topbar handle and the footer link; the menu adds a third, for catering.
    for (const region of ["body > div > header", "footer"]) {
      const link = page.locator(`${region} ${href}`);
      await expect(link, `${route} ${region}`).toHaveCount(1);
      await expect(link).toHaveAttribute("target", "_blank");
    }
    await expect(page.locator("header").getByText("@tasteofchaska")).toBeVisible();
  }
});

test("the phone number stays on every page, in the footer", async ({ page }) => {
  for (const route of ROUTES) {
    await page.goto(route);
    await expect(
      page.locator("footer a[href='tel:+12148017809']"),
      `${route} has no phone link`,
    ).toHaveText("(214) 801 7809");
  }
});

test("declared route anchors exist on their pages", async ({ page }) => {
  for (const [route, anchors] of Object.entries(ROUTE_ANCHORS)) {
    await page.goto(route);
    for (const anchor of anchors ?? []) {
      await expect(
        page.locator(`#${anchor}`),
        `${route} is missing #${anchor}`,
      ).toHaveCount(1);
    }
  }
});

test("security headers are set", async ({ request }) => {
  const response = await request.get("/");
  const headers = response.headers();
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(headers["content-security-policy"]).toContain("frame-ancestors 'self'");
  expect(headers["content-security-policy"]).toContain("object-src 'none'");
  // next.config sets poweredByHeader: false
  expect(headers["x-powered-by"]).toBeUndefined();
});

test("robots and sitemap list every route", async ({ request }) => {
  const robots = await request.get("/robots.txt");
  expect(robots.status()).toBe(200);
  expect(await robots.text()).toContain("Sitemap:");

  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.status()).toBe(200);
  const xml = await sitemap.text();
  for (const route of ROUTES) {
    const suffix = route === "/" ? "" : route;
    expect(xml, `${route} missing from sitemap`).toContain(`${suffix}</loc>`);
  }
});
