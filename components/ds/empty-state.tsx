import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  /**
   * A Phosphor icon, ideally `<Icon size={40} weight="duotone" />` (the
   * wrapper forces 40px and the subtle color either way).
   */
  icon: ReactNode;
  title: string;
  body?: string;
  /** A button or link, for example "Clear filters". */
  action?: ReactNode;
  className?: string;
  /** Heading level of the title. Defaults to h2; use h3 inside an h2 section. */
  as?: "h2" | "h3" | "p";
}

/** Left-aligned empty or no-results state inside its container. Server-safe. */
export function EmptyState({ icon, title, body, action, className, as = "h2" }: EmptyStateProps) {
  const Title = as;

  return (
    <div
      className={cn(
        "flex flex-col items-start gap-3 rounded-panel border border-border bg-card p-6 sm:p-8",
        className,
      )}
    >
      <span aria-hidden="true" className="text-subtle-foreground [&>svg]:size-10">
        {icon}
      </span>
      <div className="space-y-1">
        <Title className="text-lg font-semibold leading-snug text-foreground">{title}</Title>
        {body ? <p className="max-w-[65ch] text-sm text-muted-foreground">{body}</p> : null}
      </div>
      {action ? <div className="mt-1 flex flex-wrap items-center gap-3">{action}</div> : null}
    </div>
  );
}
