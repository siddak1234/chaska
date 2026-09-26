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
 * three lines. Below `sm` the strip is one line — place and Instagram — and
 * the descriptor, which the footer also carries, waits for the wider screen.
 *
 * The Instagram link keeps the strip's 12px type but takes a 44px target: the
 * negative margin gives the height back, so the strip is exactly as tall as
 * the design's.
 */
export function Topbar({ place, descriptor, instagram }: TopbarProps) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-ink pt-[14px] pb-[10px] font-ui text-micro tracking-ui uppercase">
      <span>{place}</span>
      {/* Only the middle item is centred in the artboards; the outer two are
          positioned by `justify-content: space-between`. */}
      <span className="hidden text-center sm:inline">{descriptor}</span>
      <InstagramLink
        handle={instagram}
        display="handle"
        className="-my-[15px] min-h-11"
      />
    </div>
  );
}
