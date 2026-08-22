import { PageHeader } from "@/components/sections/PageHeader";
import { PullQuote } from "@/components/sections/PullQuote";
import { SplitFeature } from "@/components/sections/SplitFeature";
import { ButtonLink } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";
import { getAboutPage } from "@/content";
import type { ImageId } from "@/content/generated/images";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "About",
  description:
    "Chaska means the taste you keep coming back for. Owner Ronika Singh cooks the recipes she learned by hand — and Snoopy, the house shih tzu, supervises the dining room.",
  path: "/about",
});

export default function AboutPage() {
  const about = getAboutPage();
  const [primaryAction, secondaryAction] = about.quote.actions;

  return (
    <>
      <PageHeader
        kicker={about.kicker}
        title={about.title}
        intro={about.intro}
        measure="about"
        headingSize="titleAbout"
      />

      <Section rule="double" pad="md">
        <SplitFeature
          kicker={about.owner.kicker}
          title={about.owner.title}
          paragraphs={about.owner.paragraphs}
          figure={{
            imageId: about.owner.figure.imageId as ImageId | null,
            caption: about.owner.figure.caption,
            ratio: about.owner.figure.ratio,
            emptyLabel: about.owner.figure.emptyLabel,
          }}
          figureFirst
        />
      </Section>

      <Section rule="solid" pad="md">
        <SplitFeature
          kicker={about.family.kicker}
          title={about.family.title}
          paragraphs={about.family.paragraphs}
          figure={{
            imageId: about.family.figure.imageId as ImageId,
            caption: about.family.figure.caption,
            ratio: about.family.figure.ratio,
          }}
        />
      </Section>

      <Section rule="double" pad="xl">
        <PullQuote
          text={about.quote.text}
          attribution={about.quote.attribution}
          actions={
            <>
              {primaryAction ? (
                <ButtonLink href={primaryAction.href} variant="ink">
                  {primaryAction.label}
                </ButtonLink>
              ) : null}
              {secondaryAction ? (
                <ButtonLink href={secondaryAction.href} variant="outline">
                  {secondaryAction.label}
                </ButtonLink>
              ) : null}
            </>
          }
        />
      </Section>
    </>
  );
}
