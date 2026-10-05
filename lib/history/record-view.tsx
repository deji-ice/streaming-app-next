"use client";

import { useEffect } from "react";
import { recordView } from "./store";

export interface RecordViewProps {
  tmdbId: number;
  /** "series" is accepted and stored as "tv". */
  mediaType: "movie" | "tv" | "series";
  title: string;
  posterPath: string | null;
  backdropPath: string | null;
  /**
   * Pass season/episode only when they are explicit (for example from
   * `?season=&episode=`). When omitted, a series keeps the episode it already
   * has in history instead of being reset to S1 E1.
   */
  season?: number | null;
  episode?: number | null;
}

/**
 * Records a local history view when a detail page mounts (and again when the
 * title or episode changes). Renders nothing, so it can sit anywhere in a
 * Server Component tree.
 */
export function RecordView({
  tmdbId,
  mediaType,
  title,
  posterPath,
  backdropPath,
  season,
  episode,
}: RecordViewProps): null {
  useEffect(() => {
    recordView({ tmdbId, mediaType, title, posterPath, backdropPath, season, episode });
  }, [tmdbId, mediaType, title, posterPath, backdropPath, season, episode]);

  return null;
}

export default RecordView;
