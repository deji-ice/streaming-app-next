import type { Metadata } from "next";
import Image from "next/image";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { TMDB_NOTICE } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "About",
  description:
    "About StreamScapeX and the data sources it credits: TMDB, JustWatch and Wikidata.",
  alternates: { canonical: "/about" },
};

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const textLink = `inline-flex min-h-11 items-center gap-1 rounded-full font-medium text-foreground underline decoration-border underline-offset-4 transition-colors duration-150 ease-out hover:text-primary hover:decoration-primary md:min-h-0 ${focusRing}`;

function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={textLink}>
      {children}
      <ArrowUpRight size={16} aria-hidden="true" />
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  );
}

function CreditSection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="border-t border-border pt-8">
      <h2 id={id} className="type-section text-foreground">
        {title}
      </h2>
      <div className="mt-4 max-w-[65ch] space-y-4 text-base leading-relaxed text-muted-foreground">
        {children}
      </div>
    </section>
  );
}

export default function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-[1440px] px-gutter pb-16 pt-8 md:pt-12">
      <div className="max-w-[65ch]">
        <h1 className="type-display-md text-foreground">About and credits</h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          StreamScapeX is a personal project for browsing movies, series and the
          people who make them: what is trending, what is popular, who made it and
          where it is streaming. It was built for educational, demonstration and
          portfolio purposes and does not host any content.
        </p>
      </div>

      <div className="mt-12 grid gap-10 md:mt-16">
        <CreditSection id="credits-tmdb" title="Movie and TV data">
          <a
            href="https://www.themoviedb.org"
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex min-h-11 items-center rounded-media ${focusRing}`}
          >
            <Image
              src="/brand/tmdb/tmdb-alt-short-blue.svg"
              alt="The Movie Database (TMDB), opens in a new tab"
              width={123}
              height={16}
              unoptimized
              className="h-4 w-auto"
            />
          </a>
          <p>{TMDB_NOTICE}</p>
          <p>
            Titles, artwork, cast, crew, ratings and release information come from
            The Movie Database.{" "}
            <ExternalLink href="https://www.themoviedb.org">Visit TMDB</ExternalLink>
          </p>
        </CreditSection>

        <CreditSection id="credits-justwatch" title="Streaming availability">
          <a
            href="https://www.justwatch.com"
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex min-h-11 items-center rounded-media ${focusRing}`}
          >
            <Image
              src="/brand/justwatch/justwatch.svg"
              alt="JustWatch, opens in a new tab"
              width={121}
              height={18}
              unoptimized
              className="h-[18px] w-auto"
            />
          </a>
          <p>Streaming availability data is provided by JustWatch.</p>
        </CreditSection>

        <CreditSection id="credits-wikidata" title="Facts">
          <p>
            Facts from Wikidata, available under CC0.{" "}
            <ExternalLink href="https://www.wikidata.org">Visit Wikidata</ExternalLink>
          </p>
        </CreditSection>

        <CreditSection id="credits-trademarks" title="Trademarks">
          <p>All trademarks, logos and images belong to their respective owners.</p>
          <p>
            StreamScapeX does not host any content; it utilizes TMDB API for
            metadata and external services for streaming. No copyright
            infringement is intended.
          </p>
        </CreditSection>
      </div>
    </div>
  );
}
