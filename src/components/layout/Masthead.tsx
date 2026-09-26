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
};

export function Masthead({ site, variant }: MastheadProps) {
  const isHero = variant === "hero";

  return (
    <header>
      <Topbar
        place={formatPlace(site.contact.address)}
        descriptor={site.descriptor}
        instagram={site.social.instagram}
      />

      <div
        className={
          isHero
            ? "pt-6 pb-5 text-center sm:pt-9 sm:pb-6"
            : "pt-5 pb-4 text-center sm:pt-7 sm:pb-5"
        }
      >
        <Logotype name={site.name} nameGurmukhi={site.nameGurmukhi} size={variant} />
        {isHero ? (
          <Kicker tone="ink" size="tagline" className="mt-3 sm:mt-[18px]">
            {site.tagline}
          </Kicker>
        ) : null}
      </div>

      <div className="border-b border-ink rule-double">
        <SiteNav links={site.nav} />
      </div>
    </header>
  );
}
