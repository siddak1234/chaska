/**
 * Not present in the artboards. Keyboard users otherwise tab through the whole
 * masthead — three topbar items, the logotype and five nav links — on every
 * page before reaching content.
 */
export function SkipLink() {
  return (
    <a
      href="#main"
      className="sr-only font-ui text-label font-bold tracking-ui uppercase focus-visible:not-sr-only focus-visible:absolute focus-visible:top-4 focus-visible:left-4 focus-visible:z-50 focus-visible:bg-ink focus-visible:px-4 focus-visible:py-3 focus-visible:text-paper"
    >
      Skip to content
    </a>
  );
}
