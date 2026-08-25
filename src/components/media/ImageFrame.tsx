import Image, { type StaticImageData } from "next/image";

import { cn } from "@/lib/cn";

import { RATIO_CLASS_MAP, type FrameRatio } from "./ratios";

/**
 * How much of the viewport the frame occupies, so the browser picks a large
 * enough candidate from the srcset.
 *
 * Derived from the real grid, not estimated. The content column is 1240px wide
 * (the container is content-box, so the gutter sits outside it) and the page is
 * at its full width from 1336px up:
 *
 *   half  — two `auto-grid-320-min` columns with a 56px gap: (1240 - 56) / 2 = 592
 *   third — the widest three-up is the menu photo strip, 20px gaps:
 *           (1240 - 40) / 3 = 400. The dish cards are narrower (387, and 357
 *           where the divider padding applies), so 400 covers every case.
 *
 * These were 560/370 while the container was still border-box, which left
 * eight of the ten images upscaled by 17–33px once it was corrected.
 */
const SIZES: Record<"full" | "half" | "portrait" | "third", string> = {
  /** The lead photograph spans the whole 1240px content column. */
  full: "(min-width: 1336px) 1240px, 100vw",
  /**
   * `auto-grid-320-min` needs about 726px before it splits into two columns.
   * Claiming 50vw from 700px described a column that did not exist yet: at
   * 720px the frame is still full width and was served less than half of it.
   */
  half: "(min-width: 740px) 50vw, 100vw",
  /** The About portraits, in the 38fr column: (1240 - 56) * 0.38 = 450. */
  portrait: "(min-width: 1336px) 460px, (min-width: 1024px) 38vw, 100vw",
  /**
   * `auto-grid-260` only reaches three columns from about 920px — below that it
   * is two, and each card is wider, not narrower. A 900px breakpoint here
   * described three columns that were not there yet and under-served the
   * images by ~94px.
   */
  third:
    "(min-width: 1336px) 400px, (min-width: 920px) 30vw, (min-width: 620px) 50vw, 100vw",
};

type ImageFrameProps = {
  image: StaticImageData;
  alt: string;
  ratio: FrameRatio;
  span?: "full" | "half" | "portrait" | "third";
  /** Set on the home hero only — it is the largest contentful paint. */
  priority?: boolean;
  className?: string;
};

/**
 * A fixed-ratio photographic frame.
 *
 * Mirrors the artboards' `position: relative` wrapper around an absolutely
 * filled `<image-slot>`. The `newsprint` utility carries the design's
 * `sepia(0.14) contrast(1.02)` tone — applied in CSS so the vendored Commons
 * originals stay unmodified.
 */
export function ImageFrame({
  image,
  alt,
  ratio,
  span = "half",
  priority = false,
  className,
}: ImageFrameProps) {
  return (
    <div
      className={cn(
        "relative w-full overflow-hidden",
        RATIO_CLASS_MAP[ratio],
        className,
      )}
    >
      <Image
        src={image}
        alt={alt}
        fill
        sizes={SIZES[span]}
        priority={priority}
        placeholder="blur"
        className="object-cover newsprint"
      />
    </div>
  );
}
