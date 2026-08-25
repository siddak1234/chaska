import { Heading } from "@/components/ui/Heading";
import { Kicker } from "@/components/ui/Kicker";
import type { MenuCourse as MenuCourseData } from "@/content/schema";

import { MenuRow } from "./MenuRow";

/**
 * `columns` uses CSS multi-column rather than grid: a long alphabetically
 * meaningless list reads better flowing down each column and wrapping, and
 * multi-column balances the last row automatically. `break-inside-avoid` stops
 * a dish name splitting across the column gutter.
 */
const LIST_CLASS: Record<MenuCourseData["layout"], string> = {
  grid: "grid auto-grid-300 gap-x-gap-menu gap-y-[26px]",
  stack: "flex flex-col gap-4",
  columns:
    "columns-1 gap-x-gap-menu sm:columns-2 lg:columns-3 [&>div]:mb-3.5 [&>div]:break-inside-avoid",
};

const ROW_SIZE: Record<MenuCourseData["layout"], "lg" | "sm" | "columns"> = {
  grid: "lg",
  stack: "sm",
  // Descriptions need the larger name size to sit against.
  columns: "lg",
};

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

  return (
    <>
      <div className={compact ? "mb-7 text-center" : "mb-8 text-center"}>
        <Heading level={2} size={compact ? "courseSm" : "course"} id={headingId}>
          {course.name}
        </Heading>
        <Kicker size="sm" className="mt-2">
          {course.englishName}
        </Kicker>
        {course.note ? (
          <p className="mx-auto mt-2 max-w-menu-intro text-note text-ink-muted">
            {course.note}
          </p>
        ) : null}
      </div>

      <dl aria-labelledby={headingId} className={LIST_CLASS[course.layout]}>
        {course.items.map((item) => (
          <MenuRow key={item.id} item={item} size={ROW_SIZE[course.layout]} />
        ))}
      </dl>
    </>
  );
}
