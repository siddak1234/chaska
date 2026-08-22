import Link from "next/link";

import { SiteShell } from "@/components/layout/SiteShell";
import { ButtonLink } from "@/components/ui/Button";
import { Heading } from "@/components/ui/Heading";
import { Kicker } from "@/components/ui/Kicker";
import { Section } from "@/components/ui/Section";
import { getSite } from "@/content";

export default function NotFound() {
  const site = getSite();

  return (
    <SiteShell variant="compact">
      <Section pad="xl">
        <div className="mx-auto max-w-menu-intro text-center">
          <Kicker className="mb-3.5">Error · 404</Kicker>
          <Heading level={1} size="titleAbout">
            This page is not on the menu
          </Heading>
          <p className="mt-5 text-prose text-ink-secondary">
            The page you were looking for has moved or never existed. The menu, our
            story and everything else are a click away.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3.5">
            <ButtonLink href="/menu" variant="ink">
              View the menu
            </ButtonLink>
            <ButtonLink href="/" variant="outline">
              Back to the front page
            </ButtonLink>
          </div>
          <p className="mt-8 text-note text-ink-muted">
            Or call us on{" "}
            <Link href={`tel:${site.contact.phone.e164}`}>
              {site.contact.phone.display}
            </Link>
            .
          </p>
        </div>
      </Section>
    </SiteShell>
  );
}
