import Image, { type StaticImageData } from "next/image";

import { cn } from "@/lib/cn";

import { RATIO_CLASS_MAP, type FrameRatio } from "./ratios";

/**
 * How much of the viewport the frame occupies, so the browser can pick a
 * sensible candidate from the srcset. Derived from the artboards' grids
 * against the 1240px container (1144px of content once the gutter is removed).
 */
const SIZES: Record<"half" | "third", string> = {
  half: "(min-width: 1288px) 560px, (min-width: 700px) 50vw, 100vw",
  third:
    "(min-width: 1288px) 370px, (min-width: 900px) 33vw, (min-width: 620px) 50vw, 100vw",
};

type ImageFrameProps = {
  image: StaticImageData;
  alt: string;
  ratio: FrameRatio;
  span?: "half" | "third";
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
