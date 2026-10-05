import { posterGridClass } from "@/components/ds/classes";
import { PosterCard } from "@/components/ds/poster-card";
import { mediaHref } from "@/lib/slug";
import type { CardDTO } from "@/lib/tmdb/types";

export interface CatalogGridProps {
  items: ReadonlyArray<Pick<CardDTO, "id" | "mediaType" | "title" | "posterPath" | "year" | "rating">>;
  /** Accessible name of the list, for example "Movies". */
  label?: string;
  /** How many of the first posters load eagerly. Use 1 only when the grid is in the first screen. */
  priorityCount?: number;
}

/**
 * Poster grid for listing pages: PosterCard width="fill", 2 columns on phones
 * up to 7 at 2xl, gap-x-3 gap-y-6. Server-safe: only picked fields reach the
 * cards, and the cards' links are the only client code.
 */
export function CatalogGrid({ items, label, priorityCount = 0 }: CatalogGridProps) {
  return (
    <ul role="list" aria-label={label} className={posterGridClass}>
      {items.map((item, index) => (
        <li key={`${item.mediaType}-${item.id}`}>
          <PosterCard
            href={mediaHref(item.mediaType, item.id, item.title)}
            title={item.title}
            posterPath={item.posterPath}
            year={item.year}
            rating={item.rating}
            width="fill"
            priority={index < priorityCount}
          />
        </li>
      ))}
    </ul>
  );
}
