/**
 * Pure fact builder: Wikidata rows + already-loaded TMDB details -> Fact[].
 * No I/O here (getFacts in ./index does the fetching), so it is easy to test.
 *
 * Copy rules: one plain line per fact, no em or en dashes (Wikidata labels
 * often contain them; they become ": "), every number comes from the data.
 */
import type { Fact, FactIcon, MediaType } from "@/lib/tmdb/types";

/** One trimmed SPARQL row (see ./wikidata). */
export interface WdRow {
  /** Property id, e.g. "P166" */
  pid: string;
  preferred: boolean;
  /** Item QID for item values, else the literal value */
  value: string | null;
  /** English label of the value (null when Wikidata has none) */
  label: string | null;
  amount: number | null;
  /** Unit QID (Q4917 = US dollar) */
  unit: string | null;
  /** YYYY-MM-DD from the point-in-time qualifier (P585) */
  time: string | null;
  ceremony: string | null;
  /** valid-in-place qualifier (P3005) QID and label */
  placeId: string | null;
  place: string | null;
  /** located-in admin area (P131) and country (P17) qualifiers */
  admin: string | null;
  country: string | null;
}

/** The subset of MovieDTO / TvDTO the builder reads (both satisfy it). */
export interface FactsTmdbInput {
  id: number;
  budget?: number | null;
  revenue?: number | null;
  collection?: { id: number; name: string } | null;
  keywords?: { id: number; name: string }[];
  numberOfSeasons?: number;
  numberOfEpisodes?: number;
  firstAirDate?: string | null;
  lastAirDate?: string | null;
  ended?: boolean;
}

export const MAX_FACTS = 8;

const USD = "Q4917";
const WORLDWIDE = "Q13780930";

/* ---------------------------------------------------------------------- */
/* Formatting                                                              */
/* ---------------------------------------------------------------------- */

const DASHES = /\s*[\u2012\u2013\u2014\u2015\u2212]\s*/g;
/** Replace dash characters with ": ", collapse whitespace. */
export const clean = (s: string): string => s.replace(DASHES, ": ").replace(/\s+/g, " ").trim();

const isQid = (s: string) => /^Q\d+$/.test(s);

const usdFormat = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumSignificantDigits: 3,
});
export const usd = (n: number): string => usdFormat.format(n);

/** "A", "A and B", "A, B and C", "A, B, C and 4 more" */
export function joinList(items: string[], max = 3, noun = "more"): string {
  const unique = [...new Set(items.map(clean))].filter((x) => x && !isQid(x));
  // Names that contain commas read better last.
  const sorted = [...unique.filter((x) => !x.includes(",")), ...unique.filter((x) => x.includes(","))];
  if (sorted.length === 0) return "";
  const shown = sorted.length <= max + 1 ? sorted : sorted.slice(0, max);
  const rest = sorted.length - shown.length;
  if (rest > 0) return `${shown.join(", ")} and ${rest} ${noun}`;
  return shown.length === 1 ? shown[0] : `${shown.slice(0, -1).join(", ")} and ${shown[shown.length - 1]}`;
}

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

/* ---------------------------------------------------------------------- */
/* Awards                                                                  */
/* ---------------------------------------------------------------------- */

