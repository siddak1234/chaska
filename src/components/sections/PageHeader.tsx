import type { ReactNode } from "react";

import { Heading } from "@/components/ui/Heading";
import { Kicker } from "@/components/ui/Kicker";
import { Prose } from "@/components/ui/Prose";
import { Section } from "@/components/ui/Section";
import { cn } from "@/lib/cn";

type PageHeaderProps = {
  kicker: string;
  title: ReactNode;
  intro: string;
  /** The Menu and About artboards use slightly different measures. */
  measure: "menu" | "about";
  headingSize: "title" | "titleAbout";
};

/** The centred opening block on the Menu, About and Credits pages. */
export function PageHeader({
  kicker,
  title,
  intro,
  measure,
  headingSize,
}: PageHeaderProps) {
  return (
    <Section
      as="header"
      pad="header"
      className={cn(
        "mx-auto text-center",
        measure === "menu" ? "max-w-menu-intro" : "max-w-about-intro",
      )}
    >
      <Kicker className="mb-3.5">{kicker}</Kicker>
      <Heading level={1} size={headingSize}>
        {title}
      </Heading>
      <Prose paragraphs={[intro]} size="body" tone="secondary" className="mt-5" />
    </Section>
  );
}
