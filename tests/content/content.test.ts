import { describe, expect, it } from "vitest";

import {
  getAboutPage,
  getAllMenuItems,
  getCatering,
  getHomePage,
  getMenu,
  getSite,
} from "@/content";
import { images } from "@/content/generated/images";
import { isValidHref } from "@/lib/routes";

/**
 * These assert against the artboards in `design-source/`, so a content edit
 * that silently drops a dish or renames a course fails here.
 */
describe("content", () => {
  it("loads every module without a schema error", () => {
    expect(() => {
      getSite();
      getMenu();
      getCatering();
      getHomePage();
      getAboutPage();
    }).not.toThrow();
  });

  it("carries the four courses from the Menu artboard", () => {
    expect(getMenu().courses.map((c) => c.name)).toEqual([
      "Shuruaat",
      "Ghar di Rasoi",
      "Rotiyan",
      "Mitha te Thanda",
    ]);
  });

  it("carries all 18 dishes", () => {
    expect(getAllMenuItems()).toHaveLength(18);
  });

  it("keeps prices as whole dollars, as printed", () => {
    for (const item of getAllMenuItems()) {
      expect(Number.isInteger(item.price.amount)).toBe(true);
      expect(item.price.currency).toBe("USD");
    }
  });

  it("gives every dish a unique id", () => {
    const ids = getMenu().courses.flatMap((c) => c.items.map((i) => `${c.id}/${i.id}`));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("carries the three catering tiers", () => {
    expect(getCatering().packages.map((p) => p.name)).toEqual([
      "Family Gatherings",
      "Larger Events",
      "Weddings & Celebrations",
    ]);
  });

  it("points every link at a known route or external target", () => {
    const site = getSite();
    const home = getHomePage();
    const about = getAboutPage();

    const hrefs = [
      ...site.nav.map((l) => l.href),
      ...site.footerNav.map((l) => l.href),
      ...home.lead.actions.map((l) => l.href),
      home.kitchen.moreLink.href,
      home.family.action.href,
      home.cateringNotice.action.href,
      ...about.quote.actions.map((l) => l.href),
    ];

    expect(hrefs.length).toBeGreaterThan(0);
    for (const href of hrefs) {
      expect(isValidHref(href), `${href} is not a valid target`).toBe(true);
    }
  });

  it("resolves every referenced image id in the generated manifest", () => {
    const home = getHomePage();
    const about = getAboutPage();
    const menu = getMenu();

    const ids = [
      home.lead.figure.imageId,
      home.family.figure.imageId,
      ...home.kitchen.dishes.map((d) => d.imageId),
      about.family.figure.imageId,
      ...menu.photoStrip.map((f) => f.imageId),
    ];

    for (const id of ids) {
      expect(Object.keys(images), `${id} is missing from the manifest`).toContain(id);
    }
  });

  it("leaves the owner portrait slot genuinely empty", () => {
    // The About artboard's `about-ronika` slot has no src. It must not be
    // quietly filled with a stock photograph of someone else.
    expect(getAboutPage().owner.figure.imageId).toBeNull();
    expect(getAboutPage().owner.figure.emptyLabel).toBe("Photo of Ronika Singh");
  });

  it("carries real contact details, not the artboard placeholders", () => {
    const { contact } = getSite();

    expect(contact.phone.placeholder).toBe(false);
    expect(contact.email.placeholder).toBe(false);
    expect(contact.address.placeholder).toBe(false);

    expect(contact.phone.e164).toBe("+12148017809");
    expect(contact.email.general).not.toContain("chaskadallas.com");
    expect(contact.address.street).toBe("14355 Francis Lane");
    expect(contact.address.locality).toBe("Frisco");
    expect(contact.address.postalCode).toBe("75035");
  });

  it("dials the number it prints", () => {
    // A typo here means the page shows one number and `tel:` calls another —
    // silently, and only for the people who tap it.
    const { phone } = getSite().contact;
    const printed = phone.display.replace(/\D/g, "");
    const dialled = phone.e164.replace(/\D/g, "");
    expect(dialled).toBe(`1${printed}`);
  });

  it("still flags the domain, which is the last outstanding placeholder", () => {
    // Update this once the real domain is in place; the production build
    // stays blocked until then.
    expect(getSite().url.placeholder).toBe(true);
  });

  it("gives the address every field schema.org needs", () => {
    const { address } = getSite().contact;
    for (const field of [
      "street",
      "locality",
      "region",
      "postalCode",
      "country",
    ] as const) {
      expect(address[field], `address.${field} is empty`).toBeTruthy();
    }
    expect(address.region).toHaveLength(2);
  });
});
