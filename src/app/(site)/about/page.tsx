import { PageHeader } from "@/components/sections/PageHeader";
import { PullQuote } from "@/components/sections/PullQuote";
import { SplitFeature } from "@/components/sections/SplitFeature";
import { ButtonLink } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";
import { getAboutPage } from "@/content";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "About",
  description:
    "Chaska means the taste you keep coming back for. Owner Ronika Singh Bhatia cooks the recipes she learned by hand, in Frisco, Texas — with Snoopy, the house shih tzu, as honorary sous chef.",
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
          figure={about.owner.figure}
          figureFirst
          columns="portrait"
        />
      </Section>

      <Section rule="solid" pad="md">
        <SplitFeature
          kicker={about.family.kicker}
          title={about.family.title}
          paragraphs={about.family.paragraphs}
          figure={about.family.figure}
          columns="portrait"
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
