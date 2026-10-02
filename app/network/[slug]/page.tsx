import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { EntityCatalog, entityImage, type EntityConfig } from "@/components/catalog/entity-catalog";
import { EntityHeader } from "@/components/catalog/headers";
import { catalogMetadata } from "@/components/catalog/metadata";
import { catalogCanonical, firstParam, parsePage, type RawSearchParams } from "@/components/catalog/params";
import { networkHref } from "@/lib/slug";
import { discoverByNetwork, getNetwork, isTmdbNotFound, resolveNetworkSlug } from "@/lib/tmdb";
import type { NetworkDTO } from "@/lib/tmdb/types";

/*
 * /network/[slug]: a TV network or service that first aired series (HBO,
 * AMC, BBC One...). Series only, so no Movies tab. The slug is a curated name
 * ("hbo") or "{name}-{id}". Dynamic: it reads ?sort, ?page and ?genres. The
 * TMDB data underneath is cached.
 */

interface NetworkPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<RawSearchParams>;
}

/** The network, or null when the slug has no id or TMDB does not know it. Other errors propagate. */
async function loadNetwork(slug: string): Promise<NetworkDTO | null> {
  const resolved = resolveNetworkSlug(slug);
  if (!resolved) return null;
  try {
    return await getNetwork(resolved.id);
  } catch (error) {
    if (isTmdbNotFound(error)) return null;
    throw error;
  }
}

function configFor(network: NetworkDTO): EntityConfig {
  return {
    // Links always use the normalized slug, whatever form the visitor arrived with.
    basePath: networkHref(network.id, network.name),
    types: ["tv"],
    load: (_type, filters) => discoverByNetwork(network.id, filters),
  };
}

export async function generateMetadata({ params, searchParams }: NetworkPageProps): Promise<Metadata> {
  const { slug } = await params;
  const network = await loadNetwork(slug).catch(() => null);
  if (!network) return { title: "Network not found", robots: { index: false } };

  const query = await searchParams;
  const config = configFor(network);

  return catalogMetadata({
    title: network.name,
    description: `Series from ${network.name}, sorted by popularity, rating or first air date.`,
    canonical: catalogCanonical(config.basePath, { page: parsePage(firstParam(query.page)) }),
    image: await entityImage(config, query),
  });
}

export default async function NetworkPage({ params, searchParams }: NetworkPageProps) {
  const { slug } = await params;
  const network = await loadNetwork(slug);
  if (!network) notFound();

  const query = await searchParams;

  return (
    <EntityCatalog
      config={configFor(network)}
      params={query}
      header={() => (
        <EntityHeader name={network.name} logoPath={network.logoPath} originCountry={network.originCountry} />
      )}
      headingFor={() => `Series from ${network.name}`}
      emptyFor={(state) => ({
        title: `No series found for ${network.name}`,
        body: state.genres.length > 0 ? "Remove a genre to see more." : "Nothing is listed here for this network.",
      })}
    />
  );
}
