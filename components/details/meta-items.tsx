import type { ReactNode } from "react";

import { focusRing } from "@/components/ds/classes";
import { IntentLink } from "@/components/ds/intent-link";
import { cn } from "@/lib/utils";

/**
 * Items for the MetaRow in the title header.
 *
 * MetaLink is a text link with a 44px tap target that does not grow the row:
 * the vertical padding is cancelled by a negative margin, so the line keeps
 * its height while the hit area extends above and below the text.
 */
export function MetaLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <IntentLink
      href={href}
      className={cn(
        "relative -mx-1.5 -my-3 inline-flex items-center rounded-full px-1.5 py-3 transition-colors duration-150 ease-out [@media(hover:hover)]:hover:text-primary",
        focusRing,
      )}
    >
      {children}
    </IntentLink>
  );
}

/** US certification or content rating (PG-13, TV-MA) in a 1px pill. */
export function RatingPill({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full border border-input px-2.5 py-px text-[13px] font-medium leading-5 text-foreground">
      <span className="sr-only">Rated </span>
      {children}
    </span>
  );
}
