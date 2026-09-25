import { describe, expect, it } from "vitest";

import {
  addLine,
  changeQty,
  itemCount,
  localDateValue,
  orderMessage,
  parseStoredCart,
  priceLines,
  removeLine,
  sizeFor,
  subtotal,
  validatePickup,
  type CartDish,
  type PickupForm,
} from "@/lib/cart";
import { formatMoney, mailtoHref, smsHref } from "@/lib/format";

const DISHES: CartDish[] = [
  {
    id: "dahi-bhalla",
    name: "Dahi Bhalla",
    pricing: { kind: "container", small: 9, large: 16 },
  },
  {
    id: "kutchi-dabeli",
    name: "Kutchi Dabeli",
    pricing: { kind: "each", unit: "Per dabeli", each: 5 },
  },
];

const FORM: PickupForm = {
  name: "  Asha  ",
  phone: "(469) 555 0123",
  date: "2026-09-26",
  time: "17:30",
  notes: "Mild, please",
};

describe("cart lines", () => {
  it("merges the same dish at the same size into one line", () => {
    const cart = addLine(
      addLine([], { dishId: "dahi-bhalla", size: "small", qty: 1 }),
      {
        dishId: "dahi-bhalla",
        size: "small",
        qty: 2,
      },
    );
    expect(cart).toEqual([{ dishId: "dahi-bhalla", size: "small", qty: 3 }]);
  });

  it("keeps a different size of the same dish on its own line", () => {
    const cart = addLine([{ dishId: "dahi-bhalla", size: "small", qty: 1 }], {
      dishId: "dahi-bhalla",
      size: "large",
      qty: 1,
    });
    expect(cart).toHaveLength(2);
  });

  it("removes a line whose quantity reaches zero", () => {
    expect(
      changeQty([{ dishId: "dahi-bhalla", size: "small", qty: 1 }], 0, -1),
    ).toEqual([]);
  });

  it("removes a line outright", () => {
    const cart = [
      { dishId: "dahi-bhalla", size: "small" as const, qty: 1 },
      { dishId: "kutchi-dabeli", size: "each" as const, qty: 4 },
    ];
    expect(removeLine(cart, 0)).toEqual([cart[1]]);
    expect(itemCount(cart)).toBe(5);
  });

  it("sells pieces as `each`, whatever size is selected", () => {
    expect(sizeFor(DISHES[1]!.pricing, "large")).toBe("each");
    expect(sizeFor(DISHES[0]!.pricing, "large")).toBe("large");
  });
});

describe("pricing", () => {
  it("prices each size, labels it as the design does, and totals", () => {
    const lines = priceLines(
      [
        { dishId: "dahi-bhalla", size: "large", qty: 2 },
        { dishId: "kutchi-dabeli", size: "each", qty: 3 },
      ],
      DISHES,
    );
    expect(lines.map((l) => [l.sizeLabel, l.total])).toEqual([
      ["Large · 32 oz", 32],
      ["Per dabeli", 15],
    ]);
    expect(subtotal(lines)).toBe(47);
    expect(formatMoney(47)).toBe("$47");
  });

  it("drops a stored line whose dish has left the catalogue", () => {
    expect(priceLines([{ dishId: "gone", size: "small", qty: 1 }], DISHES)).toEqual([]);
  });
});

describe("stored cart", () => {
  it("keeps only well-formed lines", () => {
    const raw = JSON.stringify([
      { dishId: "dahi-bhalla", size: "small", qty: 2 },
      { dishId: "dahi-bhalla", size: "huge", qty: 1 },
      { dishId: "dahi-bhalla", size: "small", qty: 0 },
      { size: "small", qty: 1 },
    ]);
    expect(parseStoredCart(raw)).toEqual([
      { dishId: "dahi-bhalla", size: "small", qty: 2 },
    ]);
  });

  it("survives junk", () => {
    expect(parseStoredCart("{not json")).toEqual([]);
    expect(parseStoredCart('{"a":1}')).toEqual([]);
    expect(parseStoredCart(null)).toEqual([]);
  });
});

describe("checkout", () => {
  it("checks the fields in the design's order, with its messages", () => {
    expect(validatePickup(FORM, 0)).toMatch(/empty/);
    expect(validatePickup({ ...FORM, name: " " }, 1)).toBe("Please enter your name.");
    expect(validatePickup({ ...FORM, phone: "555 0123" }, 1)).toMatch(/10 digit/);
    expect(validatePickup({ ...FORM, date: "" }, 1)).toBe(
      "Please choose a pickup date.",
    );
    expect(validatePickup({ ...FORM, time: "" }, 1)).toBe(
      "Please choose a preferred pickup time.",
    );
    expect(validatePickup(FORM, 1)).toBeNull();
  });

  it("uses the visitor's own date for the earliest pickup, not UTC's", () => {
    // 11pm on 25 Sep in Frisco is already 26 Sep in UTC.
    expect(localDateValue(new Date(2026, 8, 25, 23, 0))).toBe("2026-09-25");
  });

  it("writes out everything the kitchen needs to fill the order", () => {
    const lines = priceLines(
      [{ dishId: "dahi-bhalla", size: "small", qty: 2 }],
      DISHES,
    );
    const message = orderMessage(FORM, lines);
    expect(message).toContain("Name: Asha");
    expect(message).toContain("Mobile: (469) 555 0123");
    expect(message).toMatch(/Pickup: Saturday, September 26.*5:30/);
    expect(message).toContain("2 × Dahi Bhalla (Small · 16 oz) — $18");
    expect(message).toContain("Subtotal: $18 before sales tax");
    expect(message).toContain("Notes: Mild, please");
  });

  it("leaves the notes line out when there are none", () => {
    expect(orderMessage({ ...FORM, notes: "" }, [])).not.toContain("Notes:");
  });

  it("addresses the text and the email to the kitchen with the order as the body", () => {
    const body = "Chaska pickup order\n2 × Dahi Bhalla";
    expect(smsHref("+12148017809", body)).toBe(
      `sms:+12148017809?&body=${encodeURIComponent(body)}`,
    );
    expect(mailtoHref("k@example.com", { subject: "Pickup order — Asha", body })).toBe(
      `mailto:k@example.com?subject=${encodeURIComponent("Pickup order — Asha")}&body=${encodeURIComponent(body)}`,
    );
  });
});
