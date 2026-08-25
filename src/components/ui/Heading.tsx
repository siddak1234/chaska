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
      /** clamp(36px, 5.2vw, 68px) — the home page's front-page headline. */
      hero: "text-hero",
      /** clamp(34px, 4.2vw, 54px) — the home lead. */
      lead: "text-lead",
      /** clamp(36px, 5vw, 58px) — the menu page title. */
      title: "text-title",
      /** clamp(34px, 4.6vw, 54px) — the about page title. */
      titleAbout: "text-title-about",
      /** clamp(24px, 2.6vw, 34px) — "From the Kitchen". */
      section: "text-section",
      /** clamp(26px, 3vw, 38px) — split-feature headings. */
      feature: "text-feature",
      /** clamp(28px, 3.4vw, 40px) — the catering heading. */
      catering: "text-catering",
      /** 30px — menu course names. */
      course: "text-course",
      /** 28px — the narrower breads/desserts course names. */
      courseSm: "text-course-sm",
      /** 26px — the home catering notice. */
      notice: "text-notice",
      /** 24px — dish cards and catering packages. */
      dish: "text-dish",
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
