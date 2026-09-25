import { getDishes, getMenu, getSignatureBands, getSite, getSiteUrl } from "@/content";
import type { Dish } from "@/content/schema";
import { formatPlace, instagramUrl, priceForSchema } from "@/lib/format";
import { sizeLabel, unitPrice } from "@/lib/cart";

/**
 * schema.org markup: what puts the phone number, cuisine and menu into search
 * results.
 *
 * `FoodEstablishment`, not `Restaurant`: the current design describes a family
 * kitchen that sells for pickup and caters, with no dining room. The
 * `PostalAddress` is town-level — locality, region, country — because the site
 * publishes no street address, by decision. No opening hours are declared; the
 * design removed them.
 */
export function kitchenJsonLd() {
  const site = getSite();
  const url = getSiteUrl();
  const { address, phone, email } = site.contact;

  return {
    "@context": "https://schema.org",
    "@type": "FoodEstablishment",
    "@id": `${url}#kitchen`,
    name: site.name,
    alternateName: site.nameGurmukhi,
    description: `${site.descriptor} in ${formatPlace(address)}. ${site.tagline}.`,
    url,
    telephone: phone.e164,
    email: email.general,
    servesCuisine: site.cuisine,
    areaServed: site.metroArea,
    sameAs: [instagramUrl(site.social.instagram)],
    address: {
      "@type": "PostalAddress",
      addressLocality: address.locality,
      addressRegion: address.region,
      addressCountry: address.country,
    },
    hasMenu: `${url}/menu`,
  };
}

/** One offer per size a dish is sold in, priced as on the Order page. */
function offersFor(dish: Dish) {
  const sizes =
    dish.pricing.kind === "each" ? (["each"] as const) : (["small", "large"] as const);
  return sizes.map((size) => ({
    "@type": "Offer",
    name: sizeLabel(dish.pricing, size),
    price: priceForSchema(unitPrice(dish.pricing, size)),
    priceCurrency: "USD",
  }));
}

export function menuJsonLd() {
  const menu = getMenu();
  const url = getSiteUrl();
  const dishById = new Map(getDishes().map((dish) => [dish.id, dish]));

  const signatureSections = getSignatureBands().flatMap((band) =>
    band.courses.map((course) => ({
      "@type": "MenuSection",
      name: course.name,
      description: course.englishName,
      hasMenuItem: course.items.map((item) => {
        const dish = dishById.get(item.id);
        return {
          "@type": "MenuItem",
          name: item.name,
          ...(item.description ? { description: item.description } : {}),
          ...(dish ? { offers: offersFor(dish) } : {}),
        };
      }),
    })),
  );

  // The full menu is unpriced. schema.org allows a MenuItem with no offer;
  // emitting one with a zero or invented price would be worse.
  const fullSections = menu.courses.map((course) => ({
    "@type": "MenuSection",
    name: course.name,
    description: course.englishName,
    hasMenuItem: course.items.map((item) => ({
      "@type": "MenuItem",
      name: item.name,
      ...(item.description ? { description: item.description } : {}),
    })),
  }));

  return {
    "@context": "https://schema.org",
    "@type": "Menu",
    "@id": `${url}/menu#menu`,
    name: menu.title,
    description: menu.intro,
    inLanguage: "en-US",
    hasMenuSection: [...signatureSections, ...fullSections],
  };
}

/**
 * Renders a JSON-LD block.
 *
 * `dangerouslySetInnerHTML` does no escaping, so `<` is encoded as `<`
 * before it reaches the document — otherwise a `</script>` sequence anywhere
 * in the content would terminate the block early.
 */
export function JsonLd({ data }: { data: unknown }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
  );
}
