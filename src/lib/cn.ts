import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * `globals.css` clears Tailwind's default palettes and defines the
 * restaurant's own, so tailwind-merge cannot infer which group a class belongs
 * to. Without this, `cn("text-ink", "text-lead")` would collapse a colour and a
 * size into one another — see `tests/lib/cn.test.ts`.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-family": [{ font: ["display", "body", "ui", "gurmukhi"] }],
      "font-size": [
        {
          text: [
            "masthead",
            "masthead-sm",
            "mark",
            "lead",
            "title",
            "title-about",
            "section",
            "feature",
            "catering",
            "quote",
            "course",
            "course-sm",
            "notice",
            "dish",
            "row",
            "row-sm",
            "lede",
            "prose",
            "intro",
            "card",
            "note",
            "price",
            "price-sm",
            "nav",
            "label",
            "micro",
          ],
        },
      ],
      "text-color": [
        {
          text: [
            "paper",
            "ink",
            "ink-secondary",
            "ink-muted",
            "oxblood",
            "rule",
            "leader",
          ],
        },
      ],
      tracking: [{ tracking: ["mark", "footnav", "ui", "meta", "kicker", "tagline"] }],
    },
  },
});

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
