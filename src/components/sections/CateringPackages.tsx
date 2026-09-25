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

export function CateringPackages({ catering, cta }: CateringPackagesProps) {
  return (
    <>
      <div className="mx-auto mb-9 max-w-catering-intro text-center">
        <Kicker className="mb-3">{catering.kicker}</Kicker>
        <Heading level={2} size="catering" id="catering-heading">
          {catering.title}
        </Heading>
        <Prose
          paragraphs={[catering.intro]}
          size="intro"
          tone="secondary"
          className="mt-4"
        />
      </div>

      <div className="grid auto-grid-250 gap-6">
        {catering.packages.map((pkg) => (
          <NoticeCard
            key={pkg.id}
            variant="package"
            kicker={pkg.kicker}
            title={pkg.name}
            body={pkg.description}
          />
        ))}
      </div>

      <div className="mt-9 text-center">
        <ButtonLink href={cta.href} variant="ink" size="lg">
          {cta.label}
        </ButtonLink>
      </div>
    </>
  );
}
