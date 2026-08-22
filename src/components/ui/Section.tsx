import { cva, type VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

/**
 * A page section owns its own top rule and vertical rhythm.
 *
 * The artboards use exactly three rule weights and seven padding pairings;
 * both are enumerated here so no page ever hand-rolls a `border-top`.
 */
const section = cva("", {
  variants: {
    rule: {
      /** Major break — `border-top: 3px double`. */
      double: "rule-double",
      /** Minor break — `border-top: 1px solid` in ink. */
      solid: "border-t border-ink",
      none: "",
    },
    pad: {
      /** clamp(36px, 5vw, 56px) — the home lead. */
      lead: "py-sec-lg",
      /** clamp(32px, 4vw, 48px) — most content sections. */
      md: "py-sec-md",
      /** clamp(28px, 4vw, 44px) — menu courses. */
      sm: "py-sec-sm",
      /** clamp(24px, 3vw, 36px) — the menu photo strip. */
      xs: "py-sec-xs",
      /** clamp(40px, 6vw, 72px) — the About pull quote. */
      xl: "py-sec-xl",
      /** Page headers: taller above than below. */
      header: "pt-sec-lg pb-sec-head",
      /** The catering section closes the menu page, so it sits deeper. */
      catering: "pt-sec-md pb-sec-lg",
    },
  },
  defaultVariants: { rule: "none", pad: "md" },
});

type SectionProps = VariantProps<typeof section> & {
  children: ReactNode;
  className?: string;
  /** Page headers are `<header>`; everything else is a `<section>`. */
  as?: "section" | "header";
  id?: string;
  "aria-labelledby"?: string;
  "aria-label"?: string;
};

export function Section({
  children,
  className,
  rule,
  pad,
  as: Tag = "section",
  id,
  ...aria
}: SectionProps) {
  return (
    <Tag id={id} className={cn(section({ rule, pad }), className)} {...aria}>
      {children}
    </Tag>
  );
}
