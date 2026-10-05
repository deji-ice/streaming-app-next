import { ArrowUpRightIcon } from "@phosphor-icons/react/dist/ssr";

import { focusRing } from "@/components/ds/classes";
import { LandscapeCard } from "@/components/ds/landscape-card";
import { PosterCard } from "@/components/ds/poster-card";
import { ProviderTile } from "@/components/ds/provider-tile";
import { Rail } from "@/components/ds/rail";
import { RankedPosterCard } from "@/components/ds/ranked-card";
import { formatDate } from "@/lib/format";
import { mediaHref, providerHref } from "@/lib/slug";
import { CURATED_PROVIDERS } from "@/lib/tmdb/providers";
import type { CardDTO } from "@/lib/tmdb/types";
import { cn } from "@/lib/utils";

/*
 * Rails of the home page. Server components: they turn cached TMDB cards into
 * ds cards, so no DTO ever reaches a client component. Each one renders
 * nothing for an empty list, so a rail that failed to load is simply dropped.
 */

const JUSTWATCH_URL = "https://www.justwatch.com";

/** Poster rail (PosterCard) for movies or series. `href` adds a "See all" link. */
export function PosterRail({
  title,
  cards,
  href,
}: {
  title: string;
  cards: readonly CardDTO[];
  href?: string;
}) {
  if (cards.length === 0) return null;

  return (
    <Rail title={title} href={href} variant="poster">
      {cards.map((card) => (
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

/** Ranked rail: the cards in the order given, numbered from 1. */
export function RankedRail({ title, cards }: { title: string; cards: readonly CardDTO[] }) {
  if (cards.length === 0) return null;

  return (
    <Rail title={title} variant="ranked">
      {cards.map((card, index) => (
        <RankedPosterCard
          key={`${card.mediaType}-${card.id}`}
          rank={index + 1}
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

/** Landscape rail with the release date under each title. */
export function TheatersRail({ title, cards }: { title: string; cards: readonly CardDTO[] }) {
  if (cards.length === 0) return null;

  return (
    <Rail title={title} variant="landscape">
      {cards.map((card) => (
        <LandscapeCard
          key={`${card.mediaType}-${card.id}`}
          href={mediaHref(card.mediaType, card.id, card.title)}
          title={card.title}
          imagePath={card.backdropPath}
          subtitle={formatDate(card.releaseDate)}
        />
      ))}
    </Rail>
  );
}

/** Credit for the streaming availability data (JustWatch, via TMDB). */
function JustWatchCredit({ className }: { className?: string }) {
  return (
    <a
      href={JUSTWATCH_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex min-h-11 items-center gap-1 rounded-full px-1 text-[13px] text-subtle-foreground transition-colors duration-150 ease-out hover:text-foreground md:min-h-8",
        focusRing,
        className,
      )}
    >
      Availability data by JustWatch
      <ArrowUpRightIcon size={12} aria-hidden="true" />
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  );
}

/**
 * The curated streaming services, each linking to its /browse page. The
 * JustWatch credit sits in the header from sm up and under the rail on phones,
 * where the header has no room for it.
 */
export function StreamingServicesRail() {
  return (
    <>
      <Rail title="Streaming services" variant="logo" action={<JustWatchCredit className="max-sm:hidden" />}>
        {CURATED_PROVIDERS.map((provider) => (
          <ProviderTile
            key={provider.slug}
            href={providerHref(provider.slug)}
            name={provider.name}
            logoPath={provider.logoPath}
          />
        ))}
      </Rail>
      <p className="-mt-4 px-gutter sm:hidden">
        <JustWatchCredit />
      </p>
    </>
  );
}
