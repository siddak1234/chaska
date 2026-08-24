import { getMenu, getSite, getSiteUrl } from "@/content";
import { priceForSchema, toOpeningHoursSpecification } from "@/lib/format";

/**
 * schema.org markup. For a restaurant this is not decoration: it is what puts
 * hours, phone number and cuisine into search results and maps.
 *
 * Deliberately incomplete in one place — `streetAddress` is omitted because
 * the artboards never state one, and inventing an address for a restaurant is
 * worse than omitting it. `scripts/check-placeholders.ts` blocks the
 * production build until a real address is supplied.
 */
export function restaurantJsonLd() {
  const site = getSite();
  const url = getSiteUrl();
  const { address, phone, email } = site.contact;

  return {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "@id": `${url}#restaurant`,
    name: site.name,
    alternateName: site.nameGurmukhi,
    description: `${site.descriptor} in ${address.locality}, ${address.regionName}. ${site.tagline}.`,
    url,
    telephone: phone.e164,
    email: email.general,
    servesCuisine: site.cuisine,
    areaServed: site.metroArea,
    address: {
      "@type": "PostalAddress",
      ...(address.street ? { streetAddress: address.street } : {}),
      addressLocality: address.locality,
      addressRegion: address.region,
      ...(address.postalCode ? { postalCode: address.postalCode } : {}),
      addressCountry: address.country,
    },
    openingHoursSpecification: [toOpeningHoursSpecification(site.hours)],
    hasMenu: `${url}/menu`,
  };
}

export function menuJsonLd() {
  const menu = getMenu();
  const url = getSiteUrl();

  return {
    "@context": "https://schema.org",
    "@type": "Menu",
    "@id": `${url}/menu#menu`,
    name: menu.title,
    description: menu.intro,
    inLanguage: "en-US",
    hasMenuSection: menu.courses.map((course) => ({
      "@type": "MenuSection",
      name: course.name,
      description: course.englishName,
      hasMenuItem: course.items.map((item) => ({
        "@type": "MenuItem",
        name: item.name,
        ...(item.description ? { description: item.description } : {}),
        // schema.org allows a MenuItem with no offer. Emitting an offer with a
        // zero or invented price would be worse than emitting none.
        ...(item.price
          ? {
              offers: {
                "@type": "Offer",
                price: priceForSchema(item.price),
                priceCurrency: item.price.currency,
              },
            }
          : {}),
      })),
    })),
  };
}

/**
 * Renders a JSON-LD block.
 *
 * `dangerouslySetInnerHTML` does no escaping, so `<` is encoded as `\u003c`
 * before it reaches the document — otherwise a `</script>` sequence anywhere
 * in the content would terminate the block early.
 */
export function JsonLd({ data }: { data: unknown }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
  );
}
