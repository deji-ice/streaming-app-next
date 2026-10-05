import { FilmSlateIcon } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";

import { EmptyState } from "@/components/ds/empty-state";
import { SectionHeader } from "@/components/ds/section-header";
import { CreditRails } from "@/components/person/credit-rails";
import { buildFilmography, countTitles } from "@/components/person/credits";
import { Filmography } from "@/components/person/filmography";
import { PersonHeader } from "@/components/person/person-header";
import { describePerson } from "@/components/person/profile";
import { parseIdFromSlug, personHref } from "@/lib/slug";
import { isTmdbNotFound } from "@/lib/tmdb/client";
import { getPerson } from "@/lib/tmdb/details";
import { isoDay } from "@/lib/tmdb/lists";
import type { PersonDTO } from "@/lib/tmdb/types";
import { tmdbImage } from "@/lib/tmdb-image";

/** Person data changes slowly; the loader caches for 7 days and the page is rebuilt daily. */
export const revalidate = 86400;

/** Nothing is prebuilt: each person page is generated on first request, then cached. */
export function generateStaticParams() {
  return [];
}

type PageProps = { params: Promise<{ slug: string }> };

/** Reads the id from the slug and loads the person. Only a real TMDB 404 becomes notFound(). */
async function loadPerson(slug: string): Promise<PersonDTO> {
  const id = parseIdFromSlug(slug);
  if (id === null) notFound();
  try {
    return await getPerson(id);
  } catch (error) {
    if (isTmdbNotFound(error)) notFound();
    throw error;
  }
}

function decodeSegment(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const person = await loadPerson(slug);

  const canonical = personHref(person.id, person.name);
  const description = describePerson(person.name, person.biography);
  const portrait = tmdbImage(person.profilePath, "w500");
  // openGraph and twitter replace the root layout's objects, so they carry their own image.
  const images = portrait
    ? [{ url: portrait, width: 500, height: 750, alt: person.name }]
    : [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "StreamScapeX" }];

  return {
    title: person.name,
    description,
    alternates: { canonical },
    openGraph: {
      type: "profile",
      title: person.name,
      description,
      url: canonical,
      siteName: "StreamScapeX",
      locale: "en_US",
      images,
    },
    twitter: {
      card: portrait ? "summary" : "summary_large_image",
      title: person.name,
      description,
      images: images.map((image) => image.url),
    },
  };
}

export default async function PersonPage({ params }: PageProps) {
  const { slug } = await params;
  const person = await loadPerson(slug);

  // One URL per person: /person/{name-slug}-{id}. Old, partial or differently cased slugs redirect.
  const canonical = personHref(person.id, person.name);
  if (`/person/${decodeSegment(slug)}` !== canonical) permanentRedirect(canonical);

  const departments = buildFilmography(person.credits, {
    today: isoDay(0),
    primaryDepartment: person.knownForDepartment,
  });
  const titleCount = countTitles(person.credits);

  return (
    <div className="pb-12 md:pb-16">
      <div className="mx-auto w-full max-w-[1440px] px-gutter pb-4 pt-6 md:pb-6 md:pt-10">
        <PersonHeader person={person} />
      </div>

      <CreditRails upcoming={person.upcoming} latest={person.latest} knownFor={person.knownFor} />

      <section
        aria-labelledby="filmography-heading"
        className="mx-auto mt-6 w-full max-w-[1440px] px-gutter md:mt-10"
      >
        <SectionHeader
          id="filmography-heading"
          title="Filmography"
          description={departments.length > 0 ? `${titleCount} ${titleCount === 1 ? "title" : "titles"}` : undefined}
        />
        {departments.length > 0 ? (
          <Filmography departments={departments} className="mt-4 md:mt-5" />
        ) : (
          <EmptyState
            className="mt-4 md:mt-5"
            icon={<FilmSlateIcon size={40} weight="duotone" />}
            title="No credits listed"
            body={`No movie or series credits are listed for ${person.name} yet.`}
            as="h3"
          />
        )}
      </section>
    </div>
  );
}
