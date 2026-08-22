import { Kicker } from "@/components/ui/Kicker";
import type { Site } from "@/content/schema";
import { telHref } from "@/lib/format";

import { Logotype } from "./Logotype";
import { SiteNav } from "./SiteNav";
import { Topbar } from "./Topbar";

type MastheadProps = {
  site: Site;
  /**
   * `hero` is the home masthead: the full-width wordmark plus the tagline.
   * `compact` is what the Menu and About artboards use.
   */
  variant: "hero" | "compact";
};

export function Masthead({ site, variant }: MastheadProps) {
  const isHero = variant === "hero";

  return (
    <header>
      <Topbar items={site.topbar} />

      <div className={isHero ? "py-9 pb-6 text-center" : "pt-7 pb-5 text-center"}>
        <Logotype name={site.name} nameGurmukhi={site.nameGurmukhi} size={variant} />
        {isHero ? (
          <Kicker tone="ink" size="tagline" className="mt-[18px]">
            {site.tagline}
          </Kicker>
        ) : null}
      </div>

      <div className="border-b border-ink rule-double">
        <SiteNav
          links={site.nav}
          reserve={{
            label: `Reserve · ${site.contact.phone.display}`,
            href: telHref(site.contact.phone.e164),
          }}
        />
      </div>
    </header>
  );
}
