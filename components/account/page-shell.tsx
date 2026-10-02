import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Id of the page h1. Focus moves here when the item that had focus is removed. */
export const PAGE_TITLE_ID = "page-title";

export interface AccountPageProps {
  title: string;
  /** One line under the title. Rendered in a fixed 24px line box so a skeleton can reserve it. */
  description?: ReactNode;
  /** Controls aligned to the right of the title (wraps below it on small screens). */
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
}

/**
 * Page wrapper for the signed-in pages: text-width container (the nav is
 * sticky, so only a modest top padding), the single h1 and an optional
 * description and action row. No hooks, so loading.tsx files can use it too.
 */
export function AccountPage({ title, description, actions, children, className }: AccountPageProps) {
  return (
    <div className={cn("mx-auto w-full max-w-[1440px] px-gutter pb-16 pt-8", className)}>
      <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <div className="min-w-0">
          <h1
            id={PAGE_TITLE_ID}
            tabIndex={-1}
            className="type-display-md text-foreground focus:outline-none"
          >
            {title}
          </h1>
          {description ? (
            <div className="mt-2 flex min-h-6 items-center text-sm leading-6 text-muted-foreground md:text-base md:leading-6">
              {description}
            </div>
          ) : null}
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap items-center gap-3">{actions}</div> : null}
      </header>
      {children}
    </div>
  );
}
