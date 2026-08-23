import { CateringPackages } from "@/components/sections/CateringPackages";
import { MenuCourse } from "@/components/sections/MenuCourse";
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

  const [shuruaat, mains, breads, sweets] = menu.courses;

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

      {shuruaat ? (
        <Section rule="double" pad="sm">
          <MenuCourse course={shuruaat} />
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

      {mains ? (
        <Section rule="solid" pad="sm">
          <MenuCourse course={mains} />
        </Section>
      ) : null}

      <Section rule="solid" pad="sm">
        <div className="grid auto-grid-280 gap-x-gap-menu gap-y-10">
          {breads ? (
            <div>
              <MenuCourse course={breads} compact />
            </div>
          ) : null}
          {sweets ? (
            <div>
              <MenuCourse course={sweets} compact />
            </div>
          ) : null}
        </div>
      </Section>

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
