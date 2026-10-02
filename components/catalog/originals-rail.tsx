import { PosterCard } from "@/components/ds/poster-card";
import { Rail } from "@/components/ds/rail";
import { mediaHref } from "@/lib/slug";
import { getProviderOriginals } from "@/lib/tmdb";
import type { CuratedProvider } from "@/lib/tmdb/providers";

/**
 * "{Provider} originals": the service's own series (discover/tv with the
 * provider's network ids). Dropped, not fatal, when the call fails or returns
 * nothing, as for every rail.
 */
export async function OriginalsRail({ provider }: { provider: CuratedProvider }) {
  const originals = await getProviderOriginals(provider).catch(() => null);
  const items = originals?.results ?? [];
  if (items.length === 0) return null;

  return (
    <Rail title={`${provider.name} originals`}>
      {items.map((card) => (
        <PosterCard
          key={`${card.mediaType}-${card.id}`}
          href={mediaHref(card.mediaType, card.id, card.title)}
          title={card.title}
          posterPath={card.posterPath}
          year={card.year}
          rating={card.rating}
        />
      ))}
    </Rail>
  );
}
