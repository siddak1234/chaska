"use client";

import { usePathname } from "next/navigation";

import { SmartLink } from "@/components/ui/SmartLink";
import type { Link } from "@/content/schema";
import { cn } from "@/lib/cn";
import { routeOf } from "@/lib/routes";

type SiteNavProps = {
  links: readonly Link[];
};

/**
 * The masthead navigation.
 *
 * Two changes from the artboards. `aria-current` is derived from the route
 * rather than hardcoded per file, so it cannot drift out of sync. And each
 * link carries its own vertical padding, giving a 44px touch target where the
 * source relied on bare 13px text.
 *
 * A link to a fragment is never marked current: it points into a page, not at
 * the page itself.
 */
export function SiteNav({ links }: SiteNavProps) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="flex flex-wrap items-center justify-center gap-x-gap-nav font-ui text-nav leading-5 font-semibold tracking-ui uppercase"
    >
      {links.map((link) => {
        const isCurrent = !link.href.includes("#") && routeOf(link.href) === pathname;
        return (
          <SmartLink
            key={link.href}
            href={link.href}
            aria-current={isCurrent ? "page" : undefined}
            className={cn("py-3 no-underline", isCurrent && "text-oxblood")}
          >
            {link.label}
          </SmartLink>
        );
      })}
    </nav>
  );
}
