import { Season, SeriesDetails } from "@/types";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { tmdb } from "./tmdb";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const sluggify = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");



export function isSeriesDetails(data: unknown): data is SeriesDetails {
  return (
    data !== null &&
    typeof data === "object" &&
    "id" in data &&
    "name" in data &&
    "seasons" in data
  );
}

export async function getSeriesDetails(
  slug: string,
  currentSeason: number = 1
): Promise<SeriesDetails | null> {
  const id = slug.split("-").pop();
  if (!id || isNaN(Number(id))) return null;

  try {
    const seriesData = await tmdb.getMediaDetails(id, "tv");
    if (!isSeriesDetails(seriesData)) {
      throw new Error("Invalid series data");
    }

    const seasonDetails = await tmdb.getSeasonDetails(
      Number(id),
      currentSeason
    );

    return {
      ...seriesData,
      seasons: seriesData.seasons.map((season: Season) => ({
        ...season,
        episodes:
          season.season_number === currentSeason ? seasonDetails.episodes : [],
      })),
    };
  } catch (error) {
    console.error("Error fetching series details:", error);
    return null;
  }
}