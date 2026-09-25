import { Kicker } from "@/components/ui/Kicker";

type MenuIndexProps = {
  title: string;
  /** Each entry jumps to an element id on the page. */
  entries: ReadonlyArray<{ id: string; name: string; count: number }>;
};

/**
 * A contents strip for the menu.
 *
 * At eighty-six dishes the full menu is seven screens, below the photographed
 * dishes, and a diner looking for the breads has no other way to reach them.
 * Each entry is a plain anchor — no JavaScript, working before hydration and
 * with it turned off.
 */
export function MenuIndex({ title, entries }: MenuIndexProps) {
  if (entries.length < 2) return null;

  return (
    <nav aria-label="Menu courses" className="border-t border-rule pt-6 text-center">
      <Kicker as="h2" size="sm" className="mb-4">
        {title}
      </Kicker>
      <ul className="flex flex-wrap items-baseline justify-center gap-x-6">
        {entries.map((entry) => (
          <li key={entry.id}>
            <a
              href={`#${entry.id}`}
              className="inline-block py-2 font-display text-row-sm no-underline"
            >
              {entry.name}
              <span className="ml-2 font-ui text-micro leading-normal tracking-meta text-ink-muted uppercase">
                {entry.count}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
