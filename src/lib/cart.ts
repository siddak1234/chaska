import type { DishPricing } from "@/content/schema";
import { formatMoney } from "@/lib/format";

/**
 * The Order page's cart, as pure functions over plain data so every rule is
 * unit-testable without a browser. The React state in `CartProvider` only
 * calls these.
 */

export type Size = "small" | "large" | "each";

export type CartLine = { dishId: string; size: Size; qty: number };

/** What the cart needs to know about a dish: its name and how it is sold. */
export type CartDish = { id: string; name: string; pricing: DishPricing };

export type PricedLine = CartLine & {
  name: string;
  /** "Small · 16 oz", "Per dabeli" */
  sizeLabel: string;
  unitPrice: number;
  total: number;
};

export const CART_STORAGE_KEY = "chaska-order-cart-v1";

export function unitPrice(pricing: DishPricing, size: Size): number {
  if (pricing.kind === "each") return pricing.each;
  return size === "large" ? pricing.large : pricing.small;
}

export function sizeLabel(pricing: DishPricing, size: Size): string {
  if (pricing.kind === "each") return pricing.unit;
  return size === "large" ? "Large · 32 oz" : "Small · 16 oz";
}

/** The size a dish is added at: `each` for pieces, the chosen size otherwise. */
export function sizeFor(pricing: DishPricing, chosen: "small" | "large"): Size {
  return pricing.kind === "each" ? "each" : chosen;
}

/** Adding the same dish at the same size merges into one line. */
export function addLine(cart: CartLine[], line: CartLine): CartLine[] {
  const index = cart.findIndex((l) => l.dishId === line.dishId && l.size === line.size);
  if (index < 0) return [...cart, line];
  return cart.map((l, i) => (i === index ? { ...l, qty: l.qty + line.qty } : l));
}

/** A line that reaches zero is removed rather than kept at 0. */
export function changeQty(cart: CartLine[], index: number, delta: number): CartLine[] {
  return cart
    .map((l, i) => (i === index ? { ...l, qty: l.qty + delta } : l))
    .filter((l) => l.qty > 0);
}

export function removeLine(cart: CartLine[], index: number): CartLine[] {
  return cart.filter((_, i) => i !== index);
}

export function itemCount(cart: CartLine[]): number {
  return cart.reduce((sum, l) => sum + l.qty, 0);
}

/**
 * Lines with their prices. A stored line naming a dish that has since left the
 * catalogue is dropped, so a stale cart cannot bill for something unlisted.
 */
export function priceLines(
  cart: CartLine[],
  dishes: readonly CartDish[],
): PricedLine[] {
  return cart.flatMap((line) => {
    const dish = dishes.find((d) => d.id === line.dishId);
    if (!dish) return [];
    const unit = unitPrice(dish.pricing, line.size);
    return [
      {
        ...line,
        name: dish.name,
        sizeLabel: sizeLabel(dish.pricing, line.size),
        unitPrice: unit,
        total: unit * line.qty,
      },
    ];
  });
}

export function subtotal(lines: readonly PricedLine[]): number {
  return lines.reduce((sum, l) => sum + l.total, 0);
}

/** Only well-formed lines survive a round trip through `localStorage`. */
export function parseStoredCart(raw: string | null): CartLine[] {
  if (!raw) return [];
  try {
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value)) return [];
    return value.filter(
      (l): l is CartLine =>
        typeof l === "object" &&
        l !== null &&
        typeof l.dishId === "string" &&
        (l.size === "small" || l.size === "large" || l.size === "each") &&
        Number.isInteger(l.qty) &&
        l.qty > 0,
    );
  } catch {
    return [];
  }
}

/* ── Checkout ──────────────────────────────────────────────────────────── */

export type PickupForm = {
  name: string;
  phone: string;
  date: string;
  time: string;
  notes: string;
};

/** The design's messages, checked in the design's order. `null` when valid. */
export function validatePickup(form: PickupForm, lineCount: number): string | null {
  if (lineCount === 0) return "Your order is empty. Add a dish before checking out.";
  if (!form.name.trim()) return "Please enter your name.";
  if (!/\d{10}/.test(form.phone.replace(/\D/g, ""))) {
    return "Please enter a 10 digit mobile number so we can confirm by text.";
  }
  if (!form.date) return "Please choose a pickup date.";
  if (!form.time) return "Please choose a preferred pickup time.";
  return null;
}

/** "Friday, September 26 at 5:30 PM", from the form's local date and time. */
export function formatPickup(date: string, time: string): string {
  const when = new Date(`${date}T${time}`);
  return when.toLocaleString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** Today in the visitor's own timezone, as an `<input type="date">` value. */
export function localDateValue(now: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/**
 * The order as plain text — the body of the text message or email that
 * actually delivers it. Everything the kitchen needs, nothing it does not.
 */
export function orderMessage(form: PickupForm, lines: readonly PricedLine[]): string {
  const notes = form.notes.trim();
  return [
    "Chaska pickup order",
    "",
    `Name: ${form.name.trim()}`,
    `Mobile: ${form.phone.trim()}`,
    `Pickup: ${formatPickup(form.date, form.time)}`,
    "",
    ...lines.map(
      (l) => `${l.qty} × ${l.name} (${l.sizeLabel}) — ${formatMoney(l.total)}`,
    ),
    "",
    `Subtotal: ${formatMoney(subtotal(lines))} before sales tax`,
    ...(notes ? ["", `Notes: ${notes}`] : []),
  ].join("\n");
}
