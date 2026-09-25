import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import { CartButton } from "@/components/order/CartButton";
import { CartProvider } from "@/components/order/CartProvider";
import { DishCard } from "@/components/order/DishCard";
import type { OrderDish } from "@/components/order/types";
import { getImage } from "@/content/images";
import { CART_STORAGE_KEY } from "@/lib/cart";

const DAHI: OrderDish = {
  id: "dahi-bhalla",
  name: "Dahi Bhalla",
  description: "Soft lentil dumplings.",
  pricing: { kind: "container", small: 9, large: 16 },
  ...getImage("dahi-bhalla"),
};

function renderCard() {
  return render(
    <CartProvider>
      <CartButton />
      <DishCard dish={DAHI} />
    </CartProvider>,
  );
}

beforeEach(() => window.localStorage.clear());

describe("DishCard", () => {
  it("offers the two container sizes as real radio inputs, small first", () => {
    renderCard();
    const small = screen.getByRole("radio", { name: /Small.*16 oz.*\$9/ });
    const large = screen.getByRole("radio", { name: /Large.*32 oz.*\$16/ });
    expect(small).toBeChecked();
    expect(large).not.toBeChecked();
  });

  it("adds the chosen size and quantity, counts it and stores it", async () => {
    const user = userEvent.setup();
    renderCard();

    await user.click(screen.getByRole("radio", { name: /Large/ }));
    await user.click(
      screen.getByRole("button", { name: "Increase quantity of Dahi Bhalla" }),
    );
    await user.click(screen.getByRole("button", { name: "Add to order" }));

    expect(screen.getByRole("button", { name: /Cart/ })).toHaveTextContent(
      "Cart2 items",
    );
    expect(JSON.parse(window.localStorage.getItem(CART_STORAGE_KEY) ?? "[]")).toEqual([
      { dishId: "dahi-bhalla", size: "large", qty: 2 },
    ]);
  });

  it("never lets the quantity drop below one", async () => {
    const user = userEvent.setup();
    renderCard();
    await user.click(
      screen.getByRole("button", { name: "Decrease quantity of Dahi Bhalla" }),
    );
    expect(screen.getByText("1")).toBeInTheDocument();
  });
});
