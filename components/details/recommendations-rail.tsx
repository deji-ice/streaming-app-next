import { PosterCard } from "@/components/ds/poster-card";
import { Rail } from "@/components/ds/rail";
import { mediaHref } from "@/lib/slug";
import type { CardDTO } from "@/lib/tmdb/types";

/** "More like this": TMDB recommendations (similar titles when there are none), as a poster rail. */
export function RecommendationsRail({ items }: { items: readonly CardDTO[] }) {
  if (items.length === 0) return null;

  return (
    <Rail title="More like this" variant="poster">
      {items.map((item) => (
        <PosterCard
          key={`${item.mediaType}-${item.id}`}
          href={mediaHref(item.mediaType, item.id, item.title)}
          title={item.title}
          posterPath={item.posterPath}
          year={item.year}
          rating={item.rating}
        />
      ))}
    </Rail>
  );
}
