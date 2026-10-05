import Image from "next/image";
import Link from "next/link";

const EXPLORE_LINKS = [
  { label: "Home", href: "/" },
  { label: "Movies", href: "/movie" },
  { label: "Series", href: "/series" },
  { label: "Browse", href: "/browse" },
  { label: "Search", href: "/search" },
] as const;

const INFO_LINKS = [{ label: "About and credits", href: "/about" }] as const;

export const TMDB_NOTICE =
  "This website uses TMDB and the TMDB APIs but is not endorsed, certified, or otherwise approved by TMDB.";

const linkClass =
  "inline-flex min-h-11 items-center rounded-full text-sm text-muted-foreground transition-colors duration-150 ease-out hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background md:min-h-8";

function LinkColumn({
  label,
  links,
}: {
  label: string;
  links: ReadonlyArray<{ label: string; href: string }>;
}) {
  return (
    <nav aria-label={label}>
      <p className="text-[13px] font-semibold text-foreground">{label}</p>
      <ul className="mt-2">
        {links.map((item) => (
          <li key={item.href}>
            <Link href={item.href} className={linkClass}>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-12 border-t border-border bg-background md:mt-16">
      <div className="mx-auto max-w-[1440px] px-gutter py-10 md:py-12">
        {/* Row 1: brand + link columns */}
        <div className="grid gap-8 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:gap-12 lg:gap-20">
          <div>
            <p className="font-display text-xl font-extrabold leading-none tracking-tight text-foreground [font-stretch:80%]">
              StreamScape<span className="text-primary">X</span>
            </p>
            <p className="mt-3 max-w-[40ch] text-sm text-muted-foreground">
              Browse movies, series and the people who make them.
            </p>
          </div>
          <LinkColumn label="Explore" links={EXPLORE_LINKS} />
          <LinkColumn label="Info" links={INFO_LINKS} />
        </div>

        {/* Row 2: TMDB attribution */}
        <div className="mt-8 flex flex-col gap-2 border-t border-border pt-6 sm:flex-row sm:items-center sm:gap-4">
          <a
            href="https://www.themoviedb.org"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 shrink-0 items-center self-start rounded-media focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:self-auto md:min-h-8"
          >
            <Image
              src="/brand/tmdb/tmdb-alt-short-blue.svg"
              alt="The Movie Database (TMDB), opens in a new tab"
              width={92}
              height={12}
              unoptimized
              className="h-3 w-auto"
            />
          </a>
          <p className="text-[13px] text-subtle-foreground">{TMDB_NOTICE}</p>
        </div>

        {/* Row 3: copyright + disclaimer */}
        <div className="mt-6 space-y-2">
          <p className="text-[13px] text-subtle-foreground tabular-nums">
            © {year} StreamScapeX
          </p>
          <p className="max-w-[110ch] text-xs leading-relaxed text-subtle-foreground">
            <strong className="font-semibold text-muted-foreground">DISCLAIMER:</strong>{" "}
            This website is a personal project created for educational,
            demonstration, and portfolio purposes only. StreamScapeX does not host
            any content; it utilizes TMDB API for metadata and external services for
            streaming. No copyright infringement is intended.
          </p>
        </div>
      </div>
    </footer>
  );
}
