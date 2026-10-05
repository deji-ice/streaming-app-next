"use client";

import { GlobeHemisphereWestIcon } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useId, useOptimistic, useTransition } from "react";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

import { catalogHref, type CatalogQuery } from "./params";

export interface RegionOption {
  code: string;
  name: string;
}

export interface RegionSelectProps {
  /** Regions TMDB has streaming data for. Must contain `value`. */
  regions: readonly RegionOption[];
  /** ISO 3166-1 code the page was rendered with. */
  value: string;
  /** Path of the page, for example /browse/netflix. */
  basePath: string;
  /** Every other param the page keeps (type, sort, genres). `page` is dropped on purpose. */
  query: CatalogQuery;
  /** Text before the picker, so it reads "Streaming in United States". */
  label?: string;
  className?: string;
}

/**
 * Region picker for provider pages: "Streaming in [United States]". Picking a
 * region navigates to the same page with ?region=XX and without ?page.
 * A native-feeling list of about 140 names: arrow keys and typing jump to a
 * country.
 */
export function RegionSelect({
  regions,
  value,
  basePath,
  query,
  label = "Streaming in",
  className,
}: RegionSelectProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [shown, setShown] = useOptimistic(value);
  const labelId = useId();
  const triggerId = useId();
  const currentName = regions.find((region) => region.code === shown)?.name ?? shown;

  return (
    <div className={cn("flex min-w-0 max-w-full items-center gap-3", className)}>
      <span id={labelId} className="shrink-0 text-sm text-muted-foreground">
        {label}
      </span>
      <Select
        value={shown}
        onValueChange={(next) => {
          if (next === value) return;
          startTransition(() => {
            setShown(next);
            router.push(catalogHref(basePath, { ...query, region: next }));
          });
        }}
      >
        <SelectTrigger
          id={triggerId}
          aria-labelledby={`${labelId} ${triggerId}`}
          aria-busy={pending}
          className={cn("w-auto min-w-0 gap-2 md:h-9", pending && "opacity-70")}
        >
          <GlobeHemisphereWestIcon size={16} aria-hidden="true" className="shrink-0 text-muted-foreground" />
          <SelectValue className="text-left">{currentName}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {regions.map((region) => (
            <SelectItem key={region.code} value={region.code}>
              {region.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
