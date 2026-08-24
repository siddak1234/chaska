import { DottedLeader } from "@/components/ui/DottedLeader";
import { VisuallyHidden } from "@/components/ui/VisuallyHidden";
import type { MenuItem } from "@/content/schema";
import { cn } from "@/lib/cn";
import { formatPrice, formatPriceForSpeech } from "@/lib/format";

type MenuRowProps = {
  item: MenuItem;
  /**
   * `lg` for courses with descriptions, `sm` for the narrow two-up lists,
   * `columns` for the long unpriced courses set as a dense multi-column list.
   */
  size: "lg" | "sm" | "columns";
};

/**
 * One dish: name, optional origin note, optional dotted leader and price,
 * optional description.
 *
 * The leader is drawn only when there is a price for it to lead to — a dotted
 * rule running to nothing reads as a missing value rather than a design.
 *
 * Three fixes over the artboards' `<div>` soup:
 *  • the row is a `<dt>`/`<dd>` group inside a `<dl>` — a menu is a
 *    description list, and this makes it navigable;
 *  • the leader `<span>` is `aria-hidden`, where the source announced an
 *    empty element between the dish and its price;
 *  • the price is printed as a bare numeral exactly as designed, with the
 *    currency spoken from a visually hidden span.
 */
export function MenuRow({ item, size }: MenuRowProps) {
  const nameSize =
    size === "lg" ? "text-row" : size === "sm" ? "text-row-sm" : "text-row-sm";
  const hasPrice = item.price !== undefined;

  const name = (
    <>
      <span>{item.name}</span>
      {item.nonVeg ? (
        <span className="font-ui text-micro leading-normal font-bold tracking-meta text-oxblood uppercase">
          <VisuallyHidden>{" — "}</VisuallyHidden>
          Non-veg
        </span>
      ) : null}
      {item.origin ? (
        <span className="font-ui text-micro leading-normal tracking-meta text-ink-muted uppercase">
          <VisuallyHidden>{" — "}</VisuallyHidden>
          {item.origin}
        </span>
      ) : null}
    </>
  );

  // No price: the row is just a term, so it needs no grid and no leader.
  if (!hasPrice) {
    return (
      <div>
        <dt
          className={cn("flex flex-wrap items-baseline gap-x-2 font-display", nameSize)}
        >
          {name}
        </dt>
        {item.description ? (
          <dd className="mt-1.5 text-note text-ink-muted">{item.description}</dd>
        ) : null}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[1fr_auto] items-baseline gap-x-2.5">
      <dt
        className={cn("flex flex-wrap items-baseline gap-x-2 font-display", nameSize)}
      >
        {name}
        <DottedLeader />
      </dt>
      <dd
        className={cn(
          "font-ui font-semibold",
          size === "lg" ? "text-price" : "text-price-sm",
        )}
      >
        {formatPrice(item.price!)}
        <VisuallyHidden>{` ${formatPriceForSpeech(item.price!)}`}</VisuallyHidden>
      </dd>
      {item.description ? (
        <dd className="col-span-2 mt-1.5 text-note text-ink-muted">
          {item.description}
        </dd>
      ) : null}
    </div>
  );
}
