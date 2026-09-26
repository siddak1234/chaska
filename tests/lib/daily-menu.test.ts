import { afterEach, describe, expect, it, vi } from "vitest";

import { getCategories, getDishes } from "@/content";
import { getImage } from "@/content/images";
import { priceLines } from "@/lib/cart";
import { groupByCategory } from "@/lib/categories";
import { dishesFromProducts, getTodaysMenu } from "@/lib/daily-menu";
import {
  STOREFRONT_API_VERSION,
  createCheckout,
  readShopifyConfig,
  type ShopifyProduct,
  type ShopifyVariant,
} from "@/lib/shopify";

const ENV = {
  SHOPIFY_STORE_DOMAIN: "chaska-test.myshopify.com",
  SHOPIFY_STOREFRONT_ACCESS_TOKEN: "public-token",
  SHOPIFY_MENU_COLLECTION: "daily-menu",
};

let nextVariant = 1;
function variant(
  options: Partial<ShopifyVariant> & { size?: string; amount?: string } = {},
): ShopifyVariant {
  const { size, amount = "9.0", ...rest } = options;
  return {
    id: `gid://shopify/ProductVariant/${nextVariant++}`,
    title: size ?? "Default Title",
    availableForSale: true,
    selectedOptions: [
      { name: size ? "Size" : "Title", value: size ?? "Default Title" },
    ],
    price: { amount, currencyCode: "USD" },
    ...rest,
  };
}

function product(
  handle: string,
  variants: ShopifyVariant[],
  extra: Partial<ShopifyProduct> = {},
): ShopifyProduct {
  return {
    handle,
    title: handle,
    description: "",
    productType: "",
    availableForSale: true,
    featuredImage: null,
    variants: { nodes: variants },
    ...extra,
  };
}

const map = (products: ShopifyProduct[]) =>
  dishesFromProducts(products, getDishes(), getCategories());

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("readShopifyConfig", () => {
  it("is off unless the domain, the token and the collection are all set", () => {
    expect(readShopifyConfig({})).toBeNull();
    expect(readShopifyConfig({ ...ENV, SHOPIFY_MENU_COLLECTION: "" })).toBeNull();
    expect(
      readShopifyConfig({ ...ENV, SHOPIFY_STOREFRONT_ACCESS_TOKEN: " " }),
    ).toBeNull();
  });

  it("accepts the domain with or without a scheme", () => {
    expect(
      readShopifyConfig({
        ...ENV,
        SHOPIFY_STORE_DOMAIN: "https://chaska-test.myshopify.com/",
      })?.storeDomain,
    ).toBe("chaska-test.myshopify.com");
  });
});

describe("dishesFromProducts", () => {
  it("uses our record for a known handle, and Shopify's prices and variants", () => {
    const small = variant({ size: "Small", amount: "10.0" });
    const large = variant({ size: "Large", amount: "18.5" });
    const [dish] = map([
      product("dahi-bhalla", [small, large], { title: "DAHI (shopify)" }),
    ]);

    expect(dish).toEqual({
      id: "dahi-bhalla",
      name: "Dahi Bhalla",
      description: expect.stringContaining("lentil dumplings"),
      categoryId: "small-plates",
      pricing: { kind: "container", small: 10, large: 18.5 },
      variants: { small: small.id, large: large.id },
      ...getImage("dahi-bhalla"),
    });
  });

  it("sells a single-variant product by the piece, keeping our unit", () => {
    const only = variant({ amount: "5.00" });
    const [dish] = map([product("kutchi-dabeli", [only])]);
    expect(dish?.pricing).toEqual({ kind: "each", unit: "Per dabeli", each: 5 });
    expect(dish?.variants).toEqual({ each: only.id });
  });

  it("places an unknown product by its product type, with Shopify's own details", () => {
    const [dish] = map([
      product("samosa", [variant({ amount: "3.0" })], {
        title: "Samosa",
        description: "Crisp pastry.",
        productType: "Small plates",
        featuredImage: {
          url: "https://cdn.shopify.com/s/files/samosa.jpg",
          altText: null,
          width: 800,
          height: 600,
        },
      }),
    ]);
    expect(dish).toMatchObject({
      id: "samosa",
      name: "Samosa",
      description: "Crisp pastry.",
      categoryId: "small-plates",
      image: {
        src: "https://cdn.shopify.com/s/files/samosa.jpg",
        width: 800,
        height: 600,
      },
      alt: "Samosa",
      pricing: { kind: "each", unit: "Each", each: 3 },
    });
  });

  it("lists an unknown product with no matching type under More", () => {
    const [dish] = map([product("special", [variant()], { productType: "Specials" })]);
    expect(dish?.categoryId).toBe("more");
    expect(dish?.image).toBeNull();
  });

  it("leaves off a product it cannot price, rather than guess", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const products = [
      product("sold-out", [variant({ availableForSale: false })]),
      product("three-sizes", [
        variant({ size: "S" }),
        variant({ size: "M" }),
        variant(),
      ]),
      product("in-euros", [
        variant({
          price: { amount: "9.0", currencyCode: "EUR" },
        } as Partial<ShopifyVariant>),
      ]),
      product("unavailable", [variant()], { availableForSale: false }),
    ];
    expect(map(products)).toEqual([]);
  });

  it("sells the one size left when the other is sold out", () => {
    const large = variant({ size: "Large", amount: "16.0" });
    const [dish] = map([
      product("masala-idli", [
        variant({ size: "Small", availableForSale: false }),
        large,
      ]),
    ]);
    expect(dish?.pricing).toEqual({ kind: "each", unit: "Large · 32 oz", each: 16 });
    expect(dish?.variants).toEqual({ each: large.id });
  });

  it("groups a shuffled daily menu under the right headings", () => {
    const today = map([
      product("panjiri", [variant()]),
      product("bhutta-dip", [variant({ size: "Small" }), variant({ size: "Large" })]),
      product("butter-chicken-sliders", [variant()]),
      product("burrata-lababdar", [
        variant({ size: "Small" }),
        variant({ size: "Large" }),
      ]),
      product("masala-idli", [variant({ size: "Small" }), variant({ size: "Large" })]),
    ]);
    expect(
      groupByCategory(today, getCategories()).map((g) => [
        g.category.name,
        g.items.map((d) => d.id),
      ]),
    ).toEqual([
      ["Shuruaat", ["bhutta-dip", "masala-idli"]],
      ["Ghar di Rasoi", ["burrata-lababdar"]],
      ["Chaat te Sliders", ["butter-chicken-sliders"]],
      ["Mitha", ["panjiri"]],
    ]);
  });
});

