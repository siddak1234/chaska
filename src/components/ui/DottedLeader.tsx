/**
 * The dotted rule that carries the eye from a dish name to its price.
 *
 * Purely decorative, and `aria-hidden` because the artboards' bare `<span>`
 * is announced as an empty element between the name and the price.
 * `translate-y-[-4px]` matches the artboards' optical alignment against the
 * Caslon baseline.
 */
export function DottedLeader() {
  return (
    <span
      aria-hidden="true"
      className="flex-1 -translate-y-1 border-b border-dotted border-leader"
    />
  );
}
