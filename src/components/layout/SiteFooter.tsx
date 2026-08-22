import { SmartLink } from "@/components/ui/SmartLink";
import type { Site } from "@/content/schema";

type SiteFooterProps = {
  site: Site;
};

/** Byte-identical across all three artboards. */
export function SiteFooter({ site }: SiteFooterProps) {
  return (
    <footer className="pt-7 pb-10 text-center rule-double">
      <p
        lang="pa"
        className="font-gurmukhi text-[18px] leading-[normal] font-semibold text-oxblood"
      >
        {site.nameGurmukhi}
      </p>
      <p className="mt-2.5 font-ui text-micro tracking-meta text-ink-muted uppercase">
        {site.footerMeta}
      </p>
      <nav
        aria-label="Footer"
        className="mt-4 flex flex-wrap justify-center gap-x-6 font-ui text-label leading-5 font-semibold tracking-footnav uppercase"
      >
        {site.footerNav.map((link) => (
          <SmartLink key={link.href} href={link.href} className="py-3 no-underline">
            {link.label}
          </SmartLink>
        ))}
      </nav>
    </footer>
  );
}
