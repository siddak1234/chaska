import type { SlotImage } from "@/content/images";
import type { CartDish } from "@/lib/cart";

/** A dish as the Order page's client components receive it from the server. */
export type OrderDish = CartDish & SlotImage & { description: string };

export type OrderContact = {
  phoneE164: string;
  phoneDisplay: string;
  email: string;
};
