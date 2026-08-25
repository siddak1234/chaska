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

  it("carries the restaurant's seven courses", () => {
    expect(getMenu().courses.map((c) => c.name)).toEqual([
      "Shuruaat",
      "Ghar di Rasoi",
      "Chawal",
      "Maas te Machhi",
      "Chinese",
      "Rotiyan",
      "Mitha te Thanda",
    ]);
  });

  it("carries every dish on the menu", () => {
    // 78 from the restaurant's own list plus the eight breads and desserts
    // carried over from the sample menu.
    expect(getAllMenuItems()).toHaveLength(86);
  });

  it("lists no dish twice", () => {
    // The source menu listed capsicum paneer, chilli paneer, chilli chicken and
    // chicken biryani in two places each; those were resolved to one entry.
    const names = getAllMenuItems().map((i) => i.name.toLowerCase());
    expect(new Set(names).size).toBe(names.length);
  });

  it("marks every meat and fish dish inside an otherwise vegetarian course", () => {
    const flagged = getMenu()
      .courses.filter((c) => c.englishName !== "Non-vegetarian")
      .flatMap((c) => c.items)
      .filter((i) => /chicken|mutton|fish|keema/i.test(i.name));
    expect(flagged.length).toBeGreaterThan(0);
    for (const item of flagged) {
      expect(item.nonVeg, `${item.name} is not flagged non-veg`).toBe(true);
    }
  });

  it("describes every dish whose definition could be verified", () => {
    // Descriptions are canonical definitions of each dish, researched rather
    // than invented, for Ronika to adjust to her own kitchen. The four without
    // one are deliberate: two are salads whose composition nobody stated, and
    // two are names that could not be verified at all.
    const undescribed = getAllMenuItems()
      .filter((item) => !item.description)
      .map((item) => item.name)
      .sort();

    expect(undescribed).toEqual([
      "Coin Veg Tikki",
      "Corn Salad",
      "Fried Tandoori Paneer",
      "Pasta Salad",
    ]);
  });

  it("keeps descriptions short enough to sit under a name", () => {
    for (const item of getAllMenuItems()) {
      if (!item.description) continue;
      expect(
        item.description.length,
        `${item.name}: ${item.description.length} chars`,
      ).toBeLessThanOrEqual(90);
      // A description is a sentence, not a fragment.
      expect(item.description.endsWith("."), `${item.name}: no full stop`).toBe(true);
    }
  });

  it("publishes without prices until real ones arrive", () => {
    // The old prices came from the artboard. Showing sample figures beside a
    // real menu would be worse than showing none.
    expect(getAllMenuItems().every((i) => i.price === undefined)).toBe(true);
  });

  it("keeps any price it does have as whole dollars, as printed", () => {
    // Most of the menu is published without prices; those that exist must
    // still be whole dollars, because that is how the design prints them.
    for (const item of getAllMenuItems()) {
      if (!item.price) continue;
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

  it("fills the owner portrait slot with a real photograph", () => {
    // Empty on the artboard, and deliberately left empty rather than filled
    // with a stock photo of a stranger, until the real portrait arrived.
    const figure = getAboutPage().owner.figure;
    expect(figure.imageId).toBe("about-ronika");
    expect(figure.ratio).toBe("4/5");
    // The empty-state label stays as the fallback if the id is ever cleared.
    expect(figure.emptyLabel).toBeTruthy();
  });

  it("names the owner consistently", () => {
    const about = getAboutPage();
    expect(about.owner.title).toBe("Ronika Singh Bhatia");
    expect(about.quote.attribution).toBe("Ronika Singh Bhatia");
    expect(about.owner.figure.caption).toContain("Ronika Singh Bhatia");
  });

  it("carries real contact details, not the artboard placeholders", () => {
    const { contact } = getSite();

    expect(contact.phone.placeholder).toBe(false);
    expect(contact.email.placeholder).toBe(false);
    expect(contact.address.placeholder).toBe(false);

    expect(contact.phone.e164).toBe("+12148017809");
    expect(contact.email.general).toBe("ronikajit@gmail.com");
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

  it("has no placeholder content left", () => {
    // All four groups are real, so `NEXT_PUBLIC_SITE_ENV=production` builds.
    const site = getSite();
    expect(site.url.placeholder).toBe(false);
    expect(site.url.value).toBe("https://eatchaska.com");
    expect(site.contact.phone.placeholder).toBe(false);
    expect(site.contact.email.placeholder).toBe(false);
    expect(site.contact.address.placeholder).toBe(false);
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
