import { Figure } from "@/components/media/Figure";
import { DishGrid } from "@/components/sections/DishGrid";
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
    "Chaska is a Punjabi family kitchen in Frisco, Texas. Order today's menu for pickup, or have us cater your gathering.",
  path: "/",
});

export default function HomePage() {
  const { lead, kitchen, family } = getHomePage();
  const [primaryAction, secondaryAction] = lead.actions;

  return (
    <>
      {/*
        What Chaska is and the two things a visitor came to do, on the first
        screen of a phone. The photograph follows the buttons there; on a
        desktop it sits beside them.
      */}
      <Section
        pad="lead"
        className="grid items-center gap-x-gap-split gap-y-7 min-[740px]:grid-cols-2"
      >
        <div>
          <Heading level={1} size="lead">
            {lead.title}
          </Heading>
          <Prose paragraphs={[lead.intro]} size="lede" className="mt-4" />
          <div className="mt-6 flex flex-wrap gap-3">
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
        </div>

        <Figure
          imageId={lead.figure.imageId}
          caption={lead.figure.caption}
          ratio={lead.figure.ratio}
          span="half"
          priority
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
        <div className="max-w-measure">
          {family.kicker ? <Kicker className="mb-3">{family.kicker}</Kicker> : null}
          <Heading level={2} size="feature">
            {family.title}
          </Heading>
          <Prose paragraphs={family.paragraphs} size="body" className="mt-4" />
          <ButtonLink
            href={family.action.href}
            variant="outline"
            size="sm"
            className="mt-5"
          >
            {family.action.label}
          </ButtonLink>
        </div>
      </Section>
    </>
  );
}
