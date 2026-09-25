import { Figure } from "@/components/media/Figure";
import { DishGrid } from "@/components/sections/DishGrid";
import { NoticeCard } from "@/components/sections/NoticeCard";
import { SplitFeature } from "@/components/sections/SplitFeature";
import { ButtonLink } from "@/components/ui/Button";
import { Heading } from "@/components/ui/Heading";
import { Kicker } from "@/components/ui/Kicker";
import { Prose } from "@/components/ui/Prose";
import { Section } from "@/components/ui/Section";
import { getHomeDishes, getHomePage } from "@/content";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Home",
  description:
    "Chaska serves desi food with a Punjabi tadka in Frisco, Texas, cooked from family recipes passed down by hand, alongside a few Indo-fusion dishes of its own.",
  path: "/",
});

export default function HomePage() {
  const { lead, kitchen, family, catering } = getHomePage();
  const [primaryAction, secondaryAction] = lead.actions;

  return (
    <>
      {/*
        The lead story. On a desktop it is the design's two-up: headline,
        prose and buttons beside a 5:4 photograph. On a phone the photograph
        is moved up to follow the buttons, so it is not the last thing in a
        long column — the design's order put it below the whole story, where
        an earlier measurement found the lead image entirely below the fold.
        Grid areas reorder it without duplicating any markup.
      */}
      <Section
        pad="lead"
        className="grid items-start gap-x-gap-split [grid-template-areas:'head'_'actions'_'figure'_'prose'] min-[740px]:grid-cols-2 min-[740px]:[grid-template-rows:auto_auto_1fr] min-[740px]:[grid-template-areas:'head_figure'_'prose_figure'_'actions_figure']"
      >
        <div className="[grid-area:head]">
          {lead.kicker ? <Kicker className="mb-3.5">{lead.kicker}</Kicker> : null}
          <Heading level={1} size="lead">
            {lead.title}
          </Heading>
        </div>

        <Prose
          paragraphs={lead.paragraphs}
          size="lede"
          gap="lede"
          className="mt-8 [grid-area:prose] min-[740px]:mt-[22px]"
        />

        <div className="mt-7 flex flex-wrap gap-3.5 [grid-area:actions]">
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

        <Figure
          imageId={lead.figure.imageId}
          caption={lead.figure.caption}
          ratio={lead.figure.ratio}
          span="half"
          priority
          className="mt-8 [grid-area:figure] min-[740px]:mt-0"
        />
      </Section>

      <Section rule="double" pad="md">
        <DishGrid
          title={kitchen.title}
          moreLink={kitchen.moreLink}
          dishes={getHomeDishes()}
        />
      </Section>

      <Section rule="solid" pad="md">
        <SplitFeature
          kicker={family.kicker}
          title={family.title}
          paragraphs={family.paragraphs}
          proseTop="18"
          figure={family.figure}
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
            kicker={catering.kicker}
            title={catering.title}
            body={catering.body}
            footer={
              <ButtonLink href={catering.action.href} variant="accent" size="sm">
                {catering.action.label}
              </ButtonLink>
            }
          />
          <Figure
            imageId={catering.figure.imageId}
            caption={catering.figure.caption}
            ratio={catering.figure.ratio}
            span="half"
          />
        </div>
      </Section>
    </>
  );
}
