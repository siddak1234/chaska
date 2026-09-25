import { CART_STORAGE_KEY, parseStoredCart, type CartLine } from "@/lib/cart";

/**
 * The cart as an external store over `localStorage`, read through React's
 * `useSyncExternalStore`. That gives server rendering an empty cart and the
 * browser the stored one without a hydration mismatch, and picks up changes
 * made in another tab through the `storage` event.
 *
 * If storage is unavailable — a private window, blocked site data — writes
 * fall back to memory and the cart simply lasts the visit.
 */

const EMPTY: CartLine[] = [];
const listeners = new Set<() => void>();

let lastRaw: string | null | undefined;
let cached: CartLine[] = EMPTY;
let memoryOnly: CartLine[] | null = null;

function readStorage(): string | null {
  try {
    return window.localStorage.getItem(CART_STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeStorage(cart: CartLine[]): boolean {
  try {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    return true;
  } catch {
    return false;
  }
}

function emit() {
  for (const listener of listeners) listener();
}

export function getCartSnapshot(): CartLine[] {
  if (memoryOnly) return memoryOnly;
  const raw = readStorage();
  // Re-parse only when the stored string changes, so the snapshot keeps its
  // identity between renders as `useSyncExternalStore` requires.
  if (raw !== lastRaw) {
    lastRaw = raw;
    cached = parseStoredCart(raw);
  }
  return cached;
}

export function getServerCartSnapshot(): CartLine[] {
  return EMPTY;
}

export function subscribeToCart(listener: () => void): () => void {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === CART_STORAGE_KEY) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function updateCart(update: (cart: CartLine[]) => CartLine[]) {
  const next = update(getCartSnapshot());
  if (!writeStorage(next)) memoryOnly = next;
  emit();
}
