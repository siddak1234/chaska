import { Heading } from "@/components/ui/Heading";
import { SmartLink } from "@/components/ui/SmartLink";
import type { HomeDish } from "@/content";
import type { Link } from "@/content/schema";

import { DishSummary } from "./DishSummary";

type DishGridProps = {
  title: string;
  moreLink: Link;
  dishes: readonly HomeDish[];
};

/** "From the Kitchen" — three dishes under a section heading. */
export function DishGrid({ title, moreLink, dishes }: DishGridProps) {
  return (
    <>
      <div className="mb-6 flex items-baseline justify-between gap-4">
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

      <div className="grid auto-grid-260-min gap-x-gap-dish gap-y-6 sm:gap-y-8">
        {dishes.map((dish) => (
          <DishSummary
            key={dish.id}
            name={dish.name}
            description={dish.description}
            image={dish.image}
            alt={dish.alt}
            span="dish"
            headingLevel={3}
          />
        ))}
      </div>
    </>
  );
}
