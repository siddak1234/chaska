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
    "Chaska serves Punjabi home cooking in Dallas, from family recipes kept across three generations. Dal simmered overnight, saag stirred through the afternoon, rotis off the tawa.",
  path: "/",
});

export default function HomePage() {
  const site = getSite();
  const { lead, kitchen, family, cateringNotice, visiting } = getHomePage();
  const [primaryAction, secondaryAction] = lead.actions;

  return (
    <>
      <Section pad="lead">
        <div className="grid auto-grid-320-min items-start gap-x-gap-split gap-y-8">
          <div>
            {lead.kicker ? <Kicker className="mb-3.5">{lead.kicker}</Kicker> : null}
            <Heading level={1} size="lead">
              {lead.title}
            </Heading>
            <Prose
              paragraphs={lead.paragraphs}
              size="lede"
              gap="lede"
              className="mt-[22px]"
            />
            <div className="mt-7 flex flex-wrap gap-3.5">
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
            </div>
          </div>
          <Figure
            imageId={lead.figure.imageId as ImageId}
            caption={lead.figure.caption}
            ratio={lead.figure.ratio}
            span="half"
            priority
          />
        </div>
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
