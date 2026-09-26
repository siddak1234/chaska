import type { Category } from "@/content/schema";

/**
 * Grouping dishes under their category headings.
 *
 * The Order page lists whatever is on sale today — on Shopify, whichever
 * products are in the daily menu collection — so the grouping has to hold for
 * any subset of the catalogue, in any order:
 *
 *  - groups follow the category order in `dishes.data.json`, never the order
 *    the dishes arrived in;
 *  - a category with no dish today is left out rather than shown empty;
 *  - a dish whose category is unknown is never dropped: it is listed under
 *    `FALLBACK_CATEGORY`, last.
 */

/** ਹੋਰ, "more": where a dish with no known category is listed. */
export const FALLBACK_CATEGORY: Category = {
  id: "more",
  name: "Hor",
  englishName: "More from the kitchen",
};

export type CategoryGroup<T> = { category: Category; items: T[] };

export function groupByCategory<T extends { categoryId: string }>(
  items: readonly T[],
  categories: readonly Category[],
): CategoryGroup<T>[] {
  const known = new Set(categories.map((category) => category.id));
  const groups = categories.map((category) => ({
    category,
    items: items.filter((item) => item.categoryId === category.id),
  }));
  const unplaced = items.filter((item) => !known.has(item.categoryId));

  return [...groups, { category: FALLBACK_CATEGORY, items: unplaced }].filter(
    (group) => group.items.length > 0,
  );
}

/**
 * The category a label names, matched on id, Punjabi name or English name,
 * ignoring case — so a Shopify product type of "Small plates" or "shuruaat"
 * both land under Shuruaat. `undefined` when nothing matches.
 */
export function findCategory(
  label: string | null | undefined,
  categories: readonly Category[],
): Category | undefined {
  const wanted = label?.trim().toLowerCase();
  if (!wanted) return undefined;
  return categories.find((category) =>
    [category.id, category.name, category.englishName].some(
      (value) => value.toLowerCase() === wanted,
    ),
  );
}
