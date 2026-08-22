import type { ElementType, ReactNode } from "react";

type VisuallyHiddenProps = {
  children: ReactNode;
  as?: ElementType;
};

/**
 * Available to assistive technology, invisible on screen. Used to speak the
 * currency the menu prints as a bare numeral.
 */
export function VisuallyHidden({ children, as: Tag = "span" }: VisuallyHiddenProps) {
  return <Tag className="sr-only">{children}</Tag>;
}
