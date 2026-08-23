import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const ROUTES = ["/", "/menu", "/about", "/credits"] as const;

for (const route of ROUTES) {
  test(`${route} has no WCAG 2.1 A/AA violations`, async ({ page }) => {
    await page.goto(route);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    expect(results.violations.map((v) => `${v.id}: ${v.nodes.length} node(s)`)).toEqual(
      [],
    );
  });
}

test("the skip link is the first stop and reveals itself on focus", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "desktop",
    "Tab does not move focus under Playwright's touch-device emulation.",
  );
  await page.goto("/");
  await page.keyboard.press("Tab");

  const skip = page.getByRole("link", { name: "Skip to content" });
  await expect(skip).toBeFocused();
  await expect(skip).toBeVisible();

  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#main$/);
});

/**
 * Target sizing, by policy:
 *   - navigation, buttons and standalone links: 44px (WCAG 2.5.5 AAA)
 *   - other content links: 24px (WCAG 2.5.8 AA)
 *   - links sitting inside a paragraph of other text are exempt under 2.5.8's
 *     inline exception, since their height is set by that text's line-height.
 *
 * The exemption is detected structurally — "is this link inside a `<p>` that
 * contains more than the link itself" — rather than by matching known phone
 * numbers or email addresses, which rot the moment the contact details change.
 *
 * The first version of this test only ran on /menu and missed fifteen
 * undersized targets on / and /credits.
 */
for (const route of ROUTES) {
  test(`${route} meets target-size policy`, async ({ page }) => {
    await page.goto(route);

    const measured = await page.evaluate(() =>
      [...document.querySelectorAll("header a, main a, footer a")].map((el) => {
        const paragraph = el.closest("p");
        const ownText = (el.textContent ?? "").trim();
        return {
          text: ownText,
          height: Math.round(el.getBoundingClientRect().height),
          chrome: !!el.closest("header, footer"),
          inlineInProse:
            !!paragraph && (paragraph.textContent ?? "").trim().length > ownText.length,
        };
      }),
    );

    const tooSmall = measured.filter((item) => {
      if (item.height === 0) return false;
      if (item.inlineInProse) return false;
      return item.height < (item.chrome ? 44 : 24);
    });

    expect(tooSmall).toEqual([]);
  });
}

test("the home page's standalone links are full-size targets", async ({ page }) => {
  await page.goto("/");
  const more = page.getByRole("link", { name: /Full menu/ });
  const box = await more.boundingBox();
  expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
});

test("focus is always visible", async ({ page }, testInfo) => {
  test.skip(
    testInfo.project.name !== "desktop",
    "Tab does not move focus under Playwright's touch-device emulation.",
  );
  await page.goto("/");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  const outline = await page.evaluate(() => {
    const el = document.activeElement;
    if (!el) return null;
    const s = getComputedStyle(el);
    return { width: s.outlineWidth, style: s.outlineStyle, color: s.outlineColor };
  });
  expect(outline?.style).not.toBe("none");
  expect(parseFloat(outline?.width ?? "0")).toBeGreaterThan(0);
});
