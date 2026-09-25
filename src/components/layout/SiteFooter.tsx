import { SmartLink } from "@/components/ui/SmartLink";
import type { Site } from "@/content/schema";
import { formatPlace, telHref } from "@/lib/format";

import { InstagramLink } from "./InstagramLink";

type SiteFooterProps = {
  site: Site;
};

/**
 * Identical across every artboard: the Gurmukhi mark, one line of what and
 * where, and the footer nav ending in Instagram.
 *
 * One addition. The design removes the phone number from the masthead; it is
 * kept here, on every page, by the owner's decision, since orders are
 * confirmed by text.
 */
export function SiteFooter({ site }: SiteFooterProps) {
  const linkClass = "py-3 no-underline";

  return (
    <footer className="pt-7 pb-10 text-center rule-double">
      <p
        lang="pa"
        className="font-gurmukhi text-[18px] leading-[normal] font-semibold text-oxblood"
      >
        {site.nameGurmukhi}
      </p>
      <p className="mt-2.5 font-ui text-micro tracking-meta text-ink-muted uppercase">
        {site.name} · {site.descriptor} · {formatPlace(site.contact.address)}
      </p>
      <p className="font-ui text-micro tracking-meta text-ink-muted uppercase">
        Call or text{" "}
        <SmartLink
          href={telHref(site.contact.phone.e164)}
          className="inline-block py-3 text-ink no-underline"
        >
          {site.contact.phone.display}
        </SmartLink>
      </p>
      <nav
        aria-label="Footer"
        className="mt-1 flex flex-wrap justify-center gap-x-6 font-ui text-label leading-5 font-semibold tracking-footnav uppercase"
      >
        {site.footerNav.map((link) => (
          <SmartLink key={link.href} href={link.href} className={linkClass}>
            {link.label}
          </SmartLink>
        ))}
        <InstagramLink
          handle={site.social.instagram}
          display="label"
          className={linkClass}
        />
      </nav>
    </footer>
  );
}
