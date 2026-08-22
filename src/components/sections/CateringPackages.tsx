import { Heading } from "@/components/ui/Heading";
import { ButtonLink } from "@/components/ui/Button";
import { Kicker } from "@/components/ui/Kicker";
import { Prose } from "@/components/ui/Prose";
import type { Catering } from "@/content/schema";
import { mailtoHref } from "@/lib/format";

import { NoticeCard } from "./NoticeCard";

type CateringPackagesProps = {
  catering: Catering;
  /** Composed from `site.contact.email.catering` by the page. */
  email: string;
};

export function CateringPackages({ catering, email }: CateringPackagesProps) {
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
            kicker={pkg.guests}
            title={pkg.name}
            body={pkg.description}
            footer={
              <p className="font-ui text-[13px] leading-[normal] font-semibold">
                {pkg.pricing}
              </p>
            }
          />
        ))}
      </div>

      <div className="mt-9 text-center">
        <ButtonLink
          href={mailtoHref(email, "Catering enquiry")}
          variant="ink"
          size="lg"
        >
          {catering.ctaLabel}
        </ButtonLink>
      </div>
    </>
  );
}
