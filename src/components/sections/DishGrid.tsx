import { ImageFrame } from "@/components/media/ImageFrame";
import { Heading } from "@/components/ui/Heading";
import { SmartLink } from "@/components/ui/SmartLink";
import type { HomeDish } from "@/content";
import type { Link } from "@/content/schema";

type DishGridProps = {
  title: string;
  moreLink: Link;
  dishes: readonly HomeDish[];
};

/**
 * "From the Kitchen" — three dishes under a section heading. The current
 * design drops the rules the first artboards drew between the cards.
 */
export function DishGrid({ title, moreLink, dishes }: DishGridProps) {
  return (
    <>
      <div className="mb-7 flex items-baseline justify-between gap-4">
        <Heading level={2} size="section">
          {title}
        </Heading>
        <SmartLink
          href={moreLink.href}
          className="-my-3 py-3 font-ui text-label leading-5 font-semibold tracking-ui whitespace-nowrap uppercase no-underline"
        >
          {moreLink.label}
        </SmartLink>
      </div>

      <div className="grid auto-grid-260 gap-x-gap-dish gap-y-8">
        {dishes.map((dish) => (
          <article key={dish.id}>
            <ImageFrame image={dish.image} alt={dish.alt} ratio="4/3" span="third" />
            <Heading level={3} size="dish" className="mt-4">
              {dish.name}
            </Heading>
            <p className="mt-2.5 text-card text-ink-secondary">{dish.description}</p>
          </article>
        ))}
      </div>
    </>
  );
}
