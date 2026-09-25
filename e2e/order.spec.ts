import { expect, test, type Page } from "@playwright/test";

/**
 * The Order page end to end: choose, add, adjust, check out, send. The order
 * leaves the site as a text or an email, so the last step asserts the message
 * that would be sent rather than a server receiving it.
 */

async function addDahiLarge(page: Page, qty = 1) {
  const card = page.locator("article", {
    has: page.getByRole("heading", { name: "Dahi Bhalla" }),
  });
  await card.getByText("Large").click();
  for (let i = 1; i < qty; i++) {
    await card
      .getByRole("button", { name: "Increase quantity of Dahi Bhalla" })
      .click();
  }
  await card.getByRole("button", { name: "Add to order" }).click();
}

test.beforeEach(async ({ page }) => {
  await page.goto("/order");
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();
});

test("adding a dish opens the cart with the right line and price", async ({ page }) => {
  await addDahiLarge(page, 2);

  const drawer = page.getByRole("dialog", { name: "Your order" });
  await expect(drawer).toBeVisible();
  await expect(drawer).toContainText("Dahi Bhalla");
  await expect(drawer).toContainText("Large · 32 oz");
  await expect(drawer).toContainText("$32");
  await expect(page.getByRole("button", { name: /^Cart/ })).toContainText("2");
});

test("the cart adjusts, removes, and closes on Escape", async ({ page }) => {
  await addDahiLarge(page);
  const drawer = page.getByRole("dialog", { name: "Your order" });

  await drawer
    .getByRole("button", { name: "Increase quantity of Dahi Bhalla" })
    .click();
  await expect(drawer).toContainText("$32");
  await drawer.getByRole("button", { name: "Remove Dahi Bhalla" }).click();
  await expect(drawer).toContainText("Your order is empty");

  await page.keyboard.press("Escape");
  await expect(drawer).toBeHidden();
  await expect(page.getByRole("button", { name: /^Cart/ })).toHaveAttribute(
    "aria-expanded",
    "false",
  );
});

test("the cart survives a reload", async ({ page }) => {
  await addDahiLarge(page);
  await page.reload();
  await expect(page.getByRole("button", { name: /^Cart/ })).toContainText("1");
});

test("checkout validates, then writes the order into a text to the kitchen", async ({
  page,
}) => {
  await addDahiLarge(page);
  const kutchi = page.locator("article", {
    has: page.getByRole("heading", { name: "Kutchi Dabeli" }),
  });
  await page.keyboard.press("Escape");
  await kutchi.getByRole("button", { name: "Add to order" }).click();

  await page.getByRole("dialog").getByRole("button", { name: "Checkout" }).click();
  await expect(page.getByRole("heading", { name: "Pickup details" })).toBeVisible();
  await expect(page.getByRole("complementary")).toContainText("$21");

  // The design's validation, in its order.
  await page.getByRole("button", { name: "Place pickup order" }).click();
  await expect(page.getByRole("main").getByRole("alert")).toHaveText(
    "Please enter your name.",
  );
  await page.getByLabel("Name").fill("Asha");
  await page.getByLabel("Mobile phone").fill("555");
  await page.getByRole("button", { name: "Place pickup order" }).click();
  await expect(page.getByRole("main").getByRole("alert")).toContainText("10 digit");

  await page.getByLabel("Mobile phone").fill("(469) 555 0123");
  await page.getByLabel("Pickup date").fill("2026-12-04");
  await page.getByLabel("Preferred pickup time").fill("17:30");

  // Keep the external messaging app from stealing the test's page.
  await page.evaluate(() => {
    window.matchMedia = () => ({ matches: false }) as MediaQueryList;
  });
  await page.route(/^mailto:/, (route) => route.abort());
  await page.getByRole("button", { name: "Place pickup order" }).click();

  await expect(page.getByRole("heading", { name: "Shukriya, Asha." })).toBeVisible();
  const sms = await page
    .getByRole("link", { name: "Send by text" })
    .getAttribute("href");
  expect(sms).toMatch(/^sms:\+12148017809\?&body=/);
  const body = decodeURIComponent(sms!.split("body=")[1]!);
  expect(body).toContain("Name: Asha");
  expect(body).toContain("Mobile: (469) 555 0123");
  expect(body).toContain("1 × Dahi Bhalla (Large · 32 oz) — $16");
  expect(body).toContain("1 × Kutchi Dabeli (Per dabeli) — $5");
  expect(body).toContain("Subtotal: $21 before sales tax");
  await expect(page.getByRole("link", { name: "Send by email" })).toHaveAttribute(
    "href",
    /^mailto:ronikajit@gmail\.com\?subject=/,
  );
  // The cart is emptied once the order is written out.
  await expect(page.getByRole("button", { name: /^Cart/ })).toContainText("0");
});
