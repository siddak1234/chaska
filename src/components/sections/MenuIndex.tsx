import { Kicker } from "@/components/ui/Kicker";
import type { MenuCourse } from "@/content/schema";

type MenuIndexProps = {
  courses: readonly MenuCourse[];
};

/**
 * A contents strip for the menu.
 *
 * At eighteen dishes the menu was one scroll. At eighty-six it is seven
 * screens, and a diner looking for the breads has no way to reach them. Each
 * course heading already carries an `id`, so this is a plain anchor list — no
 * JavaScript, working before hydration and with it turned off.
 */
export function MenuIndex({ courses }: MenuIndexProps) {
  if (courses.length < 2) return null;

  return (
    <nav aria-label="Menu courses" className="border-t border-rule pt-6 text-center">
      <Kicker as="h2" size="sm" className="mb-4">
        Contents
      </Kicker>
      <ul className="flex flex-wrap items-baseline justify-center gap-x-6">
        {courses.map((course) => (
          <li key={course.id}>
            <a
              href={`#course-${course.id}`}
              className="inline-block py-2 font-display text-row-sm no-underline"
            >
              {course.name}
              <span className="ml-2 font-ui text-micro leading-normal tracking-meta text-ink-muted uppercase">
                {course.items.length}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
