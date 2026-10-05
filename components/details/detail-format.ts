import type { CountryDTO, LanguageDTO } from "@/lib/tmdb/types";

/** English name of a language code, from the title's own language list first. */
export function languageName(
  code: string | null | undefined,
  spoken: readonly LanguageDTO[] = [],
): string | null {
  if (!code) return null;
  const known = spoken.find((language) => language.code === code)?.name;
  if (known) return known;
  try {
    return new Intl.DisplayNames(["en-US"], { type: "language" }).of(code) ?? code.toUpperCase();
  } catch {
    return code.toUpperCase();
  }
}

/** "United States, Canada" from TMDB production countries, null when there are none. */
export function countryNames(countries: readonly CountryDTO[]): string | null {
  const names = countries.map((country) => country.name).filter(Boolean);
  return names.length > 0 ? names.join(", ") : null;
}

/** "1 season", "5 seasons". */
export function plural(count: number, one: string, many = `${one}s`): string {
  return `${count} ${count === 1 ? one : many}`;
}
