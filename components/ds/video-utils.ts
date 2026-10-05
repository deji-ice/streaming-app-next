/**
 * Video helpers shared by the trailer components. Plain functions (no client
 * directive), so Server Components can call them too.
 */

export interface VideoItem {
  /** YouTube video key. */
  key: string;
  name: string;
  /** TMDB video type: Trailer, Teaser, Clip, Featurette, Behind the Scenes, Bloopers... */
  type: string;
  official?: boolean;
  publishedAt?: string | null;
}

const TYPE_ORDER = ["Trailer", "Teaser", "Clip", "Featurette", "Behind the Scenes", "Bloopers", "Opening Credits"];

function typeRank(type: string): number {
  const index = TYPE_ORDER.indexOf(type);
  return index === -1 ? TYPE_ORDER.length : index;
}

/**
 * Trailers first, then teasers, clips, featurettes and the rest; official
 * videos first within a type; otherwise the incoming order is kept.
 * Drops entries without a key and duplicate keys.
 */
export function sortVideos(videos: readonly VideoItem[]): VideoItem[] {
  const seen = new Set<string>();
  const unique: Array<{ video: VideoItem; index: number }> = [];
  videos.forEach((video, index) => {
    if (!video.key || seen.has(video.key)) return;
    seen.add(video.key);
    unique.push({ video, index });
  });
  return unique
    .sort(
      (a, b) =>
        typeRank(a.video.type) - typeRank(b.video.type) ||
        Number(Boolean(b.video.official)) - Number(Boolean(a.video.official)) ||
        a.index - b.index,
    )
    .map((entry) => entry.video);
}

/** 480x360 YouTube thumbnail (4:3 with letterbox bars; crop it to 16:9 with object-cover). */
export function youtubeThumbnail(key: string): string {
  return `https://i.ytimg.com/vi/${encodeURIComponent(key)}/hqdefault.jpg`;
}

/** Privacy-enhanced embed URL that starts playback from the click that opened it. */
export function youtubeEmbedUrl(key: string): string {
  return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(key)}?autoplay=1&playsinline=1&rel=0`;
}
