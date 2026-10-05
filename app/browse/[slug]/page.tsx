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
import {
  discoverByProvider,
  getCuratedProvider,
  getProviderOriginals,
  getWatchRegions,
  resolveRegion,
  type CuratedProvider,
  type RegionDTO,
  type ResolvedRegion,
} from "@/lib/tmdb";
import type { CardDTO, Paged } from "@/lib/tmdb/types";

/*
 * /browse/[slug]: one streaming service (Netflix, HBO Max...). Dynamic: it
 * reads ?type, ?sort, ?page, ?genres and ?region, and the default region
 * comes from the visitor's country header. The TMDB data underneath is cached.
 */

interface ProviderPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<RawSearchParams>;
}

const NO_TITLES: Paged<CardDTO> = { page: 1, totalPages: 0, totalResults: 0, results: [] };

function configFor(provider: CuratedProvider, region: ResolvedRegion): EntityConfig {
  return {
    basePath: providerHref(provider.slug),
    types: ["movie", "tv"],
    autoType: true,
    // Only an explicit ?region= is written into links; a detected one is re-detected every time.
    region: region.source === "param" ? region.code : null,
    load: async (type, filters) => (await discoverByProvider(provider, type, region.code, filters)) ?? NO_TITLES,
  };
}

export async function generateMetadata({ params, searchParams }: ProviderPageProps): Promise<Metadata> {
  const { slug } = await params;
  const provider = getCuratedProvider(slug);
  if (!provider) return { title: "Streaming service not found", robots: { index: false } };

  const query = await searchParams;
  const page = parsePage(firstParam(query.page));
  const type = parseType(firstParam(query.type));

  // The service's originals give a stable image (the grid depends on the visitor's region).
  let image: CatalogImageSource | null = null;
  try {
    const originals = await getProviderOriginals(provider);
    image = pickImage(originals?.results ?? []);
  } catch {
    // Fall back to the logo below.
  }

  return catalogMetadata({
    title: provider.name,
    description: `Movies and series streaming on ${provider.name}, by region. Availability data by JustWatch.`,
    canonical: catalogCanonical(providerHref(provider.slug), { type: type === "tv" ? "tv" : null, page }),
    image: image ?? { posterPath: provider.logoPath },
  });
}

export default async function ProviderPage({ params, searchParams }: ProviderPageProps) {
  const { slug } = await params;
  const provider = getCuratedProvider(slug);
  if (!provider) notFound();

  const query = await searchParams;
  const region = await resolveRegion(query.region);
  const regionList = await getWatchRegions().catch((): RegionDTO[] => []);
  const regions = regionList.some((item) => item.code === region.code)
    ? regionList
    : [{ code: region.code, name: region.name }, ...regionList];
  const config = configFor(provider, region);

  return (
    <EntityCatalog
      config={config}
      params={query}
      header={(state) => (
        <ProviderHeader
          name={provider.name}
          logoPath={provider.logoPath}
          basePath={config.basePath}
          regions={regions}
          regionCode={region.code}
          query={state.query}
        />
      )}
      rail={
        <Suspense fallback={<RailSkeleton variant="poster" count={8} titleWidth="w-48" />}>
          <OriginalsRail provider={provider} />
        </Suspense>
      }
      headingFor={(type) => `${type === "movie" ? "Movies" : "Series"} on ${provider.name}`}
      emptyFor={(state) => ({
        title: `No ${state.type === "movie" ? "movies" : "series"} found on ${provider.name} in ${region.name}`,
        body:
          state.genres.length > 0
            ? "Remove a genre or pick another region."
            : "Streaming catalogs differ by region. Pick another region or switch between movies and series.",
      })}
    />
  );
}
