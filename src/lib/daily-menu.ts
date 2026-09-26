import { getCategories, getDishes } from "@/content";
import { getImage, type FrameImage } from "@/content/images";
import type { Category, Dish, DishPricing } from "@/content/schema";
import { sizeLabel, type CartDish, type Size } from "@/lib/cart";
import { FALLBACK_CATEGORY, findCategory } from "@/lib/categories";
import {
  fetchDailyMenuProducts,
  readShopifyConfig,
  type ShopifyProduct,
  type ShopifyVariant,
} from "@/lib/shopify";

/**
 * What the Order page sells today.
 *
 * With Shopify configured, today's menu is the products in the daily menu
 * collection, and checkout happens on Shopify. Without it, the menu is the
 * catalogue in `dishes.data.json`, and the order goes out as a text message.
 * The page renders both the same way; only where "Checkout" leads differs.
 */

/** A dish as the Order page's client components receive it from the server. */
export type OrderDish = CartDish & {
  description: string;
  categoryId: string;
  /** `null` when neither we nor Shopify has a photograph of it. */
  image: FrameImage | null;
  alt: string;
  /** Shopify variant id per size; absent when checkout is by message. */
  variants?: Partial<Record<Size, string>>;
};

export type TodaysMenu =
  | { status: "ok"; checkout: "shopify" | "message"; dishes: OrderDish[] }
  /** Shopify is configured but could not be read, or the collection is missing. */
  | { status: "unavailable" };

function fromCatalogue(dish: Dish): OrderDish {
  return {
    id: dish.id,
    name: dish.name,
    description: dish.orderDescription ?? dish.description,
    pricing: dish.pricing,
    categoryId: dish.category,
    ...getImage(dish.imageId),
  };
}

/* ── Shopify product → dish ───────────────────────────────────────────── */

function optionIs(variant: ShopifyVariant, value: "small" | "large"): boolean {
  return variant.selectedOptions.some(
    (option) => option.value.trim().toLowerCase() === value,
  );
}

function amountOf(variant: ShopifyVariant): number | null {
  if (variant.price.currencyCode !== "USD") return null;
  const amount = Number(variant.price.amount);
  return Number.isFinite(amount) && amount > 0 ? amount : null;
}

/**
 * How a product is sold, read off its available variants:
 *
 *  - a "Small" and a "Large" variant (any option name, e.g. Size) → the two
 *    container sizes;
 *  - exactly one variant → sold singly: "Large · 32 oz" when it is one of
 *    the container sizes (the other sold out), else under the catalogue's
 *    unit ("Per dabeli"), else the variant's own title;
 *  - anything else → `null`, and the product is left off with a warning
 *    rather than shown with a guessed price.
 */
function pricingOf(
  product: ShopifyProduct,
  record: Dish | undefined,
): { pricing: DishPricing; variants: Partial<Record<Size, string>> } | null {
  const available = product.variants.nodes.filter((v) => v.availableForSale);
  const small = available.find((v) => optionIs(v, "small"));
  const large = available.find((v) => optionIs(v, "large"));

  if (small && large) {
    const smallPrice = amountOf(small);
    const largePrice = amountOf(large);
    if (smallPrice === null || largePrice === null) return null;
    return {
      pricing: { kind: "container", small: smallPrice, large: largePrice },
      variants: { small: small.id, large: large.id },
    };
  }

  const only = available.length === 1 ? available[0] : undefined;
  if (!only) return null;
  const each = amountOf(only);
  if (each === null) return null;

  // One container size left (the other sold out) keeps its container label.
  const onlySize = optionIs(only, "small")
    ? "small"
    : optionIs(only, "large")
      ? "large"
      : null;
  const unit = onlySize
    ? sizeLabel({ kind: "container", small: each, large: each }, onlySize)
    : record?.pricing.kind === "each"
      ? record.pricing.unit
      : only.title !== "Default Title"
        ? only.title
        : "Each";
  return { pricing: { kind: "each", unit, each }, variants: { each: only.id } };
}

/**
 * One Shopify product as a dish. The product's handle is the dish id: when it
 * matches a catalogue record, our name, line, photograph and category are
 * used, and Shopify supplies only availability and price. A product we have no
 * record of is still sold, with its Shopify title, description and image, under
 * the category its product type names — or under "More" if it names none.
 */
export function dishFromProduct(
  product: ShopifyProduct,
  catalogue: ReadonlyMap<string, Dish>,
  categories: readonly Category[],
): OrderDish | null {
  if (!product.availableForSale) return null;
  const record = catalogue.get(product.handle);
  const sold = pricingOf(product, record);
  if (!sold) {
    console.warn(
      `[daily-menu] "${product.handle}" left off today's menu: it needs one variant, ` +
        `or a Small and a Large variant, available and priced in USD.`,
    );
    return null;
  }

  if (record) return { ...fromCatalogue(record), ...sold };

  const image = product.featuredImage;
  return {
    id: product.handle,
    name: product.title,
    description: product.description,
    categoryId: (findCategory(product.productType, categories) ?? FALLBACK_CATEGORY).id,
    image:
      image?.width && image.height
        ? { src: image.url, width: image.width, height: image.height }
        : null,
    alt: image?.altText || product.title,
    ...sold,
  };
}

export function dishesFromProducts(
  products: readonly ShopifyProduct[],
  catalogue: readonly Dish[],
  categories: readonly Category[],
): OrderDish[] {
  const byId = new Map(catalogue.map((dish) => [dish.id, dish]));
  return products.flatMap((product) => {
    const dish = dishFromProduct(product, byId, categories);
    return dish ? [dish] : [];
  });
}

export async function getTodaysMenu(): Promise<TodaysMenu> {
  const config = readShopifyConfig();
  if (!config) {
    return {
      status: "ok",
      checkout: "message",
      dishes: getDishes().map(fromCatalogue),
    };
  }

  try {
    const products = await fetchDailyMenuProducts(config);
    if (!products) {
      console.error(
        `[daily-menu] No Shopify collection with handle "${config.menuCollection}".`,
      );
      return { status: "unavailable" };
    }
    return {
      status: "ok",
      checkout: "shopify",
      dishes: dishesFromProducts(products, getDishes(), getCategories()),
    };
  } catch (error) {
    console.error("[daily-menu] Could not read today's menu from Shopify.", error);
    return { status: "unavailable" };
  }
}
