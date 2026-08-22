import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

type ContainerProps = {
  children: ReactNode;
  className?: string;
};

/**
 * The single column every artboard sits in:
 * `max-width: 1240px; margin: 0 auto; padding: 0 clamp(16px, 4vw, 48px)`.
 *
 * `box-content` is load-bearing. The artboards have no `box-sizing` reset, so
 * that div is content-box: 1240px of *content* with the gutter outside it,
 * 1336px overall. Tailwind's preflight makes everything border-box, which would
 * put the gutter inside the 1240 and leave a 1144px column — 8% narrower than
 * designed, changing every line break on the site.
 *
 * No `w-full`: with content-box that would add the gutter on top of 100% and
 * overflow the viewport. A block element already fills its parent.
 */
export function Container({ children, className }: ContainerProps) {
  return (
    <div className={cn("mx-auto box-content max-w-page px-gutter", className)}>
      {children}
    </div>
  );
}
