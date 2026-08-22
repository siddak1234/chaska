import { DottedLeader } from "@/components/ui/DottedLeader";
import { VisuallyHidden } from "@/components/ui/VisuallyHidden";
import type { MenuItem } from "@/content/schema";
import { cn } from "@/lib/cn";
import { formatPrice, formatPriceForSpeech } from "@/lib/format";

type MenuRowProps = {
  item: MenuItem;
  /** `lg` for courses with descriptions, `sm` for the breads and drinks lists. */
  size: "lg" | "sm";
};

/**
 * One dish: name, dotted leader, price, optional description.
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
  const isLarge = size === "lg";

  return (
    <div className="grid grid-cols-[1fr_auto] items-baseline gap-x-2.5">
      <dt
        className={cn(
          "flex items-baseline gap-x-2.5 font-display",
          isLarge ? "text-row" : "text-row-sm",
        )}
      >
        <span>{item.name}</span>
        <DottedLeader />
      </dt>
      <dd
        className={cn(
          "font-ui font-semibold",
          isLarge ? "text-price" : "text-price-sm",
        )}
      >
        {formatPrice(item.price)}
        <VisuallyHidden>{` ${formatPriceForSpeech(item.price)}`}</VisuallyHidden>
      </dd>
      {item.description ? (
        <dd className="col-span-2 mt-1.5 text-note text-ink-muted">
          {item.description}
        </dd>
      ) : null}
    </div>
  );
}
