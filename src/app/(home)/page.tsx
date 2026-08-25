import { Figure } from "@/components/media/Figure";
import { DishGrid } from "@/components/sections/DishGrid";
import { NoticeCard } from "@/components/sections/NoticeCard";
import { SplitFeature } from "@/components/sections/SplitFeature";
import { VisitingCard } from "@/components/sections/VisitingCard";
import { ButtonLink } from "@/components/ui/Button";
import { Heading } from "@/components/ui/Heading";
import { Kicker } from "@/components/ui/Kicker";
import { Prose } from "@/components/ui/Prose";
import { Section } from "@/components/ui/Section";
import { getHomePage, getSite } from "@/content";
import type { ImageId } from "@/content/generated/images";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Home",
  description:
    "Chaska serves Punjabi home cooking in Frisco, Texas, from family recipes kept across three generations. Dal simmered overnight, saag stirred through the afternoon, rotis off the tawa.",
  path: "/",
});

export default function HomePage() {
  const site = getSite();
  const { lead, kitchen, family, cateringNotice, visiting } = getHomePage();
  const [primaryAction, secondaryAction] = lead.actions;

  return (
    <>
      {/*
        The front page. Previously this was a two-up of prose beside a
        half-width photograph, which put a paragraph first and left the lead
        image entirely below the fold on a phone (it began at y=888 in a
        844px viewport). Headline, then the calls to action, then a
        full-width photograph — the newspaper order, and the one every
        well-regarded restaurant site follows: one dominant image, the name,
        a line of what it is, and a way to act.
      */}
      <Section pad="lead">
        {lead.kicker ? <Kicker>{lead.kicker}</Kicker> : null}
        <Heading level={1} size="hero" className="mt-3.5 max-w-[22ch]">
          {lead.title}
        </Heading>

        <div className="mt-7 flex flex-wrap gap-3.5">
          {primaryAction ? (
            <ButtonLink href={primaryAction.href} variant="ink" size="lg">
              {primaryAction.label}
            </ButtonLink>
          ) : null}
          {secondaryAction ? (
            <ButtonLink href={secondaryAction.href} variant="outline" size="lg">
              {secondaryAction.label}
            </ButtonLink>
          ) : null}
        </div>

        <Figure
          imageId={lead.figure.imageId as ImageId}
          caption={lead.figure.caption}
          ratio={lead.figure.ratio}
          span="full"
          priority
          className="mt-sec-md"
        />

        {/* Body copy sets in two columns beneath the picture, as a lead story
            does. One column on a phone, where a second would be unreadable. */}
        <Prose
          paragraphs={lead.paragraphs}
          size="lede"
          gap="lede"
          className="mt-sec-md md:columns-2 md:gap-x-gap-menu [&>p+p]:md:mt-0"
        />
      </Section>

      <Section rule="double" pad="md">
        <DishGrid
          title={kitchen.title}
          moreLink={kitchen.moreLink}
          dishes={kitchen.dishes}
        />
      </Section>

      <Section rule="solid" pad="md">
        <SplitFeature
          kicker={family.kicker}
          title={family.title}
          paragraphs={family.paragraphs}
          proseTop="18"
          figure={{
            imageId: family.figure.imageId as ImageId,
            caption: family.figure.caption,
            ratio: family.figure.ratio,
          }}
          action={
            <ButtonLink href={family.action.href} variant="outline" size="sm">
              {family.action.label}
            </ButtonLink>
          }
        />
      </Section>

      <Section rule="double" pad="md">
        <div className="grid auto-grid-280 gap-x-gap-notice gap-y-8">
          <NoticeCard
            kicker={cateringNotice.kicker}
            title={cateringNotice.title}
            body={cateringNotice.body}
            footer={
              <ButtonLink href={cateringNotice.action.href} variant="accent" size="sm">
                {cateringNotice.action.label}
              </ButtonLink>
            }
          />
          <VisitingCard
            site={site}
            kicker={visiting.kicker}
            hoursLabel={visiting.hoursLabel}
            contactLabel={visiting.contactLabel}
          />
        </div>
      </Section>
    </>
  );
}
