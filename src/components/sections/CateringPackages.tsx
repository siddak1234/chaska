import { ButtonLink } from "@/components/ui/Button";
import { Heading } from "@/components/ui/Heading";
import { Kicker } from "@/components/ui/Kicker";
import { Prose } from "@/components/ui/Prose";
import type { Catering, Link } from "@/content/schema";

import { NoticeCard } from "./NoticeCard";

type CateringPackagesProps = {
  catering: Catering;
  /** Composed by the page from `site.social.instagram`. */
  cta: Link;
};

/**
 * The Catering page: heading, the Instagram call to action where a phone shows
 * it without scrolling, then the three packages.
 */
export function CateringPackages({ catering, cta }: CateringPackagesProps) {
  return (
    <>
      <div className="mx-auto mb-8 max-w-catering-intro text-center sm:mb-10">
        <Kicker className="mb-3">{catering.kicker}</Kicker>
        <Heading level={1} size="catering" id="catering-heading">
          {catering.title}
        </Heading>
        <Prose
          paragraphs={[catering.intro]}
          size="intro"
          tone="secondary"
          className="mt-4"
        />
        <ButtonLink href={cta.href} variant="ink" size="lg" className="mt-6">
          {cta.label}
        </ButtonLink>
      </div>

      <div className="grid auto-grid-250 gap-4 sm:gap-6">
        {catering.packages.map((pkg) => (
          <NoticeCard
            key={pkg.id}
            variant="package"
            title={pkg.name}
            body={pkg.description}
          />
        ))}
      </div>
    </>
  );
}
