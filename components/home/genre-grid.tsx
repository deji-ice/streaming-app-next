import { GenreTile } from "@/components/ds/genre-tile";
import { SectionHeader } from "@/components/ds/section-header";

import { GENRE_GRID_CLASS, GENRE_SECTION_CLASS } from "./classes";
import type { GenreTileData } from "./types";

/**
 * "Browse by genre": a grid (not a rail) of backdrop tiles with the genre name
 * below each image. Every tile opens the movie listing filtered to that genre.
 * Server-safe.
 */
export function GenreGrid({ tiles }: { tiles: readonly GenreTileData[] }) {
  if (tiles.length === 0) return null;

  return (
    <section aria-labelledby="home-genres" className={GENRE_SECTION_CLASS}>
      <SectionHeader id="home-genres" title="Browse by genre" className="min-h-11 items-center" />
      <ul className={GENRE_GRID_CLASS}>
        {tiles.map((tile) => (
          <li key={tile.id}>
            <GenreTile href={`/movie?genres=${tile.id}`} name={tile.name} imagePath={tile.backdropPath} />
          </li>
        ))}
      </ul>
    </section>
  );
}
