import { Kicker } from "@/components/ui/Kicker";

import type { ReactNode } from "react";

type PullQuoteProps = {
  text: string;
  attribution: string;
  actions: ReactNode;
};

/** The closing quotation on the About page. */
export function PullQuote({ text, attribution, actions }: PullQuoteProps) {
  return (
    <div className="text-center">
      <blockquote className="mx-auto max-w-quote font-display text-quote">
        {text}
      </blockquote>
      <Kicker as="p" className="mt-6">
        {attribution}
      </Kicker>
      <div className="mt-9 flex flex-wrap justify-center gap-3.5">{actions}</div>
    </div>
  );
}
