import { InstagramLink } from "./InstagramLink";

type TopbarProps = {
  /** "Frisco, Texas" */
  place: string;
  /** "A Punjabi family kitchen" */
  descriptor: string;
  instagram: string;
};

/**
 * The three-up strip above the masthead: place, descriptor, Instagram.
 *
 * The artboards set `justify-content: space-between` at every width, which on
 * a phone squeezes three letterspaced phrases into thirds and wraps each to
 * three lines. Below `sm` they stack as centred lines instead — nothing is
 * hidden, and it reads as a newspaper standfirst.
 *
 * The Instagram link keeps the strip's 11px type but takes a 44px target: the
 * negative margin gives the height back, so the strip is exactly as tall as
 * the design's.
 */
export function Topbar({ place, descriptor, instagram }: TopbarProps) {
  return (
    <div className="flex flex-col items-center gap-1 border-b border-ink pt-[14px] pb-[10px] text-center font-ui text-micro tracking-ui uppercase sm:flex-row sm:justify-between sm:gap-4 sm:text-start">
      <span>{place}</span>
      {/* Only the middle item is centred in the artboards; the outer two are
          positioned by `justify-content: space-between`. */}
      <span className="sm:text-center">{descriptor}</span>
      <InstagramLink
        handle={instagram}
        display="handle"
        className="-my-[15px] min-h-11"
      />
    </div>
  );
}
