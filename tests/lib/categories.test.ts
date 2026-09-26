import { describe, expect, it } from "vitest";

import type { Category } from "@/content/schema";
import { FALLBACK_CATEGORY, findCategory, groupByCategory } from "@/lib/categories";

const CATEGORIES: Category[] = [
  { id: "small-plates", name: "Shuruaat", englishName: "Small plates" },
  { id: "home-kitchen", name: "Ghar di Rasoi", englishName: "From the home kitchen" },
  { id: "sweet", name: "Mitha", englishName: "Sweet" },
];

const dish = (id: string, categoryId: string) => ({ id, categoryId });

function shape(
  groups: ReturnType<typeof groupByCategory<{ id: string; categoryId: string }>>,
) {
  return groups.map((g) => [g.category.id, g.items.map((i) => i.id)]);
}

describe("groupByCategory", () => {
  it("orders groups by the category list, not by the order dishes arrive in", () => {
    // Shopify returns today's products in whatever order the collection sorts.
    const groups = groupByCategory(
      [
        dish("panjiri", "sweet"),
        dish("kadhi", "home-kitchen"),
        dish("dahi", "small-plates"),
      ],
      CATEGORIES,
    );
    expect(shape(groups)).toEqual([
      ["small-plates", ["dahi"]],
      ["home-kitchen", ["kadhi"]],
      ["sweet", ["panjiri"]],
    ]);
  });

  it("keeps each category's dishes in the order given", () => {
    const groups = groupByCategory(
      [dish("b", "small-plates"), dish("a", "small-plates")],
      CATEGORIES,
    );
    expect(shape(groups)).toEqual([["small-plates", ["b", "a"]]]);
  });

  it("leaves out a category with nothing on today's menu", () => {
    const groups = groupByCategory([dish("panjiri", "sweet")], CATEGORIES);
    expect(shape(groups)).toEqual([["sweet", ["panjiri"]]]);
  });

  it("never drops a dish with an unknown category — it goes last, under More", () => {
    const groups = groupByCategory(
      [dish("mystery", "specials"), dish("dahi", "small-plates")],
      CATEGORIES,
    );
    expect(shape(groups)).toEqual([
      ["small-plates", ["dahi"]],
      [FALLBACK_CATEGORY.id, ["mystery"]],
    ]);
  });

  it("returns no groups for an empty menu", () => {
    expect(groupByCategory([], CATEGORIES)).toEqual([]);
  });

  it("holds for any random subset of the catalogue", () => {
    const all = [
      dish("dahi", "small-plates"),
      dish("idli", "small-plates"),
      dish("kadhi", "home-kitchen"),
      dish("panjiri", "sweet"),
    ];
    for (let mask = 0; mask < 2 ** all.length; mask++) {
      const today = all.filter((_, i) => mask & (1 << i)).reverse();
      const groups = groupByCategory(today, CATEGORIES);
      const listed = groups.flatMap((g) => g.items);
      expect(listed).toHaveLength(today.length);
      for (const group of groups) {
        expect(group.items.length).toBeGreaterThan(0);
        for (const item of group.items) expect(item.categoryId).toBe(group.category.id);
      }
    }
  });
});

describe("findCategory", () => {
  it.each(["small-plates", "Shuruaat", "small plates", "  SMALL PLATES "])(
    "matches %j to Shuruaat",
    (label) => {
      expect(findCategory(label, CATEGORIES)?.id).toBe("small-plates");
    },
  );

  it.each(["", null, undefined, "Specials"])("matches nothing for %j", (label) => {
    expect(findCategory(label, CATEGORIES)).toBeUndefined();
  });
});
