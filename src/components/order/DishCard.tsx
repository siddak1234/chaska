"use client";

import { useState } from "react";

import { ImageFrame } from "@/components/media/ImageFrame";
import { Button } from "@/components/ui/Button";
import { Heading } from "@/components/ui/Heading";
import { sizeFor } from "@/lib/cart";
import { formatMoney } from "@/lib/format";

import { useCart } from "./CartProvider";
import { QuantityStepper } from "./QuantityStepper";
import type { OrderDish } from "./types";

type DishCardProps = { dish: OrderDish };

/**
 * One orderable dish: photograph, name, line, then either the two container
 * sizes or the per-piece price, a quantity and "Add to order".
 *
 * The sizes are real radio inputs rather than the design's `role="radio"`
 * buttons, so arrow keys, form semantics and screen readers work without any
 * scripting of our own. They look exactly as designed.
 */
export function DishCard({ dish }: DishCardProps) {
  const { add, setDrawerOpen } = useCart();
  const [size, setSize] = useState<"small" | "large">("small");
  const [qty, setQty] = useState(1);
  const { pricing } = dish;

  function addToOrder() {
    add({ dishId: dish.id, size: sizeFor(pricing, size), qty });
    setQty(1);
    setDrawerOpen(true);
  }

  return (
    <article className="flex flex-col">
      <ImageFrame image={dish.image} alt={dish.alt} ratio="4/3" span="quarter" />
      <Heading level={2} size="item" className="mt-4">
        {dish.name}
      </Heading>
      <p className="mt-2 flex-1 text-note text-ink-muted">{dish.description}</p>

      {pricing.kind === "container" ? (
        <fieldset className="mt-4 grid grid-cols-2 border border-ink font-ui">
          <legend className="sr-only">Container size for {dish.name}</legend>
          {(["small", "large"] as const).map((option) => (
            <label
              key={option}
              className="flex min-h-[52px] cursor-pointer flex-col items-center justify-center px-1.5 py-2 text-center has-checked:bg-ink has-checked:text-paper has-focus-visible:outline-2 has-focus-visible:-outline-offset-4 has-focus-visible:outline-oxblood"
            >
              <input
                type="radio"
                name={`size-${dish.id}`}
                value={option}
                checked={size === option}
                onChange={() => setSize(option)}
                className="sr-only"
              />
              <span className="text-micro font-bold tracking-ui uppercase">
                {option === "small" ? "Small" : "Large"}
              </span>
              <span className="mt-[3px] text-label">
                {option === "small" ? "16 oz" : "32 oz"} ·{" "}
                {formatMoney(option === "small" ? pricing.small : pricing.large)}
              </span>
            </label>
          ))}
        </fieldset>
      ) : (
        <div className="mt-4 flex items-baseline justify-between border-y border-ink py-3 font-ui">
          <span className="text-micro font-bold tracking-ui uppercase">
            {pricing.unit}
          </span>
          <span className="text-price-sm font-semibold">
            {formatMoney(pricing.each)}
          </span>
        </div>
      )}

      <div className="mt-3 flex items-stretch gap-2.5">
        <QuantityStepper
          qty={qty}
          label={dish.name}
          onDecrease={() => setQty((q) => Math.max(1, q - 1))}
          onIncrease={() => setQty((q) => q + 1)}
        />
        <Button variant="ink" className="flex-1" onClick={addToOrder}>
          Add to order
        </Button>
      </div>
    </article>
  );
}