const SHORT: Record<string, string> = {
  "Academy Award": "Oscar",
  "Academy Awards": "Oscar",
  "Primetime Emmy Award": "Emmy",
  "Primetime Creative Arts Emmy Award": "Emmy",
  "Daytime Emmy Award": "Daytime Emmy",
  "International Emmy Award": "International Emmy",
  "Golden Globe Award": "Golden Globe",
  "Golden Globe Awards": "Golden Globe",
  "British Academy Film Award": "BAFTA",
  "British Academy Television Award": "BAFTA TV Award",
  "BAFTA Award": "BAFTA",
  "Screen Actors Guild Award": "SAG Award",
  "Actor Award": "SAG Award",
  "Critics' Choice Movie Award": "Critics' Choice Award",
  "Critics' Choice Television Award": "Critics' Choice Award",
  "The Game Awards": "The Game Award",
  "Golden Joystick Awards": "Golden Joystick Award",
};
const PRESTIGE = ["Oscar", "Emmy", "Golden Globe", "BAFTA", "Palme d'Or", "Golden Lion", "Golden Bear", "SAG Award", "Peabody Award", "Critics' Choice Award", "Hugo Award", "Saturn Award", "Annie Award"];
const rankOf = (short: string) => {
  const i = PRESTIGE.indexOf(short);
  return i === -1 ? PRESTIGE.length : i;
};
const withThe = (short: string) => (/^The /.test(short) ? short : `the ${short}`);

function splitAward(label: string): { short: string; category: string | null } {
  const s = clean(label);
  const m = s.match(/^(.*?) for (.+)$/) ?? s.match(/^(.*?): (.+)$/);
  const family = m ? m[1] : s;
  return { short: SHORT[family] ?? family, category: m ? m[2] : null };
}

interface AwardItem {
  short: string;
  category: string | null;
  years: Set<string>;
}

function awardItems(rows: WdRow[]): AwardItem[] {
  const items = new Map<string, AwardItem>();
  for (const r of rows) {
    if (!r.label || isQid(r.label)) continue;
    const { short, category } = splitAward(r.label);
    const key = `${short}|${category ?? ""}`;
    const item = items.get(key) ?? { short, category, years: new Set<string>() };
    const year = r.time?.slice(0, 4) ?? r.ceremony?.match(/\b(19|20)\d{2}\b/)?.[0] ?? null;
    if (year) item.years.add(year);
    items.set(key, item);
  }
  return [...items.values()];
}

const pluralAward = (short: string) => (short === "The Game Award" ? "The Game Awards" : short.endsWith("s") ? short : `${short}s`);

/** Headline categories lead (Best Picture before Best Sound Editing), then directing. */
const HEADLINE =
  /\b(best (motion )?picture|best film|best feature|best animated feature|outstanding (drama|comedy|limited( or anthology)?) series|best (drama|comedy|television|tv|limited) series)\b/i;
const categoryRank = (category: string | null) => (category === null ? 1 : HEADLINE.test(category) ? 0 : /\bdirect/i.test(category) ? 1 : 2);

const newestYear = (i: AwardItem) => Math.max(0, ...[...i.years].map(Number));
const byPrestige = (a: AwardItem, b: AwardItem) =>
  rankOf(a.short) - rankOf(b.short) || categoryRank(a.category) - categoryRank(b.category) || newestYear(b) - newestYear(a);

/**
 * " (2023)", " (2023 and 2025)", or for long lists " (5 times, 2008 to 2014)".
 * Pass countTimes=false when the years belong to several categories (the count would mislead).
 */
function yearsLabel(years: Set<string>, countTimes = true): string {
  const list = [...years].sort();
  if (list.length === 0) return "";
  if (list.length <= 3) return ` (${joinList(list, 3)})`;
  return ` (${countTimes ? `${list.length} times, ` : ""}${list[0]} to ${list[list.length - 1]})`;
}
const awardPhrase = (i: AwardItem) => `${withThe(i.short)}${i.category ? ` for ${i.category}` : ""}${yearsLabel(i.years)}`;

/** The top two awards as one phrase; two categories of the same award share it: "the Oscars for Best Picture and Best Director (2024)". */
function topAwardsPhrase(items: AwardItem[]): string {
  const [first, second] = items;
  if (!second) return awardPhrase(first);
  if (first.short === second.short && first.category && second.category) {
    return `${withThe(pluralAward(first.short))} for ${first.category} and ${second.category}${yearsLabel(new Set([...first.years, ...second.years]), false)}`;
  }
  return `${awardPhrase(first)} and ${awardPhrase(second)}`;
}

