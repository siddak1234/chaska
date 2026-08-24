"use client";

import { useEffect } from "react";

import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Kicker } from "@/components/ui/Kicker";
import { Section } from "@/components/ui/Section";

/**
 * Every page here is static, so this should never fire — but if hydration or a
 * client component throws, the alternative is Next's unstyled default screen.
 *
 * Deliberately does NOT use `SiteShell`. This is a client component, so
 * anything it imports joins the browser bundle: pulling in `SiteShell` meant
 * `getSite()` came with it, which eagerly parses every content file through
 * Zod — 296KB of menu, prose and contact details shipped to every visitor of
 * every page, for a screen almost nobody sees. It uses only the presentational
 * primitives, which import nothing but `cva` and `cn`.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Container>
      <Section pad="xl">
        <div className="mx-auto max-w-menu-intro text-center">
          <Kicker className="mb-3.5">Notice</Kicker>
          <Heading level={1} size="titleAbout">
            Something went wrong in the kitchen
          </Heading>
          <p className="mt-5 text-prose text-ink-secondary">
            This page failed to load. Trying again usually sorts it out.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3.5">
            <button
              type="button"
              onClick={reset}
              className="inline-block cursor-pointer bg-ink px-[22px] py-3 font-ui text-label leading-5 font-bold tracking-ui text-paper uppercase transition-colors duration-150 hover:bg-oxblood"
            >
              Try again
            </button>
            <ButtonLink href="/" variant="outline">
              Back to the front page
            </ButtonLink>
          </div>
        </div>
      </Section>
    </Container>
  );
}
