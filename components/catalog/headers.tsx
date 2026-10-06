import Image from "next/image";
import { GlobeHemisphereWestIcon } from "@phosphor-icons/react/dist/ssr";

import { LogoChip } from "@/components/ds/logo-chip";
import { tmdbImage } from "@/lib/tmdb-image";

import { countryName } from "./country";
import { JustWatchCredit } from "./justwatch-credit";
import { entityTitle } from "./styles";

export interface ProviderHeaderProps {
  name: string;
  /** TMDB watch-provider logo_path (a square app icon). */
  logoPath: string | null;
}

/**
 * Streaming provider header: 56px logo, h1 and the JustWatch credit TMDB's
 * terms ask for. Server component.
 */
export function ProviderHeader({ name, logoPath }: ProviderHeaderProps) {
  const logo = tmdbImage(logoPath);

  return (
    <header>
      <div className="flex items-center gap-4">
        <span className="relative block size-14 shrink-0 overflow-hidden rounded-media bg-muted">
          {logo ? <Image src={logo} alt="" fill sizes="56px" className="object-cover" /> : null}
        </span>
        <h1 className={entityTitle}>{name}</h1>
      </div>
      <div className="mt-4">
        <JustWatchCredit className="text-[13px] leading-5 text-subtle-foreground" />
      </div>
    </header>
  );
}

export interface EntityHeaderProps {
  name: string;
  /** TMDB company or network logo_path. Without one only the name shows. */
  logoPath: string | null;
  /** ISO 3166-1 code, shown as a country name. */
  originCountry: string | null;
}

/**
 * Studio and network header: the logo chip, the h1 and the country the
 * company or network comes from. The chip is decorative here (the h1 already
 * names it), so it is hidden from screen readers.
 */
export function EntityHeader({ name, logoPath, originCountry }: EntityHeaderProps) {
  const country = countryName(originCountry);

  return (
    <header className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-5">
      {logoPath ? (
        <span aria-hidden="true" className="shrink-0">
          <LogoChip name={name} logoPath={logoPath} />
        </span>
      ) : null}
      <div className="min-w-0">
        <h1 className={entityTitle}>{name}</h1>
        {country ? (
          <p className="mt-1 flex h-5 items-center gap-1.5 text-sm text-muted-foreground">
            <GlobeHemisphereWestIcon size={16} aria-hidden="true" className="shrink-0" />
            {country}
          </p>
        ) : null}
      </div>
    </header>
  );
}