/** One count per award, category and year. */
const occurrences = (items: AwardItem[]) => items.reduce((n, i) => n + Math.max(1, i.years.size), 0);

/** Wikidata P179 is sometimes a ranked list ("BBC's 100 Greatest Films..."), not a film series. */
const LIST_LIKE = /\b(greatest|best|top|list|essential|must see|films of the)\b|\d{2,}/i;
/** Street addresses ("308 Negra Arroyo Lane") are poor headline locations. */
const ADDRESS_LIKE = /^\d/;
/** Country names that read with "the": "Set in the United States". */
const withArticle = (place: string) =>
  /^(United States|United Kingdom|United Arab Emirates|Netherlands|Philippines|Bahamas|Czech Republic|Soviet Union|Vatican City|Gambia|Maldives|Republic of|Democratic Republic)/.test(place)
    ? `the ${place}`
    : place;
const placesFirst = (names: string[]) => {
  const nonAddress = names.filter((n) => !ADDRESS_LIKE.test(n));
  return (nonAddress.length ? [...nonAddress, ...names.filter((n) => ADDRESS_LIKE.test(n))] : names).map(withArticle);
};

/* ---------------------------------------------------------------------- */
/* Builder                                                                 */
/* ---------------------------------------------------------------------- */

interface Draft extends Fact {
  priority: number;
}

