import { subtotal, type PricedLine } from "@/lib/cart";
import { cn } from "@/lib/cn";
import { formatMoney } from "@/lib/format";

type OrderLinesProps = {
  lines: readonly PricedLine[];
  /**
   * `stacked` — name and total, then "size × qty" beneath (checkout summary).
   * `inline`  — one row, "name · size × qty" against the total (sent order).
   */
  layout: "stacked" | "inline";
};

/** A read-only list of what is being ordered, closed by the subtotal. */
export function OrderLines({ lines, layout }: OrderLinesProps) {
  return (
    <>
      <ul>
        {lines.map((line) =>
          layout === "stacked" ? (
            <li
              key={`${line.dishId}-${line.size}`}
              className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-0.5 border-b border-rule py-3"
            >
              <p className="font-display text-[16px]">{line.name}</p>
              <p className="text-right font-ui text-price-sm font-semibold">
                {formatMoney(line.total)}
              </p>
              <p className="col-span-2 font-ui text-label text-ink-muted">
                {line.sizeLabel} × {line.qty}
              </p>
            </li>
          ) : (
            <li
              key={`${line.dishId}-${line.size}`}
              className="flex justify-between gap-3 border-b border-rule py-2 text-[14.5px]"
            >
              <span>
                {line.name}{" "}
                <span className="text-ink-muted">
                  · {line.sizeLabel} × {line.qty}
                </span>
              </span>
              <span className="font-ui font-semibold">{formatMoney(line.total)}</span>
            </li>
          ),
        )}
      </ul>
      <SubtotalRow
        amount={subtotal(lines)}
        className={layout === "inline" ? "pt-3.5" : "pt-4"}
      />
    </>
  );
}

/** "Subtotal $23 / Before sales tax." — the summary, the drawer and the sent order. */
export function SubtotalRow({
  amount,
  className,
}: {
  amount: number;
  className?: string;
}) {
  return (
    <div className={cn("font-ui", className)}>
      <div className="flex items-baseline justify-between">
        <span className="text-micro font-bold tracking-ui uppercase">Subtotal</span>
        <span className="text-[18px] font-bold">{formatMoney(amount)}</span>
      </div>
      <p className="mt-1.5 text-label leading-[19px] text-ink-muted">
        Before sales tax.
      </p>
    </div>
  );
}
