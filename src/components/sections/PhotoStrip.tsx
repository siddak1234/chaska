import { Figure } from "@/components/media/Figure";
import type { ImageId } from "@/content/generated/images";

type PhotoStripProps = {
  figures: ReadonlyArray<{ imageId: ImageId; caption: string }>;
};

/** The three-across band of captioned photographs on the Menu page. */
export function PhotoStrip({ figures }: PhotoStripProps) {
  return (
    <div className="grid auto-grid-260-min gap-5">
      {figures.map((figure) => (
        <Figure
          key={figure.imageId}
          imageId={figure.imageId}
          caption={figure.caption}
          ratio="4/3"
          span="third"
        />
      ))}
    </div>
  );
}