export function buildFacts(input: { type: MediaType; qid: string | null; rows: WdRow[]; tmdb: FactsTmdbInput }): Fact[] {
  const { type, qid, tmdb } = input;
  const facts: Draft[] = [];
  const tmdbUrl = `https://www.themoviedb.org/${type}/${tmdb.id}`;
  const wdUrl = (pid: string) => (qid ? `https://www.wikidata.org/wiki/${qid}#${pid}` : tmdbUrl);
  const add = (priority: number, id: string, label: string, icon: FactIcon, value: string, source: Fact["source"], sourceUrl: string) => {
    const v = clean(value);
    if (v) facts.push({ priority, id, label, icon, value: v, source, sourceUrl });
  };

  // Best-rank semantics: when a property has preferred statements, use only those.
  const byPid = new Map<string, WdRow[]>();
  for (const r of input.rows) byPid.set(r.pid, [...(byPid.get(r.pid) ?? []), r]);
  for (const [pid, list] of byPid) if (list.some((r) => r.preferred)) byPid.set(pid, list.filter((r) => r.preferred));
  const get = (pid: string) => byPid.get(pid) ?? [];
  const labels = (pid: string) => get(pid).map((r) => r.label ?? "").filter((l) => l && !isQid(l));
  const has = (pid: string) => labels(pid).length > 0;

  /* Awards won (P166) */
  const wins = awardItems(get("P166")).sort(byPrestige);
  const winCount = occurrences(wins);
  if (wins.length === 1 || (wins.length === 2 && winCount === 2)) add(10, "awards-won", "Awards", "Trophy", `Won ${topAwardsPhrase(wins)}`, "wikidata", wdUrl("P166"));
  else if (wins.length > 1) add(10, "awards-won", "Awards", "Trophy", `Won ${winCount} awards, including ${topAwardsPhrase(wins)}`, "wikidata", wdUrl("P166"));

  /* Nominations (P1411) that did not end in a win the same year */
  const won = new Set(wins.flatMap((w) => [...w.years].map((y) => `${w.short}|${w.category ?? ""}|${y}`)));
  const noms = awardItems(get("P1411"))
    .map((n) => ({ ...n, years: new Set([...n.years].filter((y) => !won.has(`${n.short}|${n.category ?? ""}|${y}`))) }))
    .filter((n) => n.years.size > 0 || !wins.some((w) => w.short === n.short && w.category === n.category))
    .sort(byPrestige);
  const nomCount = occurrences(noms);
  if (nomCount === 1) add(9, "award-nominations", "Nominations", "Trophy", `Nominated for ${awardPhrase(noms[0])}`, "wikidata", wdUrl("P1411"));
  else if (nomCount > 1) add(9, "award-nominations", "Nominations", "Trophy", `${nomCount} award nominations, including ${awardPhrase(noms[0])}`, "wikidata", wdUrl("P1411"));

  /* Budget and box office: TMDB first (already loaded), Wikidata as fallback */
  if (type === "movie") {
    const tBudget = (tmdb.budget ?? 0) >= 10_000 ? tmdb.budget! : null;
    const tRevenue = (tmdb.revenue ?? 0) >= 10_000 ? tmdb.revenue! : null;
    const wdBudget = get("P2130").find((r) => r.unit === USD && (r.amount ?? 0) > 0)?.amount ?? null;
    const wdRevenue = get("P2142").find((r) => r.unit === USD && r.placeId === WORLDWIDE && (r.amount ?? 0) > 0)?.amount ?? null;
    const fromTmdb = tRevenue !== null || (tBudget !== null && wdRevenue === null);
    const budget = fromTmdb ? tBudget : wdBudget;
    const revenue = fromTmdb ? tRevenue : wdRevenue;
    let value: string | null = null;
    if (revenue && budget) {
      const multiple = revenue / budget;
      value =
        multiple >= 1.1
          ? `Grossed ${usd(revenue)} worldwide, about ${multiple.toFixed(1)} times its ${usd(budget)} budget`
          : multiple <= 0.9
            ? `Grossed ${usd(revenue)} worldwide against a ${usd(budget)} budget`
            : `Grossed ${usd(revenue)} worldwide on a ${usd(budget)} budget`;
    } else if (revenue) value = `Grossed ${usd(revenue)} worldwide`;
    else if (budget) value = `Made on a ${usd(budget)} budget`;
    if (value) add(8, "box-office", "Box office", "CurrencyDollarSimple", value, fromTmdb ? "tmdb" : "wikidata", fromTmdb ? tmdbUrl : wdUrl(wdRevenue ? "P2142" : "P2130"));
  }

  /* Based on (P144), inspired by (P941), TMDB keyword fallbacks */
  const kw = new Set((tmdb.keywords ?? []).map((k) => k.id));
  const noun = kw.has(41645) ? "video game" : kw.has(818) ? "novel" : kw.has(9717) ? "comic" : null;
  if (has("P144")) add(7, "based-on", "Based on", "BookOpenText", `Based on ${noun && labels("P144").length === 1 ? `the ${noun} ` : ""}${joinList(labels("P144"), 2)}`, "wikidata", wdUrl("P144"));
  else if (kw.has(9672)) add(7, "based-on", "Based on", "BookOpenText", "Based on a true story", "tmdb", tmdbUrl);
  else if (has("P941")) add(5, "inspired-by", "Inspired by", "BookOpenText", `Inspired by ${joinList(labels("P941"), 3, "other works")}`, "wikidata", wdUrl("P941"));

  /* TV structure: TMDB counts, Wikidata P2437/P1113 fallback */
  if (type === "tv") {
    const wdCount = (pid: string) => get(pid).find((r) => (r.amount ?? 0) > 0)?.amount ?? 0;
    const seasons = tmdb.numberOfSeasons || wdCount("P2437");
    const episodes = tmdb.numberOfEpisodes || wdCount("P1113");
    const fromTmdb = !!tmdb.numberOfSeasons && !!tmdb.numberOfEpisodes;
    if (seasons > 0 && episodes > 0) {
      const from = tmdb.firstAirDate?.slice(0, 4);
      const to = tmdb.lastAirDate?.slice(0, 4);
      const span = from && to ? (from === to ? ` (${from})` : ` (${from} to ${to})`) : "";
      const value = tmdb.ended
        ? `Ran for ${plural(seasons, "season")} and ${plural(episodes, "episode")}${span}`
        : `${plural(seasons, "season")} and ${plural(episodes, "episode")} so far`;
      add(7, "episodes", "Episodes", "Television", value, fromTmdb ? "tmdb" : "wikidata", fromTmdb ? tmdbUrl : wdUrl("P1113"));
    }
  }

  /* Filming locations (P915), grouped by region when qualifiers allow */
  const locations = get("P915").filter((r) => r.label && !isQid(r.label));
  if (locations.length) {
    const names = placesFirst([...new Set(locations.map((r) => clean(r.label!)))]);
    const groups = new Map<string, Set<string>>();
    for (const r of locations) {
      if (!r.admin || !r.country) continue;
      const key = `${clean(r.admin)}, ${clean(r.country)}`;
      groups.set(key, (groups.get(key) ?? new Set<string>()).add(clean(r.label!)));
    }
    const [region, set] = [...groups.entries()].sort((a, b) => b[1].size - a[1].size)[0] ?? [];
    const value =
      region && set && set.size >= 3 && set.size / names.length >= 0.5
        ? `Filmed ${set.size === names.length ? "" : "mostly "}in ${region}, including ${joinList(placesFirst([...set]).slice(0, 3), 3)}`
        : `Filmed in ${joinList(names, 3, names.length - 3 === 1 ? "other location" : "other locations")}`;
    add(6, "filming-locations", "Filming locations", "MapPin", value, "wikidata", wdUrl("P915"));
  }

  /* Credits scenes (TMDB keywords) */
  if (type === "movie") {
    const during = kw.has(179431);
    const after = kw.has(179430);
    if (during || after) {
      const value = during && after ? "Has a mid-credits scene and a post-credits scene" : during ? "Has a mid-credits scene" : "Has a scene after the credits";
      add(6, "credits-scene", "Credits scene", "Info", value, "tmdb", tmdbUrl);
    }
  }

  /* Narrative location (P840) */
  if (has("P840")) {
    const places = placesFirst([...new Set(labels("P840").map(clean))]);
    add(5, "setting", "Setting", "GlobeHemisphereWest", `Set in ${joinList(places, 3, places.length - 3 === 1 ? "other place" : "other places")}`, "wikidata", wdUrl("P840"));
  }

  /* Follows (P155) / followed by (P156) */
  const follows = joinList(labels("P155"), 2);
  const followedBy = joinList(labels("P156"), 2);
  if (follows || followedBy) {
    const value = follows && followedBy ? `Follows ${follows} and is followed by ${followedBy}` : follows ? `Follows ${follows}` : `Followed by ${followedBy}`;
    add(5, "sequel", "Sequels", "FilmSlate", value, "wikidata", wdUrl(followedBy ? "P156" : "P155"));
  }

  /* Collection (TMDB) or part of the series (P179) */
  if (tmdb.collection?.name) add(4, "collection", "Collection", "FilmSlate", `Part of ${tmdb.collection.name}`, "tmdb", tmdbUrl);
  else if (labels("P179").some((l) => !LIST_LIKE.test(l))) {
    const series = labels("P179").find((l) => !LIST_LIKE.test(l))!;
    const value = /^the /i.test(series) || /\b(series|franchise|saga|trilogy|universe|collection)$/i.test(series) ? `Part of ${series}` : `Part of the ${series} series`;
    add(4, "series", "Series", "FilmSlate", value, "wikidata", wdUrl("P179"));
  }

  /* Composer (P86) and director of photography (P344) */
  if (has("P86")) add(4, "composer", "Music", "MusicNotes", `Music by ${joinList(labels("P86"), 2)}`, "wikidata", wdUrl("P86"));
  if (has("P344")) add(3, "cinematography", "Cinematography", "VideoCamera", `Cinematography by ${joinList(labels("P344"), 2)}`, "wikidata", wdUrl("P344"));

  return facts
    .sort((a, b) => b.priority - a.priority)
    .slice(0, MAX_FACTS)
    .map(({ priority: _priority, ...fact }) => fact);
}
