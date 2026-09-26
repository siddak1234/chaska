"use client";

import { useEffect, useState } from "react";

import { DishSummary } from "@/components/sections/DishSummary";
import { Button } from "@/components/ui/Button";
import { sizeFor } from "@/lib/cart";
import type { OrderDish } from "@/lib/daily-menu";
import { formatMoney } from "@/lib/format";

import { useCart } from "./CartProvider";

type DishCardProps = { dish: OrderDish };

/** How long "Added" shows on the button before it reads "Add" again. */
const ADDED_MS = 1600;

/**
 * One orderable dish: photograph, name, line, the sizes or per-piece price,
 * and "Add".
 *
 * On a phone the photograph sits beside the name, so several dishes fit on a
 * screen; from `sm` up the card stacks, four across at full width. Adding does
 * not open the cart — a visitor is usually choosing more than one dish — the
 * button confirms instead, and the cart count in the order bar goes up.
 * Quantities are changed in the cart.
 *
 * The sizes are real radio inputs, so arrow keys, form semantics and screen
 * readers work without scripting of our own.
 */
export function DishCard({ dish }: DishCardProps) {
  const { add } = useCart();
  const [size, setSize] = useState<"small" | "large">("small");
  const [added, setAdded] = useState(false);
  const { pricing } = dish;

  useEffect(() => {
    if (!added) return;
    const timer = window.setTimeout(() => setAdded(false), ADDED_MS);
    return () => window.clearTimeout(timer);
  }, [added]);

  function addToOrder() {
    add({ dishId: dish.id, size: sizeFor(pricing, size), qty: 1 });
    setAdded(true);
  }

  return (
    <article className="flex flex-col">
      <DishSummary
        name={dish.name}
        description={dish.description}
        image={dish.image}
        alt={dish.alt}
        span="quarter"
        headingLevel={3}
        className="sm:flex-1"
      />

      <div className="mt-3 flex items-stretch gap-2.5 sm:mt-4">
        {pricing.kind === "container" ? (
          <fieldset className="grid flex-1 grid-cols-2 border border-ink font-ui">
            <legend className="sr-only">Size of {dish.name}</legend>
            {(["small", "large"] as const).map((option) => (
              <label
                key={option}
                className="flex min-h-12 cursor-pointer flex-col items-center justify-center px-1 py-1.5 text-center has-checked:bg-ink has-checked:text-paper has-focus-visible:outline-2 has-focus-visible:-outline-offset-4 has-focus-visible:outline-oxblood"
              >
                <input
                  type="radio"
                  name={`size-${dish.id}`}
                  value={option}
                  checked={size === option}
                  onChange={() => setSize(option)}
                  className="sr-only"
                />
                <span className="text-label font-bold tracking-ui uppercase">
                  {option === "small" ? "Small" : "Large"}{" "}
                  {formatMoney(option === "small" ? pricing.small : pricing.large)}
                </span>
                <span className="text-micro">
                  {option === "small" ? "16 oz" : "32 oz"}
                </span>
              </label>
            ))}
          </fieldset>
        ) : (
          <div className="flex min-h-12 flex-1 items-center justify-between border border-ink px-3 font-ui">
            <span className="text-label font-bold tracking-ui uppercase">
              {pricing.unit}
            </span>
            <span className="text-price-sm font-semibold">
              {formatMoney(pricing.each)}
            </span>
          </div>
        )}

        <Button
          variant="ink"
          className="w-[84px] shrink-0 px-2 text-center"
          onClick={addToOrder}
        >
          {added ? "Added" : "Add"}
          <span className="sr-only">{` ${dish.name} to order`}</span>
        </Button>
      </div>
      <p role="status" className="sr-only">
        {added ? `${dish.name} added to your order.` : ""}
      </p>
    </article>
  );
}
