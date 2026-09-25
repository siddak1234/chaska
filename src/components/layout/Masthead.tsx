import type { ReactNode } from "react";

import { Kicker } from "@/components/ui/Kicker";
import type { Site } from "@/content/schema";
import { formatPlace } from "@/lib/format";

import { Logotype } from "./Logotype";
import { SiteNav } from "./SiteNav";
import { Topbar } from "./Topbar";

type MastheadProps = {
  site: Site;
  /**
   * `hero` is the home masthead: the full-width wordmark plus the tagline.
   * `compact` is what every other artboard uses.
   */
  variant: "hero" | "compact";
  /**
   * Something that sits at the right-hand end of the nav rule — the Order
   * page's cart button. The design centres the nav in a three-column grid
   * with this in the last column; below `sm` that grid leaves the nav about
   * 127px, so the action takes its own centred row instead.
   */
  navAction?: ReactNode;
};

export function Masthead({ site, variant, navAction }: MastheadProps) {
  const isHero = variant === "hero";

  return (
    <header>
      <Topbar
        place={formatPlace(site.contact.address)}
        descriptor={site.descriptor}
        instagram={site.social.instagram}
      />

      <div className={isHero ? "py-9 pb-6 text-center" : "pt-7 pb-5 text-center"}>
        <Logotype name={site.name} nameGurmukhi={site.nameGurmukhi} size={variant} />
        {isHero ? (
          <Kicker tone="ink" size="tagline" className="mt-[18px]">
            {site.tagline}
          </Kicker>
        ) : null}
      </div>

      <div className="border-b border-ink rule-double">
        {navAction ? (
          <div className="grid grid-cols-1 justify-items-center sm:grid-cols-[minmax(96px,1fr)_auto_minmax(96px,1fr)] sm:items-center sm:gap-3">
            <span aria-hidden="true" className="hidden sm:block" />
            <SiteNav links={site.nav} />
            <div className="sm:justify-self-end">{navAction}</div>
          </div>
        ) : (
          <SiteNav links={site.nav} />
        )}
      </div>
    </header>
  );
}
