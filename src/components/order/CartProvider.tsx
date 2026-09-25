"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import { addLine, changeQty, itemCount, removeLine, type CartLine } from "@/lib/cart";

import {
  getCartSnapshot,
  getServerCartSnapshot,
  subscribeToCart,
  updateCart,
} from "./cartStore";

type CartContextValue = {
  cart: CartLine[];
  count: number;
  add: (line: CartLine) => void;
  change: (index: number, delta: number) => void;
  remove: (index: number) => void;
  clear: () => void;
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const actions = {
  add: (line: CartLine) => updateCart((c) => addLine(c, line)),
  change: (index: number, delta: number) =>
    updateCart((c) => changeQty(c, index, delta)),
  remove: (index: number) => updateCart((c) => removeLine(c, index)),
  clear: () => updateCart(() => []),
};

/**
 * The Order page's cart, shared by the masthead's cart button and the page.
 * Lives in the `(order)` layout so both sit inside it. The lines themselves
 * are kept in `localStorage` under the design's key — see `cartStore`.
 */
export function CartProvider({ children }: { children: ReactNode }) {
  const cart = useSyncExternalStore(
    subscribeToCart,
    getCartSnapshot,
    getServerCartSnapshot,
  );
  const [drawerOpen, setDrawerOpen] = useState(false);

  const value = useMemo(
    () => ({ cart, count: itemCount(cart), ...actions, drawerOpen, setDrawerOpen }),
    [cart, drawerOpen],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCart must be used inside <CartProvider>");
  return value;
}
