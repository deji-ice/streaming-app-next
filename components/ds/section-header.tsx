import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface SectionHeaderProps {
  /** Heading id, so the section can use aria-labelledby. */
  id?: string;
  title: ReactNode;
  description?: ReactNode;
  /** Optional control aligned to the right (a link, a button, a credit line). */
  action?: ReactNode;
  as?: "h2" | "h3";
  className?: string;
}

/** Section heading row: h2.type-section (or a smaller h3) + optional description and action. Server-safe. */
export function SectionHeader({ id, title, description, action, as = "h2", className }: SectionHeaderProps) {
  const Heading = as;

  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-x-4 gap-y-2", className)}>
      <div className="min-w-0">
        <Heading
          id={id}
          className={
            as === "h2"
              ? "type-section text-foreground"
              : "font-display text-lg font-semibold leading-tight text-foreground"
          }
        >
          {title}
        </Heading>
        {description ? (
          <p className="mt-1 max-w-[65ch] text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action ? <div className="flex shrink-0 items-center gap-2">{action}</div> : null}
    </div>
  );
}
