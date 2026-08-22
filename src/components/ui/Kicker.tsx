import { cva, type VariantProps } from "class-variance-authority";
import type { ElementType, ReactNode } from "react";

import { cn } from "@/lib/cn";

/**
 * The small uppercase, letterspaced label that opens almost every block on the
 * site — "The Lead", "Notice · Catering", "Appetizers", "10 to 25 guests".
 * Fifteen of these are hand-styled across the three artboards.
 */
const kicker = cva("font-ui uppercase", {
  variants: {
    tone: {
      accent: "text-oxblood",
      ink: "text-ink",
      muted: "text-ink-muted",
    },
    size: {
      /** 12px / 0.18em — section kickers. */
      md: "text-label font-bold tracking-kicker",
      /** 11px / 0.18em — course subtitles on the menu. */
      sm: "text-micro font-bold tracking-kicker",
      /** 11px / 0.14em — the Hours and Contact labels. */
      label: "text-micro font-bold tracking-ui",
      /** 11px / 0.16em — catering guest counts, footer meta. */
      meta: "text-micro font-bold tracking-meta",
      /** 12px / 0.22em, regular — the masthead tagline. */
      tagline: "text-label font-normal tracking-tagline",
    },
  },
  defaultVariants: { tone: "accent", size: "md" },
});

type KickerProps = VariantProps<typeof kicker> & {
  children: ReactNode;
  className?: string;
  as?: ElementType;
};

export function Kicker({
  children,
  className,
  tone,
  size,
  as: Tag = "p",
}: KickerProps) {
  return <Tag className={cn(kicker({ tone, size }), className)}>{children}</Tag>;
}
