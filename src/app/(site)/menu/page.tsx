import { CateringPackages } from "@/components/sections/CateringPackages";
import { MenuCourse } from "@/components/sections/MenuCourse";
import { MenuIndex } from "@/components/sections/MenuIndex";
import { PageHeader } from "@/components/sections/PageHeader";
import { PhotoStrip } from "@/components/sections/PhotoStrip";
import { Section } from "@/components/ui/Section";
import { getCatering, getMenu, getSite } from "@/content";
import type { ImageId } from "@/content/generated/images";
import { JsonLd, menuJsonLd } from "@/lib/jsonld";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Menu",
  description:
    "Appetizers, mains from the home kitchen, breads from the tandoor, desserts and drinks — plus catering across Frisco and the Dallas–Fort Worth area, from ten guests to a wedding.",
  path: "/menu",
});

export default function MenuPage() {
  const menu = getMenu();
  const catering = getCatering();
  const site = getSite();

  /**
   * Courses are grouped by their own layout rather than read off fixed
   * positions. An earlier version destructured `menu.courses` by index, so
   * adding a course silently dropped it from the page — three of seven were
   * missing, and the two narrow courses rendered in the wrong slot.
   */
  const wide = menu.courses.filter((course) => course.layout !== "stack");
  const narrow = menu.courses.filter((course) => course.layout === "stack");
  const [lead, ...rest] = wide;

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

      <MenuIndex courses={menu.courses} />

      {lead ? (
        <Section rule="double" pad="sm">
          <MenuCourse course={lead} />
        </Section>
      ) : null}

      <Section rule="solid" pad="xs">
        <PhotoStrip
          figures={menu.photoStrip.map((figure) => ({
            imageId: figure.imageId as ImageId,
            caption: figure.caption,
          }))}
        />
      </Section>

      {rest.map((course) => (
        <Section key={course.id} rule="solid" pad="sm">
          <MenuCourse course={course} />
        </Section>
      ))}

      {narrow.length > 0 ? (
        <Section rule="solid" pad="sm">
          <div className="grid auto-grid-280 gap-x-gap-menu gap-y-10">
            {narrow.map((course) => (
              <div key={course.id}>
                <MenuCourse course={course} compact />
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
        <CateringPackages catering={catering} email={site.contact.email.catering} />
      </Section>

      <JsonLd data={menuJsonLd()} />
    </>
  );
}
