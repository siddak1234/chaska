"use client";

import { BagIcon } from "@/components/ui/icons";

import { useCart } from "./CartProvider";

export const CART_DRAWER_ID = "cart-drawer";

/** The masthead's cart button on the Order page, with the item count. */
export function CartButton() {
  const { count, drawerOpen, setDrawerOpen } = useCart();

  return (
    <button
      type="button"
      onClick={() => setDrawerOpen(true)}
      aria-expanded={drawerOpen}
      aria-controls={CART_DRAWER_ID}
      className="inline-flex min-h-11 cursor-pointer items-center gap-2 px-3 font-ui text-label font-bold tracking-ui uppercase transition-colors duration-150 hover:text-oxblood"
    >
      <BagIcon />
      <span>Cart</span>
      <span className="inline-flex h-[22px] min-w-[22px] items-center justify-center bg-oxblood px-1.5 text-micro text-paper">
        {count}
        <span className="sr-only"> {count === 1 ? "item" : "items"}</span>
      </span>
    </button>
  );
}
