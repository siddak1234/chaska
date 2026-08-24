import { describe, expect, it } from "vitest";

import { getUniqueCredits, images } from "@/content/generated/images";
import { imageCreditSchema } from "@/content/schema";

/**
 * Every photograph is CC BY or CC BY-SA with attribution required. If any of
 * these fields is empty the `/credits` page renders an incomplete credit and
 * the site is out of licence compliance.
 */
describe("image manifest", () => {
  it("covers all nine artboard slots plus the owner portrait", () => {
    expect(Object.keys(images).sort()).toEqual(
      [
        "about-ronika",
        "about-snoopy",
        "home-dal",
        "home-hero",
        "home-saag",
        "home-table",
        "home-tandoori",
        "menu-saag",
        "menu-table",
        "menu-tandoori",
      ].sort(),
    );
  });

  it("has a real photograph in the owner slot", () => {
    // This was an empty frame until the portrait arrived.
    const slot = images["about-ronika"];
    expect(slot.image.src).toMatch(/ronika-portrait/);
    expect(slot.image.width / slot.image.height).toBeCloseTo(4 / 5, 3);
    expect(slot.alt).toBe("Ronika Singh Bhatia, owner of Chaska");
  });

  it("carries no third-party credit on owned photographs", () => {
    expect(images["about-ronika"].credit).toBeNull();
  });

  it("gives every slot non-empty alt text", () => {
    for (const [id, slot] of Object.entries(images)) {
      expect(slot.alt.trim().length, `${id} has no alt text`).toBeGreaterThan(0);
    }
  });

  it("gives every slot a complete, attributable credit", () => {
    // `imageCreditSchema` is the single definition of "complete" — the
    // generated manifest is code, so nothing else validates it at runtime.
    for (const [id, slot] of Object.entries(images)) {
      if (!slot.credit) continue; // owned, nothing to attribute
      const result = imageCreditSchema.safeParse(slot.credit);
      expect(
        result.success,
        `${id}: ${result.success ? "" : JSON.stringify(result.error.issues)}`,
      ).toBe(true);
      expect(slot.credit.sourceUrl, `${id}: source url`).toMatch(
        /^https:\/\/commons\.wikimedia\.org\//,
      );
    }
  });

  it("deduplicates shared photographs for the credits page", () => {
    const credits = getUniqueCredits();
    // Nine slots, six distinct files — tandoori, saag and the table each
    // appear on both Home and Menu.
    expect(credits).toHaveLength(6);
    expect(new Set(credits.map((c) => c.fileName)).size).toBe(6);
  });
});
