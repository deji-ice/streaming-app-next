"use client";

import { FilmSlateIcon, TelevisionIcon } from "@phosphor-icons/react";
import Image from "next/image";
import { useCallback, useEffect, useId, useRef, useState } from "react";

import { focusRing, hoverTitle, pillBase, pillVariants } from "@/components/ds/classes";
import { IntentLink } from "@/components/ds/intent-link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mediaHref } from "@/lib/slug";
import { tmdbImage } from "@/lib/tmdb-image";
import { cn } from "@/lib/utils";

import type { FilmographyDepartment, FilmographyGroup, FilmographyRow } from "./credits";

/** Rows shown per department before "Show all". Keeps the HTML and DOM small for prolific careers. */
const INITIAL_ROWS = 40;

export interface FilmographyProps {
  departments: FilmographyDepartment[];
  className?: string;
}

/** The first `limit` rows across groups. The last group may be cut short. */
function takeRows(groups: FilmographyGroup[], limit: number): { groups: FilmographyGroup[]; shown: number } {
  const out: FilmographyGroup[] = [];
  let shown = 0;
  for (const group of groups) {
    if (shown >= limit) break;
    const room = limit - shown;
    if (group.rows.length <= room) {
      out.push(group);
      shown += group.rows.length;
    } else {
      out.push({ ...group, rows: group.rows.slice(0, room) });
      shown += room;
    }
  }
  return { groups: out, shown };
}

function Thumb({ row }: { row: FilmographyRow }) {
  const src = tmdbImage(row.posterPath);
  const Fallback = row.type === "tv" ? TelevisionIcon : FilmSlateIcon;

  return (
    <span className="relative flex h-[60px] w-10 shrink-0 items-center justify-center overflow-hidden rounded-media bg-muted text-subtle-foreground">
      {src ? (
        <Image src={src} alt="" width={40} height={60} className="h-full w-full object-cover" />
      ) : (
        <Fallback size={16} aria-hidden="true" />
      )}
    </span>
  );
}

function CreditRow({ row, index }: { row: FilmographyRow; index: number }) {
  const episodes = row.episodes ? `${row.episodes} ${row.episodes === 1 ? "episode" : "episodes"}` : null;

  return (
    <li data-row-index={index}>
      <IntentLink
        href={mediaHref(row.type, row.id, row.title)}
        className={cn(
          "group -mx-2 grid grid-cols-[40px_minmax(0,1fr)] items-center gap-x-3 rounded-media px-2 py-1.5 transition-colors duration-150 ease-out [@media(hover:hover)]:hover:bg-accent md:grid-cols-[40px_minmax(0,1.25fr)_minmax(0,1fr)] md:gap-x-5",
          focusRing,
        )}
      >
        <Thumb row={row} />
        {/* One block on phones (title over details); two grid cells from md. */}
        <span className="block min-w-0 md:contents">
          <span className="flex min-w-0 items-start gap-2">
            <span className={cn("line-clamp-2 min-w-0 text-sm font-medium leading-5 text-foreground", hoverTitle)}>
              {row.title}
            </span>
            <span className="inline-flex h-5 shrink-0 items-center rounded-full border border-border px-2 text-xs font-medium text-subtle-foreground">
              {row.type === "tv" ? "Series" : "Movie"}
            </span>
          </span>
          <span className="block min-w-0">
            {row.role ? (
              <span className="line-clamp-1 text-[13px] leading-[18px] text-muted-foreground md:line-clamp-2">
                {row.role}
              </span>
            ) : null}
            {episodes || row.dateLabel ? (
              <span className="flex flex-wrap gap-x-3 text-[13px] leading-[18px] text-subtle-foreground tabular-nums">
                {episodes ? <span>{episodes}</span> : null}
                {row.dateLabel ? <span>{row.dateLabel}</span> : null}
              </span>
            ) : null}
          </span>
        </span>
      </IntentLink>
    </li>
  );
}

function DepartmentList({
  department,
  expanded,
  onExpand,
}: {
  department: FilmographyDepartment;
  expanded: boolean;
  onExpand: () => void;
}) {
  const baseId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const focusIndex = useRef<number | null>(null);

  const { groups, shown } = takeRows(department.groups, expanded ? Number.POSITIVE_INFINITY : INITIAL_ROWS);
  const total = department.groups.reduce((sum, group) => sum + group.rows.length, 0);

  // After "Show all", move focus to the first row that was not visible before.
  useEffect(() => {
    if (!expanded || focusIndex.current === null) return;
    const target = containerRef.current?.querySelector<HTMLElement>(`[data-row-index="${focusIndex.current}"] a`);
    focusIndex.current = null;
    target?.focus();
  }, [expanded]);

  const expand = useCallback(() => {
    focusIndex.current = shown;
    onExpand();
  }, [onExpand, shown]);

  let offset = 0;
  return (
    <div ref={containerRef} className="max-w-4xl">
      {groups.map((group) => {
        const headingId = `${baseId}-${department.id}-${group.id}`;
        const start = offset;
        offset += group.rows.length;
        return (
          <section
            key={group.id}
            aria-labelledby={headingId}
            className="border-t border-border py-3 first:border-t-0 first:pt-0 sm:grid sm:grid-cols-[5rem_minmax(0,1fr)] sm:gap-x-4"
          >
            <h3
              id={headingId}
              className="pb-1 text-sm font-semibold leading-5 tabular-nums text-subtle-foreground sm:flex sm:h-[72px] sm:items-center sm:pb-0"
            >
              {group.label}
            </h3>
            <ul>
              {group.rows.map((row, rowIndex) => (
                <CreditRow key={row.key} row={row} index={start + rowIndex} />
              ))}
            </ul>
          </section>
        );
      })}

      {shown < total ? (
        <div className="border-t border-border pt-4">
          <button type="button" onClick={expand} className={cn(pillBase, pillVariants.secondary, focusRing)}>
            Show all {total} credits
          </button>
        </div>
      ) : null}
    </div>
  );
}

/**
 * Filmography: one tab per department (the person's own department first),
 * credits grouped by year, newest first, with an Upcoming group on top. Rows
 * link to the title. Server builds the groups (see buildFilmography); this
 * leaf only switches tabs and reveals the rest of a long list.
 */
export function Filmography({ departments, className }: FilmographyProps) {
  const [expandedIds, setExpandedIds] = useState<ReadonlySet<string>>(() => new Set());

  const expandDepartment = useCallback((id: string) => {
    setExpandedIds((current) => new Set(current).add(id));
  }, []);

  if (departments.length === 0) return null;

  if (departments.length === 1) {
    const [only] = departments;
    return (
      <div className={className}>
        <DepartmentList
          department={only}
          expanded={expandedIds.has(only.id)}
          onExpand={() => expandDepartment(only.id)}
        />
      </div>
    );
  }

  return (
    <Tabs defaultValue={departments[0].id} className={className}>
      <TabsList aria-label="Credits by department">
        {departments.map((department) => (
          <TabsTrigger key={department.id} value={department.id}>
            {department.label}
            <span className="tabular-nums">({department.count})</span>
          </TabsTrigger>
        ))}
      </TabsList>
      {departments.map((department) => (
        <TabsContent key={department.id} value={department.id} className="mt-5 md:mt-6">
          <DepartmentList
            department={department}
            expanded={expandedIds.has(department.id)}
            onExpand={() => expandDepartment(department.id)}
          />
        </TabsContent>
      ))}
    </Tabs>
  );
}
