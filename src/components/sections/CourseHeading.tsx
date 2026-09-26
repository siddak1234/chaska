import { Heading } from "@/components/ui/Heading";
import { Kicker } from "@/components/ui/Kicker";
import { cn } from "@/lib/cn";

type CourseHeadingProps = {
  id: string;
  /** Punjabi name, in the display face. */
  name: string;
  /** English gloss, as an oxblood kicker beneath it. */
  englishName: string;
  note?: string;
  level: 2 | 3;
  /** Courses set two-up, and the Order page's categories, use the smaller size. */
  compact?: boolean;
  className?: string;
};

/**
 * "Shuruaat / Small plates" — the course heading shared by the Menu page's
 * courses and the Order page's categories, so the two always read alike.
 */
export function CourseHeading({
  id,
  name,
  englishName,
  note,
  level,
  compact = false,
  className,
}: CourseHeadingProps) {
  return (
    <div className={cn("text-center", className)}>
      <Heading level={level} size={compact ? "courseSm" : "course"} id={id}>
        {name}
      </Heading>
      <Kicker size="sm" className="mt-2">
        {englishName}
      </Kicker>
      {note ? (
        <p className="mx-auto mt-2 max-w-menu-intro text-note text-ink-muted">{note}</p>
      ) : null}
    </div>
  );
}
