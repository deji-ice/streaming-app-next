import { ArrowUpRightIcon } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";

import { focusRing, pressable } from "@/components/ds/classes";
import { IntentLink } from "@/components/ds/intent-link";
import { SectionHeader } from "@/components/ds/section-header";
import { providerHref } from "@/lib/slug";
import { tmdbImage } from "@/lib/tmdb-image";
import type { ProviderDTO, WatchProvidersDTO } from "@/lib/tmdb/types";
import { cn } from "@/lib/utils";

interface ListedProvider extends ProviderDTO {
  /** How the title is offered, for the accessible name. */
  offer: "subscription" | "free" | "free with ads";
}

/**
 * One key per service brand, so plan variants collapse into one logo:
 * "Amazon Prime Video", "Amazon Prime Video with Ads" and "Prime Video Free
 * with Ads" are all "prime video"; "Netflix Standard with Ads" is "netflix";
 * "HBO Max Amazon Channel" is "hbo max".
 */
export function providerBrandKey(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+(amazon|apple tv|roku premium)\s+channel$/, "")
    .replace(/\s+(standard|basic|free)?\s*with\s+ads$/, "")
    .replace(/^amazon\s+/, "")
    .trim();
}

/** True when the region lists any way to watch (stream, free, ads, rent or buy). */
export function hasWatchOptions(providers: WatchProvidersDTO | null): boolean {
  if (!providers) return false;
  return (
    providers.flatrate.length + providers.free.length + providers.ads.length + providers.rent.length + providers.buy.length >
    0
  );
}

/**
 * Subscription services first, then free, then free with ads. One entry per
 * service brand: the first (subscription) offer wins, so plan variants of the
 * same service never show as separate logos.
 */
function streamingProviders(providers: WatchProvidersDTO): ListedProvider[] {
  const seen = new Set<string>();
  const out: ListedProvider[] = [];
  const add = (list: ProviderDTO[], offer: ListedProvider["offer"]) => {
    for (const provider of list) {
      const key = providerBrandKey(provider.name);
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ ...provider, offer });
    }
  };
  add(providers.flatrate, "subscription");
  add(providers.free, "free");
  add(providers.ads, "free with ads");
  return out;
}

const creditLink =
  "inline-flex min-h-11 items-center gap-1 rounded-full text-[13px] text-subtle-foreground transition-colors duration-150 ease-out [@media(hover:hover)]:hover:text-foreground md:min-h-8";

export interface StreamingOnProps {
  /** selectWatchProviders(dto.watchProviders, region); null when TMDB has nothing for the region. */
  providers: WatchProvidersDTO | null;
  /** Shown under the heading, for example "In the United States". */
  regionLabel: string;
}

/**
 * "Streaming on": provider logos (subscription first, then free), each linking
 * to its /browse page when the service is curated, plus the JustWatch credit
 * and the TMDB watch page. Renders nothing when the region has no offers at all.
 */
export function StreamingOn({ providers, regionLabel }: StreamingOnProps) {
  if (!providers) return null;
  const streaming = streamingProviders(providers);
  const rentOrBuy = providers.rent.length + providers.buy.length > 0;
  if (streaming.length === 0 && !rentOrBuy) return null;

  return (
    <section aria-labelledby="streaming-on-heading">
      <SectionHeader as="h3" id="streaming-on-heading" title="Streaming on" description={regionLabel} />

      {streaming.length > 0 ? (
        <ul className="-mx-0.5 mt-3 flex flex-wrap gap-1">
          {streaming.map((provider) => {
            const src = tmdbImage(provider.logoPath);
            const name = `${provider.name}, ${provider.offer}`;
            const logo = (
              <span className="relative block size-10 overflow-hidden rounded-media bg-muted">
                {src ? (
                  <Image
                    src={src}
                    alt={provider.slug ? "" : name}
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                ) : (
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 flex items-center justify-center p-0.5 text-center text-[11px] leading-tight text-subtle-foreground"
                  >
                    <span className="line-clamp-3">{provider.name}</span>
                  </span>
                )}
              </span>
            );
            return (
              <li key={provider.id}>
                {provider.slug ? (
                  <IntentLink
                    href={providerHref(provider.slug)}
                    aria-label={name}
                    title={name}
                    className={cn(
                      "inline-flex size-11 items-center justify-center rounded-media transition-opacity duration-150 ease-out [@media(hover:hover)]:hover:opacity-80",
                      pressable,
                      focusRing,
                    )}
                  >
                    {logo}
                  </IntentLink>
                ) : (
                  <span title={name} className="inline-flex size-11 items-center justify-center">
                    {logo}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-muted-foreground">
          No subscription or free streaming listed. It can be rented or bought.
        </p>
      )}

      <div className="mt-1 flex flex-wrap items-center gap-x-4">
        <p className="flex flex-wrap items-center gap-x-1 text-[13px] text-subtle-foreground">
          Availability data by
          <a
            href="https://www.justwatch.com"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(creditLink, "text-muted-foreground underline underline-offset-2", focusRing)}
          >
            JustWatch
            <span className="sr-only">, opens in a new tab</span>
          </a>
        </p>
        {providers.link ? (
          <a
            href={providers.link}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(creditLink, "text-muted-foreground", focusRing)}
          >
            All options
            <ArrowUpRightIcon size={14} aria-hidden="true" />
            <span className="sr-only">, opens in a new tab</span>
          </a>
        ) : null}
      </div>
    </section>
  );
}
