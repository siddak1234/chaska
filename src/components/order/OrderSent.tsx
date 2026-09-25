import { Button, ButtonLink } from "@/components/ui/Button";
import { Heading } from "@/components/ui/Heading";
import { Kicker } from "@/components/ui/Kicker";
import type { PricedLine } from "@/lib/cart";

import { OrderLines } from "./OrderLines";

export type PlacedOrder = {
  name: string;
  phone: string;
  when: string;
  lines: PricedLine[];
  smsHref: string;
  mailtoHref: string;
};

type OrderSentProps = {
  order: PlacedOrder;
  phoneDisplay: string;
  onNewOrder: () => void;
};

/**
 * After "Place pickup order".
 *
 * The design says "Order received", but nothing is received until the
 * customer sends the message the button opened — the site has no server to
 * receive it. So this view says what is true, and keeps both ways of sending
 * one tap away in case the messaging app did not open.
 */
export function OrderSent({ order, phoneDisplay, onNewOrder }: OrderSentProps) {
  return (
    <section
      aria-labelledby="sent-heading"
      className="mx-auto max-w-[640px] py-sec-xl text-center rule-double"
    >
      <Kicker className="mb-3.5">Send your order</Kicker>
      <Heading level={2} size="catering" id="sent-heading" className="leading-[1.15]">
        Shukriya, {order.name}.
      </Heading>
      <p className="mt-5 text-prose text-ink-secondary">
        Your order is written out in a message to {phoneDisplay}. Send it, and we will
        text {order.phone} to confirm your order and the pickup address in Frisco.
        Requested pickup: {order.when}.
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3.5">
        <ButtonLink href={order.smsHref} variant="accent">
          Send by text
        </ButtonLink>
        <ButtonLink href={order.mailtoHref} variant="outline">
          Send by email
        </ButtonLink>
      </div>
      <div className="mt-8 border border-ink px-6 py-5 text-left">
        <OrderLines lines={order.lines} layout="inline" />
      </div>
      <div className="mt-8">
        <Button variant="outline" onClick={onNewOrder}>
          Start a new order
        </Button>
      </div>
    </section>
  );
}
