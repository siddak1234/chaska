"use client";

import { useMemo, useState } from "react";

import { CourseHeading } from "@/components/sections/CourseHeading";
import { formatPickup, orderMessage, priceLines, type PickupForm } from "@/lib/cart";
import type { CategoryGroup } from "@/lib/categories";
import { startCheckout } from "@/lib/checkout";
import type { OrderDish } from "@/lib/daily-menu";
import { mailtoHref, smsHref } from "@/lib/format";

import { CartDrawer } from "./CartDrawer";
import { useCart } from "./CartProvider";
import { Checkout } from "./Checkout";
import { DishCard } from "./DishCard";
import { categoryAnchor, OrderBar } from "./OrderBar";
import { OrderSent, type PlacedOrder } from "./OrderSent";
import type { OrderContact } from "./types";

type OrderClientProps = {
  /** Today's dishes, grouped and ordered by category on the server. */
  groups: CategoryGroup<OrderDish>[];
  /**
   * `shopify` — "Checkout" opens Shopify's hosted checkout.
   * `message` — "Checkout" asks for pickup details and writes the order into
   *             a text message (or, on a mouse-driven device, an email) to
   *             the kitchen.
   */
  checkout: "shopify" | "message";
  contact: OrderContact;
  place: string;
};

/**
 * The Order page below its header: the dishes by category, then — when orders
 * go by message — the pickup form and the sent order, plus the cart drawer.
 */
export function OrderClient({ groups, checkout, contact, place }: OrderClientProps) {
  const { cart, clear, setDrawerOpen } = useCart();
  const [view, setView] = useState<"menu" | "checkout" | "sent">("menu");
  const [placed, setPlaced] = useState<PlacedOrder | null>(null);
  const [checkoutState, setCheckoutState] = useState<
    { busy: false; error: string | null } | { busy: true }
  >({ busy: false, error: null });

  const dishes = useMemo(() => groups.flatMap((group) => group.items), [groups]);
  const lines = useMemo(() => priceLines(cart, dishes), [cart, dishes]);

  function goTo(next: "menu" | "checkout") {
    setView(next);
    setDrawerOpen(false);
    window.scrollTo(0, 0);
  }

  async function checkoutWithShopify() {
    setCheckoutState({ busy: true });
    const result = await startCheckout(
      lines.map((line) => ({
        merchandiseId: dishes.find((d) => d.id === line.dishId)?.variants?.[line.size],
        quantity: line.qty,
      })),
    );
    if ("url" in result && result.url.startsWith("https://")) {
      window.location.assign(result.url);
      return;
    }
    setCheckoutState({
      busy: false,
      error: "error" in result ? result.error : "Checkout could not be started.",
    });
  }

  function placeByMessage(form: PickupForm) {
    const message = orderMessage(form, lines);
    const order: PlacedOrder = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      when: formatPickup(form.date, form.time),
      lines,
      smsHref: smsHref(contact.phoneE164, message),
      mailtoHref: mailtoHref(contact.email, {
        subject: `Pickup order — ${form.name.trim()}`,
        body: message,
      }),
    };
    setPlaced(order);
    setView("sent");
    clear();
    window.scrollTo(0, 0);

    const coarse = window.matchMedia("(pointer: coarse)").matches;
    window.location.href = coarse ? order.smsHref : order.mailtoHref;
  }

  return (
    <div className="pb-16">
      {view === "menu" ? (
        <>
          <OrderBar categories={groups.map((group) => group.category)} />
          {groups.map((group, index) => (
            <section
              key={group.category.id}
              id={categoryAnchor(group.category.id)}
              aria-labelledby={`${categoryAnchor(group.category.id)}-heading`}
              className={
                index === 0
                  ? "scroll-mt-14 pt-8"
                  : "mt-12 scroll-mt-14 border-t border-ink pt-8"
              }
            >
              <CourseHeading
                id={`${categoryAnchor(group.category.id)}-heading`}
                name={group.category.name}
                englishName={group.category.englishName}
                level={2}
                compact
                className="mb-7"
              />
              <div className="grid auto-fill-270-min gap-x-gap-order gap-y-7 sm:gap-y-10">
                {group.items.map((dish) => (
                  <DishCard key={dish.id} dish={dish} />
                ))}
              </div>
            </section>
          ))}
        </>
      ) : null}

      {view === "checkout" ? (
        <Checkout
          lines={lines}
          place={place}
          onBack={() => goTo("menu")}
          onPlace={placeByMessage}
        />
      ) : null}

      {view === "sent" && placed ? (
        <OrderSent
          order={placed}
          phoneDisplay={contact.phoneDisplay}
          onNewOrder={() => {
            setPlaced(null);
            goTo("menu");
          }}
        />
      ) : null}

      <CartDrawer
        lines={lines}
        note={`Pickup only · ${place}`}
        busy={checkoutState.busy}
        error={checkoutState.busy ? null : checkoutState.error}
        onCheckout={
          checkout === "shopify" ? checkoutWithShopify : () => goTo("checkout")
        }
      />
    </div>
  );
}
