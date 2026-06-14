// Central registry of streaming sources.
//
// Adding a provider = one object in STREAM_PROVIDERS below.
// Every provider here is driven purely by the TMDB id (no IMDB lookup needed).
// Remember: when you add a provider, also add its domain to the `frame-src`
// allowlist in next.config.ts, otherwise the iframe will be blocked by CSP.

export type StreamType = "movie" | "series";

export interface BuildUrlArgs {
  type: StreamType;
  tmdbId: string | number;
  season?: number;
  episode?: number;
}

export interface StreamProvider {
  id: string;
  label: string;
  /** Surfaced as an "iOS" hint badge in the source switcher. */
  iosFriendly?: boolean;
  buildUrl: (args: BuildUrlArgs) => string;
}

export const STREAM_PROVIDERS: StreamProvider[] = [
  {
    id: "vidsrc",
    label: "VidSrc",
    iosFriendly: true,
    buildUrl: ({ type, tmdbId, season = 1, episode = 1 }) =>
      type === "movie"
        ? `https://vidsrc.to/embed/movie/${tmdbId}`
        : `https://vidsrc.to/embed/tv/${tmdbId}/${season}/${episode}`,
  },
  {
    id: "multiembed",
    label: "MultiEmbed",
    iosFriendly: true,
    buildUrl: ({ type, tmdbId, season = 1, episode = 1 }) => {
      const base = `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1`;
      return type === "movie" ? base : `${base}&s=${season}&e=${episode}`;
    },
  },
  {
    // The app's original provider. Kept as an option; query string preserved
    // byte-for-byte from the previous app/api/stream/route.ts behaviour.
    id: "vidlink",
    label: "VidLink",
    iosFriendly: false,
    buildUrl: ({ type, tmdbId, season = 1, episode = 1 }) =>
      type === "movie"
        ? `https://vidlink.pro/movie/${tmdbId}/?primaryColor=d31d09&secondaryColor=a2a2a2&iconColor=f7f7f8&player=jw&title=true&poster=true&autoplay=false&nextbutton=false`
        : `https://vidlink.pro/tv/${tmdbId}/${season}/${episode}/?primaryColor=d31d09&secondaryColor=a2a2a2&iconColor=f7f7f8&player=default&title=true&poster=true&autoplay=false&nextbutton=false`,
  },
  // Owner's additional sites drop in here as one object each.
];

/** iOS-friendly default so iPhone users get a working source on first load. */
export const DEFAULT_PROVIDER_ID = "vidsrc";

/** Resolve a provider by id, falling back to the default if unknown/missing. */
export const getProvider = (id?: string): StreamProvider =>
  STREAM_PROVIDERS.find((p) => p.id === id) ??
  STREAM_PROVIDERS.find((p) => p.id === DEFAULT_PROVIDER_ID)!;
