import { CartProvider } from "@/components/order/CartProvider";
import { OrderClient } from "@/components/order/OrderClient";
import { NoticeCard } from "@/components/sections/NoticeCard";
import { PageHeader } from "@/components/sections/PageHeader";
import { getCategories, getOrderPage, getSite } from "@/content";
import { groupByCategory } from "@/lib/categories";
import { getTodaysMenu } from "@/lib/daily-menu";
import { formatPlace } from "@/lib/format";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Order",
  description:
    "Order today's menu from Chaska for pickup in Frisco, Texas. Made to order and packed in sealed 16 oz and 32 oz containers.",
  path: "/order",
});

/**
 * With Shopify configured the daily menu is re-read at most once a minute
 * (see `DAILY_MENU_REVALIDATE_SECONDS`); without it the page is static.
 */
export const revalidate = 60;

export default async function OrderPage() {
  const page = getOrderPage();
  const site = getSite();
  const menu = await getTodaysMenu();
  const place = formatPlace(site.contact.address);

  const notice =
    menu.status === "unavailable"
      ? page.unavailable
      : menu.dishes.length === 0
        ? page.empty
        : null;

  return (
    <>
      <PageHeader
        kicker={page.kicker}
        title={page.title}
        intro={page.intro}
        measure="menu"
        headingSize="title"
      />
      {menu.status === "ok" && !notice ? (
        <CartProvider>
          <OrderClient
            groups={groupByCategory(menu.dishes, getCategories())}
            checkout={menu.checkout}
            place={place}
            contact={{
              phoneE164: site.contact.phone.e164,
              phoneDisplay: site.contact.phone.display,
              email: site.contact.email.general,
            }}
          />
        </CartProvider>
      ) : notice ? (
        <div className="mx-auto max-w-catering-intro pb-sec-lg">
          <NoticeCard
            title={notice.title}
            body={`${notice.body} ${site.contact.phone.display}.`}
          />
        </div>
      ) : null}
    </>
  );
}
