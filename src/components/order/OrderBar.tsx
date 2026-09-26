"use client";

import type { Category } from "@/content/schema";

import { CartButton } from "./CartButton";

type OrderBarProps = {
  /** Today's categories, in page order. */
  categories: readonly Category[];
};

/** Anchor id of a category's section on the Order page. */
export function categoryAnchor(id: string): string {
  return `category-${id}`;
}

/**
 * The Order page's bar: a jump link per category and the cart, held at the
 * top of the screen while the dishes scroll beneath it. On a phone the links
 * scroll sideways rather than wrap, so the bar stays one row high.
 *
 * The links are plain anchors — they work before hydration and without script.
 */
export function OrderBar({ categories }: OrderBarProps) {
  return (
    <div className="sticky top-0 z-20 border-b border-ink bg-paper max-sm:-mx-gutter max-sm:px-gutter">
      <div className="flex items-center gap-3">
        {categories.length > 1 ? (
          <nav
            aria-label="Categories"
            // The fade tells a phone user the row scrolls; it clears the last
            // link once the row is scrolled to its end.
            className="min-w-0 flex-1 overflow-x-auto [mask-image:linear-gradient(to_right,black_calc(100%-32px),transparent)] pr-6"
          >
            <ul className="flex gap-x-5 whitespace-nowrap">
              {categories.map((category) => (
                <li key={category.id}>
                  <a
                    href={`#${categoryAnchor(category.id)}`}
                    className="inline-block py-3 font-ui text-label leading-5 font-semibold tracking-ui uppercase no-underline"
                  >
                    {category.englishName}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ) : (
          <span className="flex-1" />
        )}
        <CartButton />
      </div>
    </div>
  );
}
