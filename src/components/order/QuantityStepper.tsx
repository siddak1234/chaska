import { cn } from "@/lib/cn";

type QuantityStepperProps = {
  qty: number;
  /** Names the dish, so "Increase quantity of Panjiri" is unambiguous. */
  label: string;
  onDecrease: () => void;
  onIncrease: () => void;
  /** `md` beside "Add to order"; `sm` inside the cart drawer. */
  size?: "md" | "sm";
};

/** − qty + , as the design draws it on the cards and in the drawer. */
export function QuantityStepper({
  qty,
  label,
  onDecrease,
  onIncrease,
  size = "md",
}: QuantityStepperProps) {
  const isMd = size === "md";
  const button = cn(
    "cursor-pointer bg-transparent text-inherit",
    isMd ? "h-11 w-10 text-[18px]" : "h-8 w-8 border border-ink",
  );

  return (
    <div
      className={cn(
        "flex items-center font-ui",
        isMd ? "border border-ink" : "gap-0.5",
      )}
    >
      <button
        type="button"
        aria-label={`Decrease quantity of ${label}`}
        onClick={onDecrease}
        className={button}
      >
        −
      </button>
      <span
        aria-live="polite"
        className={cn(
          "text-center font-semibold",
          isMd ? "min-w-7 text-price-sm" : "min-w-[26px] text-[13px]",
        )}
      >
        {qty}
      </span>
      <button
        type="button"
        aria-label={`Increase quantity of ${label}`}
        onClick={onIncrease}
        className={button}
      >
        +
      </button>
    </div>
  );
}
