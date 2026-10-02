import {
  ArrowUpRightIcon,
  FacebookLogoIcon,
  InstagramLogoIcon,
  TiktokLogoIcon,
  XLogoIcon,
  YoutubeLogoIcon,
} from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import type { ReactNode } from "react";

import { focusRing } from "@/components/ds/classes";
import { formatDate, getAge, getInitials } from "@/lib/format";
import { tmdbImage } from "@/lib/tmdb-image";
import type { PersonDTO } from "@/lib/tmdb/types";
import { cn } from "@/lib/utils";

import { Biography } from "./biography";
import { imdbHref, socialLinks, splitBiography, websiteHref, type SocialKey } from "./profile";

/** Portrait widths: 120px column below sm, 200px from sm, 260px from lg. */
const PORTRAIT_SIZES = "(min-width:1024px) 260px, (min-width:640px) 200px, 120px";

export type PersonHeaderData = Pick<
  PersonDTO,
  | "name"
  | "profilePath"
  | "knownForDepartment"
  | "birthday"
  | "deathday"
  | "placeOfBirth"
  | "alsoKnownAs"
  | "externalIds"
  | "homepage"
  | "biography"
>;

const linkBase =
  "inline-flex items-center justify-center rounded-full border border-border bg-card text-foreground transition-[transform,background-color] duration-150 ease-out hover:bg-accent active:scale-[0.98]";

function SocialIcon({ name }: { name: SocialKey }) {
  const props = { size: 20, "aria-hidden": true } as const;
  switch (name) {
    case "instagram":
      return <InstagramLogoIcon {...props} />;
    case "x":
      return <XLogoIcon {...props} />;
    case "tiktok":
      return <TiktokLogoIcon {...props} />;
    case "facebook":
      return <FacebookLogoIcon {...props} />;
    case "youtube":
      return <YoutubeLogoIcon {...props} />;
  }
}

function Portrait({ name, profilePath }: { name: string; profilePath: string | null }) {
  const src = tmdbImage(profilePath);

  return (
    <div className="relative aspect-[2/3] w-full overflow-hidden rounded-media bg-muted sm:row-span-2">
      {src ? (
        <Image
          src={src}
          alt=""
          fill
          priority
          sizes={PORTRAIT_SIZES}
          className="object-cover object-top"
        />
      ) : (
        <span aria-hidden="true" className="absolute inset-0 flex items-center justify-center">
          <span className="flex aspect-square w-1/2 items-center justify-center rounded-full bg-accent font-display text-2xl font-bold text-muted-foreground sm:text-5xl">
            {getInitials(name)}
          </span>
        </span>
      )}
    </div>
  );
}

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <>
      <dt className="text-[13px] leading-5 text-subtle-foreground">{label}</dt>
      <dd className="min-w-0 text-sm leading-5 text-foreground">{children}</dd>
    </>
  );
}

/**
 * Portrait, name, "Known for", facts, external links and biography.
 * Grid: portrait beside the name on phones (120px), 200px from sm, 260px from lg.
 */
export function PersonHeader({ person }: { person: PersonHeaderData }) {
  const { name, knownForDepartment, birthday, deathday, placeOfBirth, externalIds } = person;

  const age = getAge(birthday, deathday);
  const born = formatDate(birthday, "long");
  const died = formatDate(deathday, "long");
  const knownAs = person.alsoKnownAs
    .filter((alias) => alias.trim() !== "" && alias.trim().toLowerCase() !== name.toLowerCase())
    .slice(0, 2);

  const socials = socialLinks(externalIds);
  const imdb = imdbHref(externalIds.imdbId);
  const website = websiteHref(person.homepage);
  const hasLinks = socials.length > 0 || imdb !== null || website !== null;
  const hasFacts = born !== null || placeOfBirth !== null || died !== null || knownAs.length > 0;
  const paragraphs = splitBiography(person.biography);

  return (
    <header className="grid grid-cols-[120px_minmax(0,1fr)] gap-x-4 gap-y-6 sm:grid-cols-[200px_minmax(0,1fr)] sm:grid-rows-[auto_1fr] sm:gap-x-8 sm:gap-y-5 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-x-10">
      <Portrait name={name} profilePath={person.profilePath} />

      <div className="min-w-0 self-center sm:self-start">
        <h1 className="type-display-lg text-balance text-foreground">{name}</h1>
        {knownForDepartment ? (
          <p className="mt-2 text-base text-muted-foreground">Known for {knownForDepartment}</p>
        ) : null}
      </div>

      <div className="col-span-2 min-w-0 sm:col-span-1">
        {hasFacts ? (
          <dl className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-x-4 gap-y-2">
            {born ? (
              <Fact label="Born">
                {born}
                {!deathday && age !== null ? <span className="text-subtle-foreground"> (age {age})</span> : null}
              </Fact>
            ) : null}
            {placeOfBirth ? <Fact label="Birthplace">{placeOfBirth}</Fact> : null}
            {died ? (
              <Fact label="Died">
                {died}
                {age !== null ? <span className="text-subtle-foreground"> (aged {age})</span> : null}
              </Fact>
            ) : null}
            {knownAs.length > 0 ? <Fact label="Also known as">{knownAs.join(", ")}</Fact> : null}
          </dl>
        ) : null}

        {hasLinks ? (
          <ul aria-label={`${name} on the web`} className={cn("flex flex-wrap gap-2", hasFacts && "mt-5")}>
            {socials.map((link) => (
              <li key={link.key}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${name} on ${link.label} (opens in a new tab)`}
                  className={cn(linkBase, "size-11", focusRing)}
                >
                  <SocialIcon name={link.key} />
                </a>
              </li>
            ))}
            {imdb ? (
              <li>
                <a
                  href={imdb}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${name} on IMDb (opens in a new tab)`}
                  className={cn(linkBase, "h-11 gap-1.5 px-4 text-sm font-medium", focusRing)}
                >
                  IMDb
                  <ArrowUpRightIcon size={16} aria-hidden="true" />
                </a>
              </li>
            ) : null}
            {website ? (
              <li>
                <a
                  href={website}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${name} official website (opens in a new tab)`}
                  className={cn(linkBase, "h-11 gap-1.5 px-4 text-sm font-medium", focusRing)}
                >
                  Website
                  <ArrowUpRightIcon size={16} aria-hidden="true" />
                </a>
              </li>
            ) : null}
          </ul>
        ) : null}

        {paragraphs.length > 0 ? (
          <Biography paragraphs={paragraphs} className={hasFacts || hasLinks ? "mt-6" : undefined} />
        ) : null}
      </div>
    </header>
  );
}
