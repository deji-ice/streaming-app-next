import type { Metadata } from "next";

import { JustWatchCredit } from "@/components/catalog/justwatch-credit";
import { catalogMetadata, pickImage, type CatalogImageSource } from "@/components/catalog/metadata";
import { catalogPage, catalogTitle } from "@/components/catalog/styles";
import { LogoChip } from "@/components/ds/logo-chip";
import { ProviderTile } from "@/components/ds/provider-tile";
import { SectionHeader } from "@/components/ds/section-header";
import { companyHref, networkHref, providerHref } from "@/lib/slug";
import { getTrending } from "@/lib/tmdb";
import { CURATED_NETWORKS, CURATED_PROVIDERS, CURATED_STUDIOS } from "@/lib/tmdb/providers";

/** The lists are curated constants, so the page is static; only the social artwork comes from TMDB. */
export const revalidate = 86400;

const DESCRIPTION = "Browse movies and series by streaming service, TV network and studio.";

export async function generateMetadata(): Promise<Metadata> {
  let image: CatalogImageSource | null = null;
  try {
    image = pickImage((await getTrending("all", "week")).results);
  } catch {
    // No artwork when TMDB is unreachable (for example at build time without a token).
  }
  return catalogMetadata({ title: "Browse", description: DESCRIPTION, canonical: "/browse", image });
}

export default function BrowsePage() {
  return (
    <div className={catalogPage}>
      <h1 className={catalogTitle}>Browse</h1>
      <p className="mt-2 flex h-5 items-center text-sm text-muted-foreground">
        Find titles by service, network or studio.
      </p>

      <section aria-labelledby="browse-services" className="mt-8 md:mt-10">
        <SectionHeader id="browse-services" title="Streaming services" description={<JustWatchCredit />} />
        <ul role="list" className="mt-5 grid grid-cols-3 gap-x-3 gap-y-5 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
          {CURATED_PROVIDERS.map((provider) => (
            <li key={provider.slug}>
              <ProviderTile
                href={providerHref(provider.slug)}
                name={provider.name}
                logoPath={provider.logoPath}
                width="fill"
              />
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="browse-networks" className="mt-12 md:mt-16">
        <SectionHeader id="browse-networks" title="Networks" />
        <ul role="list" className="mt-5 flex flex-wrap gap-3">
          {CURATED_NETWORKS.map((network) => (
            <li key={network.slug}>
              <LogoChip
                name={network.name}
                logoPath={network.logoPath}
                href={networkHref(network.networkId, network.name)}
              />
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="browse-studios" className="mt-12 md:mt-16">
        <SectionHeader id="browse-studios" title="Studios" />
        <ul role="list" className="mt-5 flex flex-wrap gap-3">
          {CURATED_STUDIOS.map((studio) => (
            <li key={studio.slug}>
              <LogoChip
                name={studio.name}
                logoPath={studio.logoPath}
                href={companyHref(studio.companyId, studio.name)}
              />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
