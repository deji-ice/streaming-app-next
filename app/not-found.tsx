import type { Metadata } from "next";
import Link from "next/link";
import {
  FilmSlate,
  House,
  MagnifyingGlass,
  Television,
} from "@phosphor-icons/react/dist/ssr";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
};

const LINKS = [
  { label: "Home", href: "/", Icon: House },
  { label: "Movies", href: "/movie", Icon: FilmSlate },
  { label: "Series", href: "/series", Icon: Television },
  { label: "Search", href: "/search", Icon: MagnifyingGlass },
] as const;

const pill =
  "inline-flex h-11 items-center gap-2 rounded-full px-5 text-sm font-medium transition-[background-color,color,transform] duration-150 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export default function NotFound() {
  return (
    <div className="mx-auto w-full max-w-[1440px] px-gutter pb-20 pt-12 md:pt-20">
      <div className="max-w-[60ch]">
        <p className="text-[13px] font-medium text-subtle-foreground tabular-nums">
          Error 404
        </p>
        <h1 className="mt-2 type-display-md text-foreground">Page not found</h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          The page you are looking for does not exist or has moved.
        </p>
      </div>

      <nav aria-label="Suggested pages" className="mt-8">
        <ul className="flex flex-wrap gap-3">
          {LINKS.map(({ label, href, Icon }, index) => (
            <li key={href}>
              <Link
                href={href}
                className={
                  index === 0
                    ? `${pill} bg-primary text-primary-foreground hover:bg-primary-hover`
                    : `${pill} border border-border bg-card text-foreground hover:bg-accent`
                }
              >
                <Icon size={20} weight={index === 0 ? "fill" : "regular"} aria-hidden="true" />
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
