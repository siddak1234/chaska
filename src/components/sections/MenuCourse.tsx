import { Heading } from "@/components/ui/Heading";
import { Kicker } from "@/components/ui/Kicker";
import type { MenuCourse as MenuCourseData } from "@/content/schema";

import { MenuRow } from "./MenuRow";

type MenuCourseProps = {
  course: MenuCourseData;
  /** The breads and desserts courses sit two-up, so their heading is smaller. */
  compact?: boolean;
};

/**
 * A titled course: Punjabi name in Caslon, English gloss as an oxblood kicker,
 * then the dishes as a description list.
 */
export function MenuCourse({ course, compact = false }: MenuCourseProps) {
  const headingId = `course-${course.id}`;
  const isGrid = course.layout === "grid";

  return (
    <>
      <div className={compact ? "mb-7 text-center" : "mb-8 text-center"}>
        <Heading level={2} size={compact ? "courseSm" : "course"} id={headingId}>
          {course.name}
        </Heading>
        <Kicker size="sm" className="mt-2">
          {course.englishName}
        </Kicker>
      </div>

      <dl
        aria-labelledby={headingId}
        className={
          isGrid
            ? "grid auto-grid-300 gap-x-gap-menu gap-y-[26px]"
            : "flex flex-col gap-4"
        }
      >
        {course.items.map((item) => (
          <MenuRow key={item.id} item={item} size={isGrid ? "lg" : "sm"} />
        ))}
      </dl>
    </>
  );
}
