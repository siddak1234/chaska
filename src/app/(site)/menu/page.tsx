import { CateringPackages } from "@/components/sections/CateringPackages";
import { MenuCourse } from "@/components/sections/MenuCourse";
import { MenuIndex } from "@/components/sections/MenuIndex";
import { PageHeader } from "@/components/sections/PageHeader";
import { PhotoStrip } from "@/components/sections/PhotoStrip";
import { Kicker } from "@/components/ui/Kicker";
import { Section } from "@/components/ui/Section";
import { getCatering, getMenu, getSignatureBands, getSite } from "@/content";
import { instagramUrl } from "@/lib/format";
import { JsonLd, menuJsonLd } from "@/lib/jsonld";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Menu",
  description:
    "Chaska's signature dishes and full menu: Punjabi home cooking with a few Indo-fusion dishes, made to order for pickup in Frisco, Texas, plus catering trays and high tea spreads.",
  path: "/menu",
});

const SIGNATURE_ID = "signature";
const FULL_MENU_ID = "full-menu";

export default function MenuPage() {
  const menu = getMenu();
  const bands = getSignatureBands();
  const catering = getCatering();
  const site = getSite();

  /**
   * Courses are grouped by their own layout rather than read off fixed
   * positions. An earlier version destructured `menu.courses` by index, so
   * adding a course silently dropped it from the page.
   */
  const wide = menu.courses.filter((course) => course.layout !== "stack");
  const narrow = menu.courses.filter((course) => course.layout === "stack");
  const signatureCount = bands
    .flatMap((band) => band.courses)
    .reduce((sum, course) => sum + course.items.length, 0);

  return (
    <>
      <PageHeader
        kicker={menu.kicker}
        title={
          <>
            {menu.title}{" "}
            <span lang="pa" className="font-gurmukhi text-[0.62em] text-oxblood">
              {menu.titleGurmukhi}
            </span>
          </>
        }
        intro={menu.intro}
        measure="menu"
        headingSize="title"
      />

      <MenuIndex
        title="Contents"
        entries={[
          { id: SIGNATURE_ID, name: menu.signature.title, count: signatureCount },
          ...menu.courses.map((course) => ({
            id: `course-${course.id}`,
            name: course.name,
            count: course.items.length,
          })),
        ]}
      />

      {/*
        The design's photographed dishes, band by band: one course, or two
        set side by side, then a strip of three photographs. They sit under a
        heading of their own because two of the design's course names —
        Shuruaat and Ghar di Rasoi — are also courses in the full menu below,
        which gets a heading of its own for the same reason.
      */}
      <Section
        id={SIGNATURE_ID}
        rule="double"
        pad="sm"
        aria-labelledby="signature-heading"
        className="pb-0"
      >
        <Kicker
          as="h2"
          size="sm"
          id="signature-heading"
          className="mb-sec-sm text-center"
        >
          {menu.signature.title}
        </Kicker>
        {bands.map((band, index) => (
          <div key={band.courses[0]?.id ?? index}>
            <div
              className={index === 0 ? "pb-sec-sm" : "border-t border-ink py-sec-sm"}
            >
              {band.courses.length > 1 ? (
                <div className="grid auto-grid-280 gap-x-gap-menu gap-y-10">
                  {band.courses.map((course) => (
                    <div key={course.id}>
                      <MenuCourse course={course} compact headingLevel={3} />
                    </div>
                  ))}
                </div>
              ) : (
                band.courses.map((course) => (
                  <MenuCourse key={course.id} course={course} headingLevel={3} />
                ))
              )}
            </div>
            <div className="border-t border-ink py-sec-xs">
              <PhotoStrip figures={band.photoStrip} />
            </div>
          </div>
        ))}
      </Section>

      {wide.map((course, index) => (
        <Section
          key={course.id}
          id={index === 0 ? FULL_MENU_ID : undefined}
          rule={index === 0 ? "double" : "solid"}
          pad="sm"
        >
          {index === 0 ? (
            <Kicker as="h2" size="sm" className="mb-sec-sm text-center">
              {menu.fullMenuTitle}
            </Kicker>
          ) : null}
          <MenuCourse course={course} headingLevel={3} />
        </Section>
      ))}

      {narrow.length > 0 ? (
        <Section rule="solid" pad="sm">
          <div className="grid auto-grid-280 gap-x-gap-menu gap-y-10">
            {narrow.map((course) => (
              <div key={course.id}>
                <MenuCourse course={course} compact headingLevel={3} />
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      <Section
        id="catering"
        rule="double"
        pad="catering"
        aria-labelledby="catering-heading"
      >
        <CateringPackages
          catering={catering}
          cta={{ label: catering.ctaLabel, href: instagramUrl(site.social.instagram) }}
        />
      </Section>

      <JsonLd data={menuJsonLd()} />
    </>
  );
}
