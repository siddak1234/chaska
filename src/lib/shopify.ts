/**
 * Shopify Storefront API — the daily menu and checkout.
 *
 * Server-only by construction: nothing here is imported by a client component,
 * and none of the environment variables carry the `NEXT_PUBLIC_` prefix, so
 * the token never reaches the browser bundle.
 *
 * Shopify is on when all three variables are set; with any missing the Order
 * page sells the catalogue in `dishes.data.json` and sends orders by text, as
 * before. Endpoint, header and field shapes follow Shopify's Storefront API
 * schema for version 2026-04 (as published in `@shopify/hydrogen-react`).
 */

export const STOREFRONT_API_VERSION = "2026-04";

/** How long a fetched daily menu is served before Shopify is asked again. */
export const DAILY_MENU_REVALIDATE_SECONDS = 60;

export type ShopifyConfig = {
  /** `your-store.myshopify.com` */
  storeDomain: string;
  /** The public Storefront API access token. */
  storefrontToken: string;
  /** Handle of the collection holding today's dishes, e.g. `daily-menu`. */
  menuCollection: string;
};

export function readShopifyConfig(
  env: Record<string, string | undefined> = process.env,
): ShopifyConfig | null {
  const storeDomain = env.SHOPIFY_STORE_DOMAIN?.trim()
    .replace(/^https?:\/\//, "")
    .replace(/\/+$/, "");
  const storefrontToken = env.SHOPIFY_STOREFRONT_ACCESS_TOKEN?.trim();
  const menuCollection = env.SHOPIFY_MENU_COLLECTION?.trim();
  if (!storeDomain || !storefrontToken || !menuCollection) return null;
  return { storeDomain, storefrontToken, menuCollection };
}

/* ── Response shapes (only the fields queried below) ──────────────────── */

export type ShopifyVariant = {
  id: string;
  title: string;
  availableForSale: boolean;
  selectedOptions: { name: string; value: string }[];
  price: { amount: string; currencyCode: string };
};

export type ShopifyProduct = {
  handle: string;
  title: string;
  description: string;
  productType: string;
  availableForSale: boolean;
  featuredImage: {
    url: string;
    altText: string | null;
    width: number | null;
    height: number | null;
  } | null;
  variants: { nodes: ShopifyVariant[] };
};

const DAILY_MENU_QUERY = /* GraphQL */ `
  query DailyMenu($handle: String!) {
    collection(handle: $handle) {
      products(first: 100) {
        nodes {
          handle
          title
          description
          productType
          availableForSale
          featuredImage {
            url
            altText
            width
            height
          }
          variants(first: 10) {
            nodes {
              id
              title
              availableForSale
              selectedOptions {
                name
                value
              }
              price {
                amount
                currencyCode
              }
            }
          }
        }
      }
    }
  }
`;

const CART_CREATE_MUTATION = /* GraphQL */ `
  mutation CartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        checkoutUrl
      }
      userErrors {
        message
      }
    }
  }
`;

type GraphQLResponse<T> = { data?: T; errors?: { message: string }[] };

async function storefront<T>(
  config: ShopifyConfig,
  query: string,
  variables: Record<string, unknown>,
  init: { next?: { revalidate: number; tags: string[] }; cache?: RequestCache } = {},
): Promise<T> {
  const response = await fetch(
    `https://${config.storeDomain}/api/${STOREFRONT_API_VERSION}/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": config.storefrontToken,
      },
      body: JSON.stringify({ query, variables }),
      ...init,
    },
  );
  if (!response.ok) {
    throw new Error(`Shopify Storefront API responded ${response.status}`);
  }
  const body = (await response.json()) as GraphQLResponse<T>;
  if (body.errors?.length) {
    throw new Error(
      `Shopify Storefront API: ${body.errors.map((e) => e.message).join("; ")}`,
    );
  }
  if (!body.data) throw new Error("Shopify Storefront API returned no data");
  return body.data;
}

/**
 * The products in today's menu collection. `null` when the collection does
 * not exist — a misconfigured handle, which is not the same as an empty menu.
 */
export async function fetchDailyMenuProducts(
  config: ShopifyConfig,
): Promise<ShopifyProduct[] | null> {
  const data = await storefront<{
    collection: { products: { nodes: ShopifyProduct[] } } | null;
  }>(
    config,
    DAILY_MENU_QUERY,
    { handle: config.menuCollection },
    { next: { revalidate: DAILY_MENU_REVALIDATE_SECONDS, tags: ["daily-menu"] } },
  );
  return data.collection ? data.collection.products.nodes : null;
}

export type CheckoutLine = { merchandiseId: string; quantity: number };

/** A Shopify cart holding these lines; returns its hosted checkout URL. */
export async function createCheckout(
  config: ShopifyConfig,
  lines: readonly CheckoutLine[],
): Promise<string> {
  const data = await storefront<{
    cartCreate: {
      cart: { checkoutUrl: string } | null;
      userErrors: { message: string }[];
    } | null;
  }>(config, CART_CREATE_MUTATION, { input: { lines } }, { cache: "no-store" });

  const result = data.cartCreate;
  if (result?.userErrors.length) {
    throw new Error(result.userErrors.map((e) => e.message).join("; "));
  }
  if (!result?.cart) throw new Error("Shopify did not return a cart");
  return result.cart.checkoutUrl;
}
