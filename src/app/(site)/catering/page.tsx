import { CateringPackages } from "@/components/sections/CateringPackages";
import { Section } from "@/components/ui/Section";
import { getCatering, getSite } from "@/content";
import { instagramUrl } from "@/lib/format";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Catering",
  description:
    "Catering trays, high tea spreads and party bites from Chaska, made to order in Frisco, Texas. Message us on Instagram to plan yours.",
  path: "/catering",
});

export default function CateringPage() {
  const catering = getCatering();
  const site = getSite();

  return (
    <Section pad="catering" aria-labelledby="catering-heading">
      <CateringPackages
        catering={catering}
        cta={{ label: catering.ctaLabel, href: instagramUrl(site.social.instagram) }}
      />
    </Section>
  );
}
