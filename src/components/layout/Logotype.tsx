import Link from "next/link";

import { cn } from "@/lib/cn";

type LogotypeProps = {
  name: string;
  nameGurmukhi: string;
  /**
   * `hero` on the home page — clamp(56px, 9vw, 112px).
   * `compact` on inner pages — clamp(40px, 6vw, 68px).
   */
  size: "hero" | "compact";
  /** The home page links its own masthead to itself, exactly as the artboards do. */
  href?: string;
};

/**
 * ਚਸਕਾ over CHASKA. The Gurmukhi is marked `lang="pa"` so a screen reader
 * switches voice rather than spelling it out in English.
 */
export function Logotype({ name, nameGurmukhi, size, href = "/" }: LogotypeProps) {
  return (
    <Link href={href} className="inline-block text-inherit no-underline">
      <span
        lang="pa"
        className={cn(
          "block font-gurmukhi font-semibold text-oxblood",
          size === "hero" ? "mb-1.5 text-mark" : "mb-1 text-[20px] leading-[normal]",
        )}
      >
        {nameGurmukhi}
      </span>
      <span
        className={cn(
          "block font-display tracking-mark",
          size === "hero" ? "text-masthead" : "text-masthead-sm",
        )}
      >
        {name.toUpperCase()}
      </span>
    </Link>
  );
}
