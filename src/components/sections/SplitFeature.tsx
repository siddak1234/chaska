import { Figure } from "@/components/media/Figure";
import { Heading } from "@/components/ui/Heading";
import { Kicker } from "@/components/ui/Kicker";
import { Prose } from "@/components/ui/Prose";
import { cn } from "@/lib/cn";

import type { ReactNode } from "react";
import type { FrameRatio } from "@/components/media/ratios";
import type { ImageId } from "@/content/generated/images";

type SplitFeatureProps = {
  kicker?: string;
  title: string;
  paragraphs: readonly string[];
  figure: {
    imageId: ImageId | null;
    caption: string;
    ratio: FrameRatio;
    emptyLabel?: string;
  };
  /** Puts the photograph first, as on the About page's owner block. */
  figureFirst?: boolean;
  /** A call to action beneath the prose. */
  action?: ReactNode;
  headingSize?: "feature" | "section";
  /**
   * Gap between the heading and the first paragraph. The artboards use 18px on
   * the home page and 20px on About — close enough to look like a mistake,
   * different enough to be worth carrying.
   */
  proseTop?: "18" | "20";
};

/**
 * Prose beside a photograph — the two-up block used three times across the
 * Home and About artboards. `repeat(auto-fit, minmax(min(320px, 100%), 1fr))`
 * collapses to one column on a phone without a media query.
 */
export function SplitFeature({
  kicker,
  title,
  paragraphs,
  figure,
  figureFirst = false,
  action,
  headingSize = "feature",
  proseTop = "20",
}: SplitFeatureProps) {
  const media = (
    <Figure
      imageId={figure.imageId}
      caption={figure.caption}
      ratio={figure.ratio}
      emptyLabel={figure.emptyLabel}
      span="half"
    />
  );

  const copy = (
    <article>
      {kicker ? <Kicker className="mb-3.5">{kicker}</Kicker> : null}
      <Heading level={2} size={headingSize}>
        {title}
      </Heading>
      <Prose
        paragraphs={paragraphs}
        size="body"
        className={proseTop === "18" ? "mt-[18px]" : "mt-5"}
      />
      {action ? <div className="mt-6">{action}</div> : null}
    </article>
  );

  return (
    <div className={cn("grid auto-grid-320-min items-start gap-x-gap-split gap-y-8")}>
      {figureFirst ? media : copy}
      {figureFirst ? copy : media}
    </div>
  );
}
