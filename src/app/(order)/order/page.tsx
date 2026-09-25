import { OrderClient } from "@/components/order/OrderClient";
import type { OrderDish } from "@/components/order/types";
import { PageHeader } from "@/components/sections/PageHeader";
import { getDishes, getOrderPage, getSite } from "@/content";
import { getImage } from "@/content/images";
import { formatPlace } from "@/lib/format";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Order",
  description:
    "Order Chaska's dishes for pickup in Frisco, Texas. Made to order and packed in sealed 16 oz and 32 oz containers.",
  path: "/order",
});

export default function OrderPage() {
  const page = getOrderPage();
  const site = getSite();

  // Resolved here, on the server, so the client bundle carries plain data and
  // none of the content layer.
  const dishes: OrderDish[] = getDishes().map((dish) => ({
    id: dish.id,
    name: dish.name,
    description: dish.orderDescription ?? dish.description,
    pricing: dish.pricing,
    ...getImage(dish.imageId),
  }));

  return (
    <>
      <PageHeader
        kicker={page.kicker}
        title={page.title}
        intro={page.intro}
        measure="menu"
        headingSize="title"
      />
      <OrderClient
        dishes={dishes}
        place={formatPlace(site.contact.address)}
        contact={{
          phoneE164: site.contact.phone.e164,
          phoneDisplay: site.contact.phone.display,
          email: site.contact.email.general,
        }}
      />
    </>
  );
}
