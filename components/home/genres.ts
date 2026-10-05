import type { CardDTO, GenreDTO } from "@/lib/tmdb/types";

import type { GenreTileData } from "./types";

/**
 * TMDB movie genre ids in the order the home tiles prefer them: the broad
 * genres most visitors browse by first, the rest only when one of those has
 * no backdrop to show. The names always come from TMDB's genre list.
 */
const PREFERRED_GENRE_IDS = [28, 35, 18, 27, 878, 16, 53, 10749, 12, 14, 80, 10751, 9648];

/** The grid is 2 columns on phones and 4 from md, so it shows 8 tiles, or 4 when there are fewer. */
const TILE_COUNT = 8;
const MIN_TILE_COUNT = 4;

/** Merges lists of cards, keeping the first occurrence of each id. */
export function uniqueCards(...lists: ReadonlyArray<readonly CardDTO[]>): CardDTO[] {
  const seen = new Set<number>();
  const merged: CardDTO[] = [];
  for (const list of lists) {
    for (const card of list) {
      if (seen.has(card.id)) continue;
      seen.add(card.id);
      merged.push(card);
    }
  }
  return merged;
}

/**
 * Tiles for "Browse by genre". Each tile reuses the backdrop of the first
 * movie in `pool` that belongs to the genre, and no backdrop is used twice.
 * `pool` must hold movies only (TV genre ids are a different id space).
 * Genres without a usable backdrop are skipped. Returns 8 tiles, or 4 when
 * fewer than 8 genres have one, or nothing when fewer than 4 do.
 */
export function pickGenreTiles(
  genres: readonly GenreDTO[],
  pool: readonly CardDTO[],
  limit: number = TILE_COUNT,
): GenreTileData[] {
  const names = new Map(genres.map((genre) => [genre.id, genre.name] as const));
  const order = [...PREFERRED_GENRE_IDS, ...genres.map((genre) => genre.id)];
  const triedGenres = new Set<number>();
  const usedBackdrops = new Set<string>();
  const tiles: GenreTileData[] = [];

  for (const id of order) {
    if (tiles.length >= limit) break;
    const name = names.get(id);
    if (!name || triedGenres.has(id)) continue;
    triedGenres.add(id);

    const card = pool.find(
      (candidate) =>
        candidate.mediaType === "movie" &&
        !!candidate.backdropPath &&
        !usedBackdrops.has(candidate.backdropPath) &&
        candidate.genreIds.includes(id),
    );
    if (!card?.backdropPath) continue;

    usedBackdrops.add(card.backdropPath);
    tiles.push({ id, name, backdropPath: card.backdropPath });
  }

  if (tiles.length >= TILE_COUNT) return tiles.slice(0, TILE_COUNT);
  if (tiles.length >= MIN_TILE_COUNT) return tiles.slice(0, MIN_TILE_COUNT);
  return [];
}
