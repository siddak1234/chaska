import { cva, type VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";

import { SmartLink } from "@/components/ui/SmartLink";
import { cn } from "@/lib/cn";

/**
 * The eight calls to action across the three artboards, reduced to three
 * variants and three sizes.
 *
 * Two deliberate departures from the source markup:
 *
 * 1. Hover. The artboards rely on the global `a:hover { color: #8b1e1e }`,
 *    which on a solid ink button paints oxblood text on near-black — 1.96:1,
 *    effectively invisible. Each variant declares its own hover instead.
 * 2. Height. Source buttons land near 38px tall. Vertical padding is set so
 *    every size clears the 44px minimum touch target.
 *
 * `leading-5` is explicit because these are inline-block anchors, where the
 * inherited body line-height would otherwise decide the height.
 */
const buttonVariants = cva(
  [
    "inline-block font-ui text-label leading-5 font-bold tracking-ui uppercase",
    "no-underline transition-colors duration-150",
  ],
  {
    variants: {
      variant: {
        /** Solid ink — the primary action. */
        ink: "bg-ink text-paper hover:bg-oxblood hover:text-paper",
        /** Hairline outline — the secondary action. */
        outline: "border border-ink text-ink hover:border-oxblood hover:text-oxblood",
        /** Solid oxblood — used once, for catering. */
        accent: "bg-oxblood text-paper hover:bg-ink hover:text-paper",
      },
      size: {
        sm: "px-5 py-3",
        md: "px-[22px] py-3",
        lg: "px-[26px] py-[13px]",
      },
    },
    defaultVariants: { variant: "ink", size: "md" },
  },
);

type ButtonLinkProps = VariantProps<typeof buttonVariants> & {
  href: string;
  children: ReactNode;
  className?: string;
};

/** Every call to action in this design is a link, never a form button. */
export function ButtonLink({
  href,
  children,
  variant,
  size,
  className,
}: ButtonLinkProps) {
  return (
    <SmartLink href={href} className={cn(buttonVariants({ variant, size }), className)}>
      {children}
    </SmartLink>
  );
}
