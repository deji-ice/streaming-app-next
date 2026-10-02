import Image from "next/image";
import type { ReactNode } from "react";

import { tmdbImage } from "@/lib/tmdb-image";

import { headerGrid } from "./layout-classes";

export interface TitleLogo {
  path: string;
  width: number;
  height: number;
}

export interface TitleHeaderProps {
  title: string;
  posterPath: string | null;
  /** Title logo from TMDB images. When present it replaces the visible title; the h1 stays for assistive tech. */
  logo: TitleLogo | null;
  tagline?: string | null;
  /** Usually a MetaRow. */
  meta?: ReactNode;
  /** Usually a Rating. */
  rating?: ReactNode;
  /** The action buttons row. */
  actions?: ReactNode;
}

/** Logos are shown at most 96px tall; the sizes hint follows from the logo's aspect ratio. */
const LOGO_MAX_HEIGHT = 96;

function logoSizes(logo: TitleLogo): string {
  const width = Math.round((LOGO_MAX_HEIGHT * logo.width) / logo.height);
  return `${Math.min(560, Math.max(120, width))}px`;
}

/**
 * Poster beside the title block (logo or h1, tagline, meta, rating), with the
 * actions on their own row. Shared by the movie and series pages.
 */
export function TitleHeader({ title, posterPath, logo, tagline, meta, rating, actions }: TitleHeaderProps) {
  const poster = tmdbImage(posterPath);
  const logoSrc = logo && logo.width > 0 && logo.height > 0 ? tmdbImage(logo.path) : null;

  return (
    <header className={headerGrid}>
      <div className="relative aspect-[2/3] w-full self-start overflow-hidden rounded-media bg-muted lg:row-span-2">
        {poster ? (
          <Image
            src={poster}
            alt=""
            fill
            sizes="(min-width:1024px) 220px, (min-width:768px) 140px, 96px"
            className="object-cover"
          />
        ) : (
          <span
            aria-hidden="true"
            className="absolute inset-0 flex items-center justify-center p-3 text-center text-[13px] leading-snug text-subtle-foreground"
          >
            <span className="line-clamp-4">{title}</span>
          </span>
        )}
      </div>

      <div className="min-w-0">
        {logo && logoSrc ? (
          <>
            <h1 className="sr-only">{title}</h1>
            <Image
              src={logoSrc}
              alt=""
              width={logo.width}
              height={logo.height}
              sizes={logoSizes(logo)}
              className="h-auto max-h-16 w-auto max-w-full object-contain object-left sm:max-h-20 md:max-h-24"
            />
          </>
        ) : (
          <h1 className="type-display-lg text-balance text-foreground">{title}</h1>
        )}
        {tagline ? <p className="mt-2 text-[17px] leading-snug text-muted-foreground">{tagline}</p> : null}
        {meta ? <div className="mt-3">{meta}</div> : null}
        {rating ? <div className="mt-2">{rating}</div> : null}
      </div>

      {actions ? <div className="col-span-2 lg:col-span-1 lg:col-start-2">{actions}</div> : null}
    </header>
  );
}
