import { Figure } from "@/components/media/Figure";
import type { StripFigure } from "@/content/schema";

type PhotoStripProps = {
  figures: readonly StripFigure[];
};

/**
 * A three-across band of captioned photographs, as on the Menu page.
 *
 * Three across at every width: on a phone these nine photographs of dishes
 * already listed above them were each a full screen wide. The captions, which
 * name those dishes, are left to screen readers there.
 */
export function PhotoStrip({ figures }: PhotoStripProps) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-5">
      {figures.map((figure) => (
        <Figure
          key={figure.imageId}
          imageId={figure.imageId}
          caption={figure.caption}
          ratio="4/3"
          span="third"
          captionClassName="max-sm:sr-only"
        />
      ))}
    </div>
  );
}
