import { CastCrewButton } from "@/components/ds/cast-crew";
import { PersonCard } from "@/components/ds/person-card";
import { Rail } from "@/components/ds/rail";
import { personHref } from "@/lib/slug";
import type { CastMemberDTO, CrewMemberDTO } from "@/lib/tmdb/types";

import { toCastProps, toCrewProps } from "./credits";

/** How many billed cast members the rail shows; the modal has up to 150. */
const RAIL_LIMIT = 20;

export interface CastRailProps {
  /** Media title (heading of the cast and crew modal). */
  title: string;
  cast: readonly CastMemberDTO[];
  crew: readonly CrewMemberDTO[];
}

/**
 * Full-bleed rail of the top billed cast (role = character), with the
 * "Full cast & crew" modal as its header action. Renders nothing without cast.
 */
export function CastRail({ title, cast, crew }: CastRailProps) {
  const billed = cast.slice(0, RAIL_LIMIT);
  if (billed.length === 0) return null;

  return (
    <Rail
      title="Cast"
      variant="person"
      action={<CastCrewButton title={title} cast={toCastProps(cast)} crew={toCrewProps(crew)} />}
    >
      {billed.map((member, index) => (
        <PersonCard
          key={`${member.id}-${index}`}
          href={personHref(member.id, member.name)}
          name={member.name}
          profilePath={member.profilePath}
          role={member.character}
        />
      ))}
    </Rail>
  );
}
