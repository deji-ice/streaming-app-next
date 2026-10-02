/**
 * Pure helpers for the person page header: biography text, the meta
 * description and external profile links. No server-only imports, so Server
 * Components and client leaves can share them.
 */

import type { ExternalIdsDTO } from "@/lib/tmdb/types";

/* ------------------------------------------------------------------------ */
/* Biography                                                                 */
/* ------------------------------------------------------------------------ */

/** Splits a TMDB biography on blank lines. Single line breaks inside a paragraph become spaces. */
export function splitBiography(text: string | null | undefined): string[] {
  if (!text) return [];
  return text
    .replace(/\r\n?/g, "\n")
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.replace(/\s*\n\s*/g, " ").trim())
    .filter(Boolean);
}

/** Words that end in a period without ending a sentence ("Jr.", "Dr.", "St."). */
const ABBREVIATION = /^(?:mr|mrs|ms|dr|jr|sr|st|mt|prof|gen|col|lt|sgt|capt|rev|hon|vs|no|ca|approx|inc|ltd|co|corp|fl)\.$/i;

function endsWithoutEndingSentence(word: string): boolean {
  const bare = word.replace(/^["'(\[]+/, "");
  if (/^[A-Z]\.$/.test(bare)) return true; // an initial: "J." in "J. K. Simmons"
  if (/^(?:[A-Za-z]\.){2,}$/.test(bare)) return true; // "U.S." or "a.k.a."
  return ABBREVIATION.test(bare);
}

/** Shortens text at a word boundary and adds "..." when it was cut. */
function clip(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const space = cut.lastIndexOf(" ");
  const base = (space > max * 0.6 ? cut.slice(0, space) : cut).replace(/[\s,;:]+$/, "");
  return `${base}...`;
}

/**
 * First sentence of a text, for meta descriptions. Skips periods after
 * initials and abbreviations. Returns "" for empty input.
 */
export function firstSentence(text: string | null | undefined, max = 200): string {
  const flat = (text ?? "").replace(/\s+/g, " ").trim();
  if (!flat) return "";

  // A sentence mark (with optional closing quote or bracket), then a space and a capital, quote or digit.
  const boundary = /([.!?]["')\]]*)\s+(?=["'(\[]?[A-Z0-9])/g;
  let end = flat.length;
  for (let match = boundary.exec(flat); match; match = boundary.exec(flat)) {
    const upto = flat.slice(0, match.index + match[1].length);
    const lastWord = upto.slice(upto.lastIndexOf(" ") + 1);
    if (match[1] === "." && endsWithoutEndingSentence(lastWord)) continue;
    end = match.index + match[1].length;
    break;
  }
  return clip(flat.slice(0, end), max);
}

/** Meta description: first sentence of the biography, else a plain fallback. */
export function describePerson(name: string, biography: string | null | undefined): string {
  return firstSentence(biography) || `Movies and series featuring ${name}`;
}

/* ------------------------------------------------------------------------ */
/* External links                                                            */
/* ------------------------------------------------------------------------ */

export type SocialKey = "instagram" | "x" | "tiktok" | "facebook" | "youtube";

export interface SocialLink {
  key: SocialKey;
  /** Network name, used in the accessible label. */
  label: string;
  href: string;
}

/** A handle or id that is safe to put in one URL path segment. */
const SAFE_SEGMENT = /^[A-Za-z0-9._@-]{1,100}$/;

function segment(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed && SAFE_SEGMENT.test(trimmed) ? encodeURIComponent(trimmed).replace(/%40/g, "@") : null;
}

function youtubeHref(id: string): string {
  // Channel ids look like UCxxxxxxxxxxxxxxxxxxxxxx; everything else is a handle or custom name.
  return /^UC[A-Za-z0-9_-]{22}$/.test(id)
    ? `https://www.youtube.com/channel/${id}`
    : `https://www.youtube.com/${id}`;
}

/** Social profile links in a fixed order. Entries with a missing or odd-looking id are skipped. */
export function socialLinks(ids: ExternalIdsDTO): SocialLink[] {
  const links: SocialLink[] = [];
  const instagram = segment(ids.instagramId);
  if (instagram) links.push({ key: "instagram", label: "Instagram", href: `https://www.instagram.com/${instagram}` });
  const x = segment(ids.twitterId);
  if (x) links.push({ key: "x", label: "X", href: `https://x.com/${x}` });
  const tiktok = segment(ids.tiktokId);
  if (tiktok) links.push({ key: "tiktok", label: "TikTok", href: `https://www.tiktok.com/@${tiktok.replace(/^@/, "")}` });
  const facebook = segment(ids.facebookId);
  if (facebook) links.push({ key: "facebook", label: "Facebook", href: `https://www.facebook.com/${facebook}` });
  const youtube = segment(ids.youtubeId);
  if (youtube) links.push({ key: "youtube", label: "YouTube", href: youtubeHref(youtube) });
  return links;
}

/** IMDb name page, from ids like "nm1500155". */
export function imdbHref(imdbId: string | null | undefined): string | null {
  const id = imdbId?.trim();
  return id && /^nm\d{3,}$/.test(id) ? `https://www.imdb.com/name/${id}/` : null;
}

/** The person's own site, only when it is a plain http(s) URL. */
export function websiteHref(homepage: string | null | undefined): string | null {
  const value = homepage?.trim();
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}
