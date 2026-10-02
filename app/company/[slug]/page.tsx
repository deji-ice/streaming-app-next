import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { EntityCatalog, entityImage, type EntityConfig } from "@/components/catalog/entity-catalog";
import { EntityHeader } from "@/components/catalog/headers";
import { catalogMetadata } from "@/components/catalog/metadata";
import { catalogCanonical, firstParam, parsePage, parseType, type RawSearchParams } from "@/components/catalog/params";
import { companyHref } from "@/lib/slug";
import { discoverByCompany, getCompany, isTmdbNotFound, resolveCompanySlug } from "@/lib/tmdb";
import type { CompanyDTO } from "@/lib/tmdb/types";

/*
 * /company/[slug]: a production company or studio (A24, Pixar...). The slug is
 * a curated name ("a24") or "{name}-{id}". Dynamic: it reads ?type, ?sort,
 * ?page and ?genres. The TMDB data underneath is cached.
 */

interface CompanyPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<RawSearchParams>;
}

/** The company, or null when the slug has no id or TMDB does not know it. Other errors propagate. */
async function loadCompany(slug: string): Promise<CompanyDTO | null> {
  const resolved = resolveCompanySlug(slug);
  if (!resolved) return null;
  try {
    return await getCompany(resolved.id);
  } catch (error) {
    if (isTmdbNotFound(error)) return null;
    throw error;
  }
}

function configFor(company: CompanyDTO): EntityConfig {
  return {
    // Links always use the normalized slug, whatever form the visitor arrived with.
    basePath: companyHref(company.id, company.name),
    types: ["movie", "tv"],
    autoType: true,
    load: (type, filters) => discoverByCompany(company.id, type, filters),
  };
}

export async function generateMetadata({ params, searchParams }: CompanyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const company = await loadCompany(slug).catch(() => null);
  if (!company) return { title: "Studio not found", robots: { index: false } };

  const query = await searchParams;
  const config = configFor(company);
  const page = parsePage(firstParam(query.page));
  const type = parseType(firstParam(query.type));

  return catalogMetadata({
    title: company.name,
    description: `Movies and series from ${company.name}, sorted by popularity, rating or release date.`,
    canonical: catalogCanonical(config.basePath, { type: type === "tv" ? "tv" : null, page }),
    image: await entityImage(config, query),
  });
}

export default async function CompanyPage({ params, searchParams }: CompanyPageProps) {
  const { slug } = await params;
  const company = await loadCompany(slug);
  if (!company) notFound();

  const query = await searchParams;

  return (
    <EntityCatalog
      config={configFor(company)}
      params={query}
      header={() => (
        <EntityHeader name={company.name} logoPath={company.logoPath} originCountry={company.originCountry} />
      )}
      headingFor={(type) => `${type === "movie" ? "Movies" : "Series"} from ${company.name}`}
      emptyFor={(state) => ({
        title: `No ${state.type === "movie" ? "movies" : "series"} found for ${company.name}`,
        body:
          state.genres.length > 0
            ? "Remove a genre to see more."
            : `Nothing is listed here for this studio. Try the ${state.type === "movie" ? "Series" : "Movies"} tab.`,
      })}
    />
  );
}
