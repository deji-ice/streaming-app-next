import type { ReactNode } from "react";

import { focusRing } from "@/components/ds/classes";
import { IntentLink } from "@/components/ds/intent-link";
import { personHref } from "@/lib/slug";
import type { PersonRefDTO } from "@/lib/tmdb/types";
import { cn } from "@/lib/utils";

export interface FactRow {
  label: string;
  value: ReactNode;
}

/** A row for FactsList, or null when the value is empty (null, undefined, false or ""). */
export function factRow(label: string, value: ReactNode): FactRow | null {
  return value === null || value === undefined || value === false || value === "" ? null : { label, value };
}

/**
 * Label and value pairs as a description list: label column (subtle) and value
 * column. Null rows are skipped; nothing renders when no row is left.
 */
export function FactsList({ rows }: { rows: Array<FactRow | null> }) {
  const visible = rows.filter((row): row is FactRow => row !== null);
  if (visible.length === 0) return null;

  return (
    <dl className="grid grid-cols-[116px_minmax(0,1fr)] gap-x-4 gap-y-3">
      {visible.map((row) => (
        <div key={row.label} className="contents">
          <dt className="text-[13px] leading-5 text-subtle-foreground">{row.label}</dt>
          <dd className="min-w-0 text-sm leading-5 text-foreground">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * People as person links, one per line (44px tall on phones, 32px from md).
 * `showJob` adds the credited job in subtle text, for example "Screenplay".
 */
export function PeopleList({ people, showJob = false }: { people: readonly PersonRefDTO[]; showJob?: boolean }) {
  if (people.length === 0) return null;

  return (
    <ul>
      {people.map((person) => (
        <li key={person.id} className="flex flex-wrap items-center gap-x-2">
          <IntentLink
            href={personHref(person.id, person.name)}
            className={cn(
              "inline-flex min-h-11 items-center rounded-full text-foreground transition-colors duration-150 ease-out [@media(hover:hover)]:hover:text-primary md:min-h-8",
              focusRing,
            )}
          >
            {person.name}
          </IntentLink>
          {showJob && person.job ? (
            <span className="text-[13px] text-subtle-foreground">{person.job}</span>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
