/**
 * Display formatters. Every formatter pins the locale to en-US and every date
 * formatter pins the time zone to UTC, so the server render and the browser
 * render produce the same string (no hydration mismatch, no locale drift).
 *
 * All helpers return null for missing or invalid input so callers can drop
 * the value straight into MetaRow, which skips falsy items.
 *
 * Client-safe: no server-only imports.
 */

const LOCALE = "en-US";
const TIME_ZONE = "UTC";

type DateInput = string | number | Date | null | undefined;

/** Parses TMDB dates ("2022-03-04", ISO timestamps) and Date/epoch values. Invalid -> null. */
export function toDate(input: DateInput): Date | null {
  if (input === null || input === undefined || input === "") return null;
  const date = input instanceof Date ? input : new Date(input);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** 176 -> "2h 56m", 45 -> "45m", 120 -> "2h". Null for 0, negatives and missing values. */
export function formatRuntime(minutes: number | null | undefined): string | null {
  if (!minutes || !Number.isFinite(minutes) || minutes <= 0) return null;
  const total = Math.round(minutes);
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/** "2022-03-04" -> "2022". Null when the date is missing or invalid. */
export function formatYear(input: DateInput): string | null {
  if (typeof input === "string") {
    const match = /^(\d{4})/.exec(input.trim());
    if (match) return match[1];
  }
  const date = toDate(input);
  return date ? String(date.getUTCFullYear()) : null;
}

const dateFormatters = {
  medium: new Intl.DateTimeFormat(LOCALE, { dateStyle: "medium", timeZone: TIME_ZONE }),
  long: new Intl.DateTimeFormat(LOCALE, { dateStyle: "long", timeZone: TIME_ZONE }),
  monthYear: new Intl.DateTimeFormat(LOCALE, { month: "long", year: "numeric", timeZone: TIME_ZONE }),
} as const;

export type DateStyle = keyof typeof dateFormatters;

/**
 * "2022-03-04" -> "Mar 4, 2022" (medium, default), "March 4, 2022" (long),
 * "March 2022" (monthYear). en-US, UTC.
 */
export function formatDate(input: DateInput, style: DateStyle = "medium"): string | null {
  const date = toDate(input);
  return date ? dateFormatters[style].format(date) : null;
}

const compactFormatter = new Intl.NumberFormat(LOCALE, {
  notation: "compact",
  maximumFractionDigits: 1,
});

/** 12345 -> "12.3K", 2400000 -> "2.4M", 950 -> "950". Null for missing values. */
export function formatCompact(n: number | null | undefined): string | null {
  if (n === null || n === undefined || !Number.isFinite(n)) return null;
  return compactFormatter.format(n);
}

const moneyFormatter = new Intl.NumberFormat(LOCALE, {
  style: "currency",
  currency: "USD",
  notation: "compact",
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
});

/**
 * 185000000 -> "$185M", 1234000000 -> "$1.2B". TMDB uses 0 for "unknown"
 * budget and revenue, so 0 returns null (never show an invented "$0").
 */
export function formatMoney(n: number | null | undefined): string | null {
  if (!n || !Number.isFinite(n) || n <= 0) return null;
  return moneyFormatter.format(n);
}

/** TMDB vote_average -> "7.8". Null for 0 (no votes) and missing values. */
export function formatRating(value: number | null | undefined): string | null {
  if (!value || !Number.isFinite(value) || value <= 0) return null;
  return value.toFixed(1);
}

/** (2, 5) -> "S2 E5". Null when either part is missing. */
export function formatEpisodeCode(
  season: number | null | undefined,
  episode: number | null | undefined,
): string | null {
  if (season === null || season === undefined || episode === null || episode === undefined) {
    return null;
  }
  return `S${season} E${episode}`;
}

const relativeFormatter = new Intl.RelativeTimeFormat(LOCALE, { numeric: "auto" });

const RELATIVE_STEPS: Array<{ unit: Intl.RelativeTimeFormatUnit; seconds: number }> = [
  { unit: "year", seconds: 31536000 },
  { unit: "month", seconds: 2592000 },
  { unit: "week", seconds: 604800 },
  { unit: "day", seconds: 86400 },
  { unit: "hour", seconds: 3600 },
  { unit: "minute", seconds: 60 },
];

/**
 * "2 days ago", "yesterday", "in 3 weeks", "just now".
 * Depends on the current time, so only call it in client components that
 * render after hydration (for example the Continue watching rail).
 */
export function formatRelativeTime(input: DateInput, now: number = Date.now()): string | null {
  const date = toDate(input);
  if (!date) return null;
  const diffSeconds = Math.round((date.getTime() - now) / 1000);
  const abs = Math.abs(diffSeconds);
  if (abs < 60) return "just now";
  for (const step of RELATIVE_STEPS) {
    if (abs >= step.seconds) {
      return relativeFormatter.format(Math.round(diffSeconds / step.seconds), step.unit);
    }
  }
  return "just now";
}

/**
 * Age in whole years at `until` (the death date, or now). UTC based.
 * ("1974-11-11", null, now) -> 51. Null when the birthday is missing.
 */
export function getAge(
  birthday: DateInput,
  until: DateInput = null,
  now: number = Date.now(),
): number | null {
  const born = toDate(birthday);
  if (!born) return null;
  const end = toDate(until) ?? new Date(now);
  let age = end.getUTCFullYear() - born.getUTCFullYear();
  const beforeBirthday =
    end.getUTCMonth() < born.getUTCMonth() ||
    (end.getUTCMonth() === born.getUTCMonth() && end.getUTCDate() < born.getUTCDate());
  if (beforeBirthday) age -= 1;
  return age >= 0 ? age : null;
}

/** "Robert Downey Jr." -> "RD", "Zendaya" -> "Z". Used for missing person photos. */
export function getInitials(name: string | null | undefined): string {
  if (!name) return "";
  const words = name
    .trim()
    .split(/\s+/)
    .filter((w) => /[\p{L}\p{N}]/u.test(w) && !/^(jr|sr|ii|iii|iv)\.?$/i.test(w));
  if (words.length === 0) return "";
  const first = Array.from(words[0])[0] ?? "";
  const last = words.length > 1 ? (Array.from(words[words.length - 1])[0] ?? "") : "";
  return (first + last).toUpperCase();
}
