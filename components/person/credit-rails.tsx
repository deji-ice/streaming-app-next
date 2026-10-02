import { Rail } from "@/components/ds/rail";
import { mediaHref } from "@/lib/slug";
import type { PersonCreditDTO } from "@/lib/tmdb/types";

import { CreditCard } from "./credit-card";
import { railCredits, releaseLabel } from "./credits";

export interface CreditRailsProps {
  /** Dated after today (soonest first), then announced credits without a date. */
  upcoming: PersonCreditDTO[];
  /** Most recent released credits, newest first. */
  latest: PersonCreditDTO[];
  /** Best known credits. */
  knownFor: PersonCreditDTO[];
}

/**
 * Upcoming, Latest and Known for rails. Each rail renders only when it has
 * credits. Full-bleed: place it directly in the page flow (Rail adds its own
 * gutter padding).
 *
 * The wrapper is positioned and clips on the x axis on purpose: the rail
 * scroller is not positioned, so absolutely positioned screen-reader text
 * inside off-screen cards (the sr-only spans of Rating) would otherwise
 * stretch the page's scroll width by thousands of pixels.
 */
export function CreditRails({ upcoming, latest, knownFor }: CreditRailsProps) {
  const upcomingCredits = railCredits(upcoming);
  const latestCredits = railCredits(latest);
  const knownForCredits = railCredits(knownFor);

  if (upcomingCredits.length + latestCredits.length + knownForCredits.length === 0) return null;

  return (
    <div className="relative overflow-x-clip">
      {upcomingCredits.length > 0 ? (
        <Rail title="Upcoming">
          {upcomingCredits.map((credit) => (
            <CreditCard
              key={`${credit.mediaType}:${credit.id}`}
              href={mediaHref(credit.mediaType, credit.id, credit.title)}
              title={credit.title}
              posterPath={credit.posterPath}
              role={credit.role}
              isSeries={credit.mediaType === "tv"}
              dateLine={releaseLabel(credit)}
            />
          ))}
        </Rail>
      ) : null}

      {latestCredits.length > 0 ? (
        <Rail title="Latest">
          {latestCredits.map((credit) => (
            <CreditCard
              key={`${credit.mediaType}:${credit.id}`}
              href={mediaHref(credit.mediaType, credit.id, credit.title)}
              title={credit.title}
              posterPath={credit.posterPath}
              role={credit.role}
              year={credit.year}
              rating={credit.rating}
              isSeries={credit.mediaType === "tv"}
            />
          ))}
        </Rail>
      ) : null}

      {knownForCredits.length > 0 ? (
        <Rail title="Known for">
          {knownForCredits.map((credit) => (
            <CreditCard
              key={`${credit.mediaType}:${credit.id}`}
              href={mediaHref(credit.mediaType, credit.id, credit.title)}
              title={credit.title}
              posterPath={credit.posterPath}
              role={credit.role}
              year={credit.year}
              rating={credit.rating}
              isSeries={credit.mediaType === "tv"}
            />
          ))}
        </Rail>
      ) : null}
    </div>
  );
}