describe("a cart kept from another day", () => {
  it("drops a line whose size today's menu no longer sells", () => {
    const [idli] = map([product("masala-idli", [variant({ size: "Large" })])]);
    expect(idli).toBeDefined();
    const lines = priceLines(
      [
        { dishId: "masala-idli", size: "small", qty: 1 },
        { dishId: "masala-idli", size: "each", qty: 2 },
      ],
      idli ? [idli] : [],
    );
    expect(lines.map((l) => [l.size, l.qty])).toEqual([["each", 2]]);
  });
});

describe("getTodaysMenu", () => {
  it("sells the catalogue, by message, when Shopify is not configured", async () => {
    for (const key of Object.keys(ENV)) vi.stubEnv(key, "");
    const menu = await getTodaysMenu();
    expect(menu.status).toBe("ok");
    if (menu.status !== "ok") return;
    expect(menu.checkout).toBe("message");
    expect(menu.dishes.map((d) => d.id)).toEqual(getDishes().map((d) => d.id));
  });

  it("reads the daily menu collection from the Storefront API", async () => {
    for (const [key, value] of Object.entries(ENV)) vi.stubEnv(key, value);
    const fetchMock = vi.fn().mockResolvedValue(
      Response.json({
        data: {
          collection: { products: { nodes: [product("panjiri", [variant()])] } },
        },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const menu = await getTodaysMenu();
    expect(menu).toMatchObject({ status: "ok", checkout: "shopify" });
    expect(menu.status === "ok" && menu.dishes.map((d) => d.id)).toEqual(["panjiri"]);

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(
      `https://chaska-test.myshopify.com/api/${STOREFRONT_API_VERSION}/graphql.json`,
    );
    expect(init.headers).toMatchObject({
      "X-Shopify-Storefront-Access-Token": "public-token",
    });
    expect(JSON.parse(String(init.body)).variables).toEqual({ handle: "daily-menu" });
  });

  it("reports the menu unavailable — never the static catalogue — when Shopify fails", async () => {
    for (const [key, value] of Object.entries(ENV)) vi.stubEnv(key, value);
    vi.spyOn(console, "error").mockImplementation(() => {});

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("", { status: 503 })),
    );
    expect(await getTodaysMenu()).toEqual({ status: "unavailable" });

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(Response.json({ data: { collection: null } })),
    );
    expect(await getTodaysMenu()).toEqual({ status: "unavailable" });
  });
});

describe("createCheckout", () => {
  const config = readShopifyConfig(ENV)!;

  it("creates a cart with the lines and returns Shopify's checkout URL", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      Response.json({
        data: {
          cartCreate: {
            cart: { checkoutUrl: "https://chaska-test.myshopify.com/cart/c/abc" },
            userErrors: [],
          },
        },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const lines = [{ merchandiseId: "gid://shopify/ProductVariant/7", quantity: 2 }];

    await expect(createCheckout(config, lines)).resolves.toBe(
      "https://chaska-test.myshopify.com/cart/c/abc",
    );
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(String(init.body)).variables).toEqual({ input: { lines } });
  });

  it("surfaces Shopify's user errors", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        Response.json({
          data: { cartCreate: { cart: null, userErrors: [{ message: "Sold out" }] } },
        }),
      ),
    );
    await expect(
      createCheckout(config, [
        { merchandiseId: "gid://shopify/ProductVariant/7", quantity: 1 },
      ]),
    ).rejects.toThrow("Sold out");
  });
});
