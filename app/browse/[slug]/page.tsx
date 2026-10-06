import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { EntityCatalog, type EntityConfig } from "@/components/catalog/entity-catalog";
import { ProviderHeader } from "@/components/catalog/headers";
import { catalogMetadata, pickImage, type CatalogImageSource } from "@/components/catalog/metadata";
import { OriginalsRail } from "@/components/catalog/originals-rail";
import { catalogCanonical, firstParam, parsePage, parseType, type RawSearchParams } from "@/components/catalog/params";
import { RailSkeleton } from "@/components/ds/skeletons";
import { providerHref } from "@/lib/slug";
import { discoverByProvider, getCuratedProvider, getProviderOriginals, type CuratedProvider } from "@/lib/tmdb";
import type { CardDTO, Paged } from "@/lib/tmdb/types";

/*
 * /browse/[slug]: one streaming service (Netflix, HBO Max...). Dynamic: it
 * reads ?type, ?sort, ?page and ?genres. Everyone sees the same catalog, the
 * service's own (see CATALOG_REGION in lib/tmdb/browse.ts), whatever country
 * they are in. The TMDB data underneath is cached.
 */

interface ProviderPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<RawSearchParams>;
}

const NO_TITLES: Paged<CardDTO> = { page: 1, totalPages: 0, totalResults: 0, results: [] };

function configFor(provider: CuratedProvider): EntityConfig {
  return {
    basePath: providerHref(provider.slug),
    types: ["movie", "tv"],
    autoType: true,
    load: async (type, filters) => (await discoverByProvider(provider, type, filters)) ?? NO_TITLES,
  };
}

export async function generateMetadata({ params, searchParams }: ProviderPageProps): Promise<Metadata> {
  const { slug } = await params;
  const provider = getCuratedProvider(slug);
  if (!provider) return { title: "Streaming service not found", robots: { index: false } };

  const query = await searchParams;
  const page = parsePage(firstParam(query.page));
  const type = parseType(firstParam(query.type));

  // The service's originals give a stable image for the social card.
  let image: CatalogImageSource | null = null;
  try {
    const originals = await getProviderOriginals(provider);
    image = pickImage(originals?.results ?? []);
  } catch {
    // Fall back to the logo below.
  }

  return catalogMetadata({
    title: provider.name,
    description: `Movies and series on ${provider.name}. Availability data by JustWatch.`,
    canonical: catalogCanonical(providerHref(provider.slug), { type: type === "tv" ? "tv" : null, page }),
    image: image ?? { posterPath: provider.logoPath },
  });
}

export default async function ProviderPage({ params, searchParams }: ProviderPageProps) {
  const { slug } = await params;
  const provider = getCuratedProvider(slug);
  if (!provider) notFound();

  const query = await searchParams;
  const config = configFor(provider);

  return (
    <EntityCatalog
      config={config}
      params={query}
      header={() => <ProviderHeader name={provider.name} logoPath={provider.logoPath} />}
      rail={
        <Suspense fallback={<RailSkeleton variant="poster" count={8} titleWidth="w-48" />}>
          <OriginalsRail provider={provider} />
        </Suspense>
      }
      headingFor={(type) => `${type === "movie" ? "Movies" : "Series"} on ${provider.name}`}
      emptyFor={(state) => ({
        title: `No ${state.type === "movie" ? "movies" : "series"} found on ${provider.name}`,
        body:
          state.genres.length > 0
            ? "Remove a genre to see more."
            : "Switch between movies and series to see what is on this service.",
      })}
    />
  );
}
