import { ImageFrame } from "@/components/media/ImageFrame";
import { Heading } from "@/components/ui/Heading";
import type { FrameImage } from "@/content/images";
import { cn } from "@/lib/cn";

type DishSummaryProps = {
  name: string;
  description: string;
  image: FrameImage | null;
  alt: string;
  /** Frame sizing for the stacked layout — see `ImageFrame`. */
  span: "dish" | "quarter";
  headingLevel: 2 | 3;
  className?: string;
};

/**
 * A dish's photograph, name and line.
 *
 * On a phone the photograph is a 104px square beside the name, so a list of
 * dishes reads as a list rather than a column of full-width pictures; from
 * `sm` up it stacks, photograph above. The home page's dishes and the Order
 * page's cards share it, so the two always look alike.
 */
export function DishSummary({
  name,
  description,
  image,
  alt,
  span,
  headingLevel,
  className,
}: DishSummaryProps) {
  return (
    <div
      className={cn(
        "grid gap-x-4 sm:flex sm:flex-col",
        image ? "grid-cols-[104px_minmax(0,1fr)]" : "grid-cols-1",
        className,
      )}
    >
      {image ? (
        <ImageFrame
          image={image}
          alt={alt}
          ratio="4/3"
          span={span}
          className="self-start max-sm:aspect-square"
        />
      ) : null}
      <div className="sm:mt-4">
        <Heading level={headingLevel} size="item">
          {name}
        </Heading>
        <p className="mt-1.5 line-clamp-4 text-note text-ink-muted sm:line-clamp-none">
          {description}
        </p>
      </div>
    </div>
  );
}
