import { PageHeader } from "@/components/sections/PageHeader";
import { Section } from "@/components/ui/Section";
import { SmartLink } from "@/components/ui/SmartLink";
import { getUniqueCredits } from "@/content/generated/images";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Photograph credits",
  description:
    "Attribution for the photographs used on this site, with photographer, licence and source.",
  path: "/credits",
});

/**
 * Required, not optional. Every photograph on the site is Creative Commons
 * with `AttributionRequired: true` on Wikimedia Commons; publishing them
 * without visible credit would breach the licence. `scripts/fetch-images.ts`
 * carries author and licence into the generated manifest so this page cannot
 * fall out of step with what is actually shipped.
 */
export default function CreditsPage() {
  const credits = getUniqueCredits();

  return (
    <>
      <PageHeader
        kicker="Notices · Attribution"
        title="Photograph credits"
        intro="The photographs on this site are used under Creative Commons licences. Each is credited to its photographer below, with a link to the original file and the licence it is published under."
        measure="menu"
        headingSize="titleAbout"
      />

      <Section rule="double" pad="sm">
        <dl className="grid auto-grid-300 gap-x-gap-menu gap-y-8">
          {credits.map((credit) => (
            <div key={credit.fileName}>
              <dt className="font-display text-row">{credit.author}</dt>
              <dd className="text-note text-ink-muted">
                <SmartLink
                  href={credit.sourceUrl}
                  className="inline-block py-2 leading-normal"
                >
                  {credit.fileName}
                </SmartLink>
              </dd>
              <dd>
                <SmartLink
                  href={credit.licenseUrl}
                  className="inline-block py-2 font-ui text-micro leading-normal font-bold tracking-meta text-oxblood uppercase no-underline"
                >
                  {credit.licenseName}
                </SmartLink>
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-8 max-w-menu-intro text-note text-ink-muted">
          Files are reproduced at reduced resolution. They are scaled only — never
          cropped, re-toned or otherwise adapted — so each remains the photographer’s
          original work under its stated licence. Cropping and the newsprint tone you
          see are applied in the browser at display time.
        </p>
      </Section>
    </>
  );
}
