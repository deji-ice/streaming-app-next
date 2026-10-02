/**
 * Shapes PersonDTO credits for the person page.
 *
 * - buildFilmography: per-department, year-grouped rows with only the fields
 *   the client list renders (no whole DTOs cross to the client).
 * - railCredits: drops credits that are not work (thank-you lines) from the
 *   Upcoming, Latest and Known for rails.
 *
 * Pure functions, no server-only imports. "today" is passed in (the page uses
 * the same isoDay(0) as the data layer) so server output never depends on a
 * clock read inside this module.
 */

import { formatDate } from "@/lib/format";
import { slugify } from "@/lib/slug";
import type { PersonCreditDTO, PersonCreditGroupDTO } from "@/lib/tmdb/types";

/* ------------------------------------------------------------------------ */
/* Types shared with the client list                                         */
/* ------------------------------------------------------------------------ */

export interface FilmographyRow {
  /** `${type}:${id}` (unique inside one department). */
  key: string;
  id: number;
  type: "movie" | "tv";
  title: string;
  posterPath: string | null;
  /** Character or job(s). */
  role: string | null;
  /** TV only, total episodes of the run. */
  episodes: number | null;
  /** Upcoming rows only: "Dec 15, 2026" or "Announced". */
  dateLabel: string | null;
}

export interface FilmographyGroup {
  /** Unique inside one department: "upcoming" or "y-2024". */
  id: string;
  /** "Upcoming" or the year. */
  label: string;
  rows: FilmographyRow[];
}

export interface FilmographyDepartment {
  /** Safe for DOM ids: "directing", "costume-make-up". */
  id: string;
  label: string;
  /** Credits in this department. */
  count: number;
  groups: FilmographyGroup[];
}

/* ------------------------------------------------------------------------ */
/* Filmography                                                               */
/* ------------------------------------------------------------------------ */

/** A credit with no date, or a date after today, has not been released yet. */
export function isUpcoming(credit: Pick<PersonCreditDTO, "releaseDate">, today: string): boolean {
  return !credit.releaseDate || credit.releaseDate > today;
}

/** "Dec 15, 2026" for a dated credit, "Announced" when TMDB has no date yet. */
export function releaseLabel(credit: Pick<PersonCreditDTO, "releaseDate">): string {
  return formatDate(credit.releaseDate) ?? "Announced";
}

const byPopularity = (a: PersonCreditDTO, b: PersonCreditDTO) => (b.popularity ?? 0) - (a.popularity ?? 0);

function toRow(credit: PersonCreditDTO, dateLabel: string | null): FilmographyRow {
  return {
    key: `${credit.mediaType}:${credit.id}`,
    id: credit.id,
    type: credit.mediaType,
    title: credit.title,
    posterPath: credit.posterPath,
    role: credit.role,
    episodes: credit.mediaType === "tv" && credit.episodeCount ? credit.episodeCount : null,
    dateLabel,
  };
}

function groupDepartment(credits: PersonCreditDTO[], today: string): FilmographyGroup[] {
  // Dated future credits soonest first, then announced credits by popularity.
  const upcoming = credits.filter((credit) => isUpcoming(credit, today));
  const dated = upcoming
    .filter((credit) => credit.releaseDate)
    .sort((a, b) => a.releaseDate!.localeCompare(b.releaseDate!) || byPopularity(a, b));
  const undated = upcoming.filter((credit) => !credit.releaseDate).sort(byPopularity);

  const groups: FilmographyGroup[] = [];
  if (upcoming.length > 0) {
    groups.push({
      id: "upcoming",
      label: "Upcoming",
      rows: [...dated, ...undated].map((credit) => toRow(credit, releaseLabel(credit))),
    });
  }

  // Released credits: year groups, newest year first, newest release first inside a year.
  const released = credits
    .filter((credit) => !isUpcoming(credit, today))
    .sort((a, b) => b.releaseDate!.localeCompare(a.releaseDate!) || byPopularity(a, b));
  const byYear = new Map<string, PersonCreditDTO[]>();
  for (const credit of released) {
    const year = credit.releaseDate!.slice(0, 4);
    const list = byYear.get(year);
    if (list) list.push(credit);
    else byYear.set(year, [credit]);
  }
  for (const [year, list] of byYear) {
    groups.push({ id: `y-${year}`, label: year, rows: list.map((credit) => toRow(credit, null)) });
  }
  return groups;
}

/**
 * One entry per department that has credits. The person's own department comes
 * first (a director opens on Directing), the rest keep the data layer's order
 * (Acting, then by size).
 */
export function buildFilmography(
  groups: PersonCreditGroupDTO[],
  options: { today: string; primaryDepartment: string | null },
): FilmographyDepartment[] {
  const { today, primaryDepartment } = options;
  const rank = (department: string) => (department === primaryDepartment ? 0 : 1);
  const usedIds = new Set<string>();

  return groups
    .filter((group) => group.credits.length > 0)
    .map((group, index) => ({ group, index }))
    .sort((a, b) => rank(a.group.department) - rank(b.group.department) || a.index - b.index)
    .map(({ group }, position) => {
      // Tab values become DOM ids, so they must be unique and free of spaces.
      let id = slugify(group.department) || "credits";
      if (usedIds.has(id)) id = `${id}-${position}`;
      usedIds.add(id);
      return {
        id,
        label: group.department,
        count: group.credits.length,
        groups: groupDepartment(group.credits, today),
      };
    });
}

/** Distinct movies and series across all departments. */
export function countTitles(groups: PersonCreditGroupDTO[]): number {
  const seen = new Set<string>();
  for (const group of groups) {
    for (const credit of group.credits) seen.add(`${credit.mediaType}:${credit.id}`);
  }
  return seen.size;
}

/* ------------------------------------------------------------------------ */
/* Rails                                                                     */
/* ------------------------------------------------------------------------ */

/** Crew "Thanks" lines are acknowledgements, not work, so they stay out of the rails. */
const THANKS = /^(?:special )?thanks$/i;

/** Credits fit for a rail. The full filmography still lists everything. */
export function railCredits(credits: PersonCreditDTO[]): PersonCreditDTO[] {
  return credits.filter((credit) => !(credit.role && THANKS.test(credit.role.trim())));
}
