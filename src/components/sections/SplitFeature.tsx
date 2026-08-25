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
  /**
   * `even` — equal columns, as the artboards have it.
   * `portrait` — a narrower media column. A 4:5 portrait in an equal column
   *   measured 592x740 against 323px of text beside it: two and a half times
   *   its height. 42/58 brings the picture down and gives the prose a better
   *   measure, without shrinking the type to do it.
   */
  columns?: "even" | "portrait";
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
  columns = "even",
}: SplitFeatureProps) {
  const media = (
    <Figure
      imageId={figure.imageId}
      caption={figure.caption}
      ratio={figure.ratio}
      emptyLabel={figure.emptyLabel}
      span={columns === "portrait" ? "portrait" : "half"}
      className={
        columns === "portrait"
          ? // Once the columns stack, a 4:5 portrait at full column width is
            // 707x884 on a tablet — larger than it ever is on a desktop. Cap
            // and centre it. It also keeps the frame inside the narrowest
            // source asset, which is 665px wide.
            "mx-auto w-full max-w-[460px] lg:max-w-none"
          : undefined
      }
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
        className={cn("max-w-measure", proseTop === "18" ? "mt-[18px]" : "mt-5")}
      />
      {action ? <div className="mt-6">{action}</div> : null}
    </article>
  );

  return (
    <div
      className={cn(
        "grid items-start gap-x-gap-split gap-y-8",
        // The narrow column has to follow the picture, not the DOM order. When
        // the copy comes first the ratio flips, or the reversed block hands the
        // wide column to the image and squeezes the text into the narrow one.
        columns === "portrait"
          ? figureFirst
            ? "grid-cols-1 lg:grid-cols-[minmax(0,38fr)_minmax(0,62fr)]"
            : "grid-cols-1 lg:grid-cols-[minmax(0,62fr)_minmax(0,38fr)]"
          : "auto-grid-320-min",
      )}
    >
      {figureFirst ? media : copy}
      {figureFirst ? copy : media}
    </div>
  );
}
