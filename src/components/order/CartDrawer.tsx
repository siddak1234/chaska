"use client";

import { useEffect, useRef, type MouseEvent } from "react";

import { Button } from "@/components/ui/Button";
import { Heading } from "@/components/ui/Heading";
import { Kicker } from "@/components/ui/Kicker";
import { subtotal, type PricedLine } from "@/lib/cart";
import { formatMoney } from "@/lib/format";

import { CART_DRAWER_ID } from "./CartButton";
import { useCart } from "./CartProvider";
import { SubtotalRow } from "./OrderLines";
import { QuantityStepper } from "./QuantityStepper";

type CartDrawerProps = {
  lines: readonly PricedLine[];
  /** "Pickup only · Frisco, Texas" */
  note: string;
  onCheckout: () => void;
  /** While Shopify's checkout is being prepared. */
  busy?: boolean;
  /** Why checkout could not start, shown above the button. */
  error?: string | null;
};

/**
 * The design's slide-in cart.
 *
 * Built on a native modal `<dialog>`: `showModal()` makes the rest of the page
 * inert, moves focus inside, closes on Escape and hands focus back to the cart
 * button afterwards — everything the design's `role="dialog"` div would have
 * needed scripting to do. Clicking the scrim closes it, as in the design.
 */
export function CartDrawer({
  lines,
  note,
  onCheckout,
  busy = false,
  error = null,
}: CartDrawerProps) {
  const { drawerOpen, setDrawerOpen, change, remove } = useCart();
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (drawerOpen && !element.open) element.showModal();
    if (!drawerOpen && element.open) element.close();
  }, [drawerOpen]);

  function onBackdropClick(event: MouseEvent<HTMLDialogElement>) {
    // The panel fills the dialog box, so only the scrim targets the dialog.
    if (event.target === event.currentTarget) setDrawerOpen(false);
  }

  return (
    <dialog
      ref={dialog}
      id={CART_DRAWER_ID}
      aria-labelledby="cart-drawer-heading"
      onClose={() => setDrawerOpen(false)}
      onClick={onBackdropClick}
      className="fixed inset-y-0 right-0 left-auto m-0 h-full max-h-none w-[min(420px,100%)] max-w-none border-0 border-l border-ink bg-paper p-0 text-ink shadow-[-12px_0_40px_rgb(26_23_18/0.18)] backdrop:bg-scrim"
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between gap-3 border-b border-ink px-6 py-5">
          <div>
            <Heading
              level={2}
              size="dish"
              id="cart-drawer-heading"
              className="leading-[normal]"
            >
              Your order
            </Heading>
            <Kicker size="label" className="mt-1">
              {note}
            </Kicker>
          </div>
          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            aria-label="Close cart"
            className="h-11 w-11 cursor-pointer border border-ink text-[20px] leading-none"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-1">
          {lines.length === 0 ? (
            <p className="mt-5 text-[14.5px] leading-6 text-ink-muted">
              Your order is empty. Choose a size and add a dish.
            </p>
          ) : (
            <ul>
              {lines.map((line, index) => (
                <li
                  key={`${line.dishId}-${line.size}`}
                  className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-1 border-b border-rule py-4"
                >
                  <p className="font-display text-[17px]">{line.name}</p>
                  <p className="text-right font-ui text-price-sm font-semibold">
                    {formatMoney(line.total)}
                  </p>
                  <p className="font-ui text-label text-ink-muted">{line.sizeLabel}</p>
                  <div className="flex items-center justify-end">
                    <QuantityStepper
                      size="sm"
                      qty={line.qty}
                      label={line.name}
                      onDecrease={() => change(index, -1)}
                      onIncrease={() => change(index, 1)}
                    />
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      aria-label={`Remove ${line.name}`}
                      className="ml-2 h-8 cursor-pointer font-ui text-micro tracking-[0.1em] text-oxblood uppercase"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {lines.length > 0 ? (
          <div className="border-t border-ink px-6 pt-4 pb-6">
            <SubtotalRow amount={subtotal(lines)} />
            {error ? (
              <p role="alert" className="mt-3 font-ui text-[13px] text-oxblood">
                {error}
              </p>
            ) : null}
            <Button
              variant="accent"
              className="mt-4 min-h-12 w-full disabled:cursor-wait disabled:opacity-70"
              onClick={onCheckout}
              disabled={busy}
            >
              {busy ? "Opening checkout…" : "Checkout"}
            </Button>
            <Button
              variant="outline"
              className="mt-2.5 w-full"
              onClick={() => setDrawerOpen(false)}
            >
              Keep ordering
            </Button>
          </div>
        ) : null}
      </div>
    </dialog>
  );
}
