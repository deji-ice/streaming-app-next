import Image from "next/image";

import { tmdbImage } from "@/lib/tmdb-image";
import { cn } from "@/lib/utils";

import { groupFocusRing, pressable } from "./classes";
import { IntentLink } from "./intent-link";

export interface LogoChipProps {
  name: string;
  /** TMDB company or network logo_path. Null falls back to the name as text. */
  logoPath: string | null;
  /** Optional link, for example companyHref(id, name) or networkHref(id, name). */
  href?: string;
  className?: string;
}

/**
 * Company and network logos are often dark artwork on transparency, so they
 * sit unmodified on a light chip. Without a logo the name is shown as text on
 * a dark chip with a hairline. Server-safe.
 */
export function LogoChip({ name, logoPath, href, className }: LogoChipProps) {
  const src = tmdbImage(logoPath);
  const interactive = Boolean(href);

  const chip = src ? (
    <span
      title={interactive ? undefined : name}
      className={cn(
        "flex h-14 w-[172px] items-center justify-center rounded-media bg-foreground px-4 transition-colors duration-150 ease-out",
        interactive && "group-hover:bg-foreground/85",
        interactive && groupFocusRing,
        !interactive && className,
      )}
    >
      <span className="relative block h-8 w-full max-w-[140px]">
        <Image src={src} alt={name} fill sizes="140px" className="object-contain" />
      </span>
    </span>
  ) : (
    <span
      className={cn(
        "flex h-14 min-w-[172px] max-w-[260px] items-center justify-center rounded-media border border-border bg-card px-4 text-center text-sm font-medium text-foreground transition-colors duration-150 ease-out",
        interactive && "group-hover:bg-accent",
        interactive && groupFocusRing,
        !interactive && className,
      )}
    >
      <span className="line-clamp-1">{name}</span>
    </span>
  );

  if (!href) return chip;

  return (
    <IntentLink
      href={href}
      className={cn("group inline-flex rounded-media focus-visible:outline-none", pressable, className)}
    >
      {chip}
    </IntentLink>
  );
}
