import type { CastMember, CrewMember } from "@/components/ds/cast-crew";
import type { CastMemberDTO, CrewMemberDTO } from "@/lib/tmdb/types";

/**
 * Trims credits before they are passed to the CastCrewButton client component
 * (they travel in the RSC payload), keeping only the fields it renders.
 */

/** Departments shown in the crew tab, in display order. */
export const KEY_CREW_DEPARTMENTS = [
  "Directing",
  "Writing",
  "Production",
  "Camera",
  "Editing",
  "Sound",
  "Art",
] as const;

const CAST_LIMIT = 150;
const CREW_LIMIT = 200;

export function toCastProps(cast: readonly CastMemberDTO[]): CastMember[] {
  return cast
    .slice(0, CAST_LIMIT)
    .map(({ id, name, profilePath, character, order }) => ({ id, name, profilePath, character, order }));
}

/**
 * Crew from the key departments only, in department order. Photos are not
 * sent: the crew tab lists names and jobs without avatars.
 */
export function toCrewProps(crew: readonly CrewMemberDTO[]): CrewMember[] {
  const rank = new Map<string, number>(KEY_CREW_DEPARTMENTS.map((department, index) => [department, index]));
  return crew
    .map((member, index) => ({ member, index, rank: rank.get(member.department) }))
    .filter((entry): entry is typeof entry & { rank: number } => entry.rank !== undefined)
    .sort((a, b) => a.rank - b.rank || a.index - b.index)
    .slice(0, CREW_LIMIT)
    .map(({ member }) => ({
      id: member.id,
      name: member.name,
      profilePath: null,
      job: member.job,
      department: member.department,
    }));
}
