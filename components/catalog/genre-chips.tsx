import Link from "next/link";
import { CheckIcon, XIcon } from "@phosphor-icons/react/dist/ssr";

import { cn } from "@/lib/utils";
import type { GenreDTO } from "@/lib/tmdb/types";

import { MAX_GENRES, catalogHref, toggleGenre, type CatalogQuery } from "./params";
import { chipBase, chipDisabled, chipOff, chipOn, chipScroller } from "./styles";
import { ToggleLink } from "./toggle-link";

export interface GenreChipsProps {
  /** Genres of ONE media type (movie and TV ids differ). */
  genres: readonly GenreDTO[];
  /** Selected genre ids. */
  selected: readonly number[];
  /** Path of the page, for example /movie. */
  basePath: string;
  /** Every other param the page keeps (sort, type). `page` is dropped on purpose. */
  query: CatalogQuery;
  className?: string;
}

/**
 * Genre filter: one toggle per genre, each a link to the same page with that
 * genre added to or removed from ?genres=28,12 (page resets to 1). Selected
 * chips are pressed (aria-pressed), filled and show a check, so state never
 * depends on color alone. Selected genres are AND-ed. Below md the row
 * scrolls sideways; from md it wraps.
 */
export function GenreChips({ genres, selected, basePath, query, className }: GenreChipsProps) {
  if (genres.length === 0) return null;

  const atLimit = selected.length >= MAX_GENRES;
  const hrefWith = (ids: readonly number[]) =>
    catalogHref(basePath, { ...query, genres: ids.length > 0 ? ids.join(",") : undefined });

  return (
    <div className={cn(chipScroller, className)}>
      <ul aria-label="Genres" role="list" className="flex w-max gap-2 md:w-auto md:flex-wrap">
        {selected.length > 0 ? (
          <li>
            <Link
              href={hrefWith([])}
              prefetch={false}
              aria-label="Clear genre filters"
              className={cn(chipBase, "border-transparent text-muted-foreground hover:text-foreground")}
            >
              <XIcon size={16} aria-hidden="true" />
              Clear
            </Link>
          </li>
        ) : null}
        {genres.map((genre) => {
          const on = selected.includes(genre.id);
          // At the limit, the other genres are shown but not linked: no surprise swap, and no
          // extra URLs for crawlers to follow.
          if (!on && atLimit) {
            return (
              <li key={genre.id}>
                <span role="button" aria-pressed="false" aria-disabled="true" className={cn(chipBase, chipDisabled)}>
                  {genre.name}
                </span>
              </li>
            );
          }
          return (
            <li key={genre.id}>
              <ToggleLink
                href={hrefWith(toggleGenre(selected, genre.id))}
                pressed={on}
                className={cn(chipBase, on ? chipOn : chipOff)}
              >
                {on ? <CheckIcon size={16} aria-hidden="true" /> : null}
                {genre.name}
              </ToggleLink>
            </li>
          );
        })}
      </ul>
      {atLimit ? (
        <p className="mt-2 text-xs text-subtle-foreground">
          Up to {MAX_GENRES} genres at a time. Remove one to pick another.
        </p>
      ) : null}
    </div>
  );
}
