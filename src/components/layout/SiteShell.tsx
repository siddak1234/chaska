import type { ReactNode } from "react";

import { Container } from "@/components/ui/Container";
import { getSite } from "@/content";

import { Masthead } from "./Masthead";
import { SiteFooter } from "./SiteFooter";
import { SkipLink } from "./SkipLink";

type SiteShellProps = {
  /** `hero` on the home page; `compact` everywhere else. */
  variant: "hero" | "compact";
  children: ReactNode;
};

/**
 * Masthead, content column and footer — the frame every artboard repeats
 * verbatim. Used by the two route-group layouts, which differ only in which
 * masthead they ask for; deriving the variant from the route at runtime would
 * mean shipping the masthead as a client component for no benefit.
 */
export function SiteShell({ variant, children }: SiteShellProps) {
  const site = getSite();

  return (
    <>
      <SkipLink />
      <Container>
        <Masthead site={site} variant={variant} />
        <main id="main">{children}</main>
        <SiteFooter site={site} />
      </Container>
    </>
  );
}
