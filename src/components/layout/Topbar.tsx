type TopbarProps = {
  items: readonly [string, string, string];
};

/**
 * The three-up strip above the masthead.
 *
 * The artboards set `justify-content: space-between` at every width, which on
 * a phone squeezes three letterspaced phrases into thirds and wraps each to
 * three lines. Below `sm` they stack as centred lines instead — nothing is
 * hidden, and it reads as a newspaper standfirst.
 */
export function Topbar({ items }: TopbarProps) {
  return (
    <div className="flex flex-col items-center gap-1 border-b border-ink pt-[14px] pb-[10px] text-center font-ui text-micro tracking-ui uppercase sm:flex-row sm:justify-between sm:gap-4 sm:text-start">
      <span>{items[0]}</span>
      {/* Only the middle item is centred in the artboards; the outer two are
          positioned by `justify-content: space-between` and keep start
          alignment, which matters once one of them wraps. */}
      <span className="sm:text-center">{items[1]}</span>
      <span>{items[2]}</span>
    </div>
  );
}
