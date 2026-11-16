"use client";

import { SortAscendingIcon } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useOptimistic, useTransition } from "react";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

import { catalogHref, DEFAULT_SORT, type CatalogQuery, type SortOption } from "./params";

export interface SortSelectProps {
  options: readonly SortOption[];
  /** The sort the page was rendered with (one of the option values). */
  value: string;
  /** Path of the page, for example /movie. */
  basePath: string;
  /** Every other param the page keeps (genres, type). `page` is dropped on purpose. */
  query: CatalogQuery;
  /** Accessible name. */
  label?: string;
  className?: string;
}

/**
 * Sort pill. Picking an option navigates to the same page with the new
 * ?sort and without ?page (a new order starts on page 1). The new choice
 * shows at once; the page content follows when the server answers.
 */
export function SortSelect({ options, value, basePath, query, label = "Sort by", className }: SortSelectProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [shown, setShown] = useOptimistic(value);
  const current = options.find((option) => option.value === shown) ?? options[0];

  return (
    <Select
      value={current.value}
      onValueChange={(next) => {
        if (next === value) return;
        startTransition(() => {
          setShown(next);
          router.push(catalogHref(basePath, { ...query, sort: next === DEFAULT_SORT ? undefined : next }));
        });
      }}
    >
      <SelectTrigger
        aria-label={label}
        aria-busy={pending}
        className={cn("w-full justify-start gap-2 sm:w-52 md:h-9", pending && "opacity-70", className)}
      >
        <SortAscendingIcon size={16} aria-hidden="true" className="shrink-0 text-muted-foreground" />
        <SelectValue className="flex-1 text-left">{current.label}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
