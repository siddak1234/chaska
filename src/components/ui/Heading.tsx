import { cva, type VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

/**
 * Display headings. Every heading in the design is Libre Caslon Display at
 * regular weight — there is no bold Caslon anywhere in the artboards — so
 * `level` (semantics) and `size` (appearance) are separate props.
 */
const heading = cva("font-display font-normal", {
  variants: {
    size: {
      /** clamp(30px, 4.2vw, 54px) — the home page's headline. */
      lead: "text-lead",
      /** clamp(30px, 5vw, 58px) — Menu and Order page titles. */
      title: "text-title",
      /** clamp(30px, 4.6vw, 54px) — the about page title. */
      titleAbout: "text-title-about",
      /** clamp(24px, 2.6vw, 34px) — "From the Kitchen". */
      section: "text-section",
      /** clamp(24px, 3vw, 38px) — split-feature headings. */
      feature: "text-feature",
      /** clamp(28px, 3.4vw, 40px) — the Catering page title. */
      catering: "text-catering",
      /** clamp(26px, 2.6vw, 30px) — menu course names. */
      course: "text-course",
      /** clamp(24px, 2.4vw, 28px) — two-up course names, Order page categories. */
      courseSm: "text-course-sm",
      /** 26px — notices, e.g. an empty daily menu. */
      notice: "text-notice",
      /** clamp(21px, 2vw, 24px) — catering packages, the cart drawer. */
      dish: "text-dish",
      /** clamp(19px, 1.8vw, 22px) — dish names on the home page and Order cards. */
      item: "text-item",
    },
  },
  defaultVariants: { size: "section" },
});

type HeadingProps = VariantProps<typeof heading> & {
  level: 1 | 2 | 3;
  children: ReactNode;
  className?: string;
  id?: string;
};

export function Heading({ level, children, size, className, id }: HeadingProps) {
  const Tag = `h${level}` as const;
  return (
    <Tag id={id} className={cn(heading({ size }), className)}>
      {children}
    </Tag>
  );
}
