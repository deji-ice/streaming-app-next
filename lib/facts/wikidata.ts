import "server-only";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import type { WdRow } from "./build";

/**
 * Wikidata (CC0) statements for one title, via ONE SPARQL query.
 *
 * Measured 2026-10-01 (scratchpad wave-a/measure-wd*.mjs): this direct-only
 * query answers in 0.65 to 1.0 s with 10 to 20 KB. wbgetentities + one batched
 * labels call took 1.4 to 2.4 s and downloads 170 to 180 KB of claims. The
 * prototype's UNION over person awards (P1686 "for work") timed out at 8 s,
 * so awards attributed to people are left out.
 */

const ENDPOINT = "https://query.wikidata.org/sparql";
const USER_AGENT = "StreamScapeX/1.0 (https://stream.scapex.workers.dev)";
const TIMEOUT_MS = 2500;
const REVALIDATE_SECONDS = 604800; // 7 days

/** award received, nominated for, cost, box office, filming location, based on, inspired by, narrative location,
 * composer, director of photography, part of the series, follows, followed by, number of episodes, number of seasons */
const PROPERTIES = ["P166", "P1411", "P2130", "P2142", "P915", "P144", "P941", "P840", "P86", "P344", "P179", "P155", "P156", "P1113", "P2437"];

export const isQid = (value: string | null | undefined): value is string => typeof value === "string" && /^Q\d{1,12}$/.test(value);

export function buildQuery(qid: string): string {
  if (!isQid(qid)) throw new Error(`Invalid Wikidata id: ${qid}`);
  const values = PROPERTIES.map((p) => `("${p}" p:${p} ps:${p} psv:${p})`).join(" ");
  return `SELECT ?pid ?rank ?value ?valueLabel ?amount ?unit ?time ?ceremonyLabel ?place ?placeLabel ?adminLabel ?countryLabel WHERE {
  VALUES (?pid ?p ?ps ?psv) { ${values} }
  wd:${qid} ?p ?st . ?st ?ps ?value ; wikibase:rank ?rank .
  FILTER(?rank != wikibase:DeprecatedRank)
  OPTIONAL { ?st ?psv ?vn . ?vn wikibase:quantityAmount ?amount ; wikibase:quantityUnit ?unit . }
  OPTIONAL { ?st pq:P585 ?time } OPTIONAL { ?st pq:P805 ?ceremony } OPTIONAL { ?st pq:P3005 ?place }
  OPTIONAL { ?st pq:P131 ?admin } OPTIONAL { ?st pq:P17 ?country }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en,mul". }
}`;
}

interface Binding {
  type: string;
  value: string;
}
type SparqlRow = Partial<Record<string, Binding>>;

const entityId = (b: Binding | undefined): string | null => (b?.type === "uri" ? (b.value.split("/").pop() ?? null) : null);

/** SPARQL JSON bindings -> compact rows (labels equal to a QID mean "no English label"). */
export function toRows(bindings: SparqlRow[]): WdRow[] {
  const rows: WdRow[] = [];
  for (const b of bindings) {
    const pid = b.pid?.value;
    if (!pid || !b.value) continue;
    const label = b.valueLabel?.value ?? null;
    const amount = b.amount ? Number(b.amount.value) : NaN;
    rows.push({
      pid,
      preferred: (b.rank?.value ?? "").endsWith("PreferredRank"),
      value: entityId(b.value) ?? b.value.value,
      label: label && !isQid(label) ? label : null,
      amount: Number.isFinite(amount) ? amount : null,
      unit: entityId(b.unit),
      time: b.time?.value && /^\+?\d{4}-\d{2}-\d{2}/.test(b.time.value) ? b.time.value.replace(/^\+/, "").slice(0, 10) : null,
      ceremony: b.ceremonyLabel?.value && !isQid(b.ceremonyLabel.value) ? b.ceremonyLabel.value : null,
      placeId: entityId(b.place),
      place: b.placeLabel?.value ?? null,
      admin: b.adminLabel?.value && !isQid(b.adminLabel.value) ? b.adminLabel.value : null,
      country: b.countryLabel?.value && !isQid(b.countryLabel.value) ? b.countryLabel.value : null,
    });
  }
  return rows;
}

/** One uncached SPARQL call. Throws on timeout, HTTP errors and bad JSON. */
export async function fetchWikidataRows(qid: string): Promise<WdRow[]> {
  const url = `${ENDPOINT}?format=json&query=${encodeURIComponent(buildQuery(qid))}`;
  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT, Accept: "application/sparql-results+json" },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`Wikidata SPARQL ${res.status}`);
  const json = (await res.json()) as { results?: { bindings?: SparqlRow[] } };
  if (!Array.isArray(json.results?.bindings)) throw new Error("Wikidata SPARQL: unexpected response");
  return toRows(json.results.bindings);
}

/** Cached 7 days (failures are not cached), deduped per request. */
export const getWikidataRows = cache((qid: string): Promise<WdRow[]> =>
  unstable_cache(() => fetchWikidataRows(qid), ["wikidata-facts", qid], {
    revalidate: REVALIDATE_SECONDS,
    tags: ["wikidata", `wikidata:${qid}`],
  })(),
);
