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
  /** 22px — the current design's gap between described dishes in a stack. */
  stack: "flex flex-col gap-[22px]",
  columns:
    "columns-1 gap-x-gap-menu sm:columns-2 lg:columns-3 [&>div]:mb-3.5 [&>div]:break-inside-avoid",
};

const ROW_SIZE: Record<MenuCourseData["layout"], "lg" | "sm"> = {
  grid: "lg",
  stack: "sm",
  // Descriptions need the larger name size to sit against.
  columns: "lg",
};

type MenuCourseProps = {
  course: MenuCourseData;
  /** Courses set two-up have a smaller heading. */
  compact?: boolean;
  /** `3` when the course sits under a section heading of its own. */
  headingLevel?: 2 | 3;
};

/**
 * A titled course: Punjabi name in Caslon, English gloss as an oxblood kicker,
 * then the dishes as a description list.
 */
export function MenuCourse({
  course,
  compact = false,
  headingLevel = 2,
}: MenuCourseProps) {
  const headingId = `course-${course.id}`;

  return (
    <>
      <div className={compact ? "mb-7 text-center" : "mb-8 text-center"}>
        <Heading
          level={headingLevel}
          size={compact ? "courseSm" : "course"}
          id={headingId}
        >
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
