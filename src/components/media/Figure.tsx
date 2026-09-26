import { getImage, type ImageId } from "@/content/images";
import { cn } from "@/lib/cn";

import { EmptyFrame } from "./EmptyFrame";
import { ImageFrame, type FrameSpan } from "./ImageFrame";
import type { FrameRatio } from "./ratios";

type FigureProps = {
  /** `null` renders the empty state — see `EmptyFrame`. */
  imageId: ImageId | null;
  caption: string;
  ratio: FrameRatio;
  span?: FrameSpan;
  priority?: boolean;
  /** Shown instead of a photograph when `imageId` is null. */
  emptyLabel?: string;
  className?: string;
  captionClassName?: string;
};

/**
 * A photograph with the design's ruled caption: Libre Franklin 12/20 in muted
 * ink, closed by a hairline rule. Every captioned photograph in the artboards
 * is this block, identical apart from the image and the words.
 */
export function Figure({
  imageId,
  caption,
  ratio,
  span,
  priority,
  emptyLabel,
  className,
  captionClassName,
}: FigureProps) {
  const slot = imageId ? getImage(imageId) : null;

  return (
    <figure className={cn("m-0", className)}>
      {slot ? (
        <ImageFrame
          image={slot.image}
          alt={slot.alt}
          ratio={ratio}
          span={span}
          priority={priority}
        />
      ) : (
        <EmptyFrame label={emptyLabel ?? caption} ratio={ratio} />
      )}
      <figcaption
        className={cn(
          "border-b border-rule px-[2px] pt-[10px] pb-3 font-ui text-label leading-5 text-ink-muted",
          captionClassName,
        )}
      >
        {caption}
      </figcaption>
    </figure>
  );
}
