import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Client-safe helpers only. TMDB access lives in lib/tmdb (server-only);
// links are built with lib/slug.ts and dates/numbers with lib/format.ts.

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
