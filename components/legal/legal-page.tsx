import Link from "next/link";
import type { ReactNode } from "react";

import { CONTACT_EMAIL, LEGAL_UPDATED, LEGAL_UPDATED_ISO } from "@/lib/legal";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const textLink = `inline-flex min-h-11 items-center rounded-full font-medium text-foreground underline decoration-border underline-offset-4 transition-colors duration-150 ease-out hover:text-primary hover:decoration-primary md:min-h-0 ${focusRing}`;

/** An inline link inside legal text. Internal paths use next/link; anything else opens a new tab. */
export function LegalLink({ href, children }: { href: string; children: ReactNode }) {
  if (href.startsWith("/")) {
    return (
      <Link href={href} className={textLink}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={textLink}>
      {children}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

/** The contact address as a mailto link. Render it only when CONTACT_EMAIL is set. */
export function ContactLink() {
  if (!CONTACT_EMAIL) return null;
  return (
    <a
      href={`mailto:${CONTACT_EMAIL}`}
      className={`rounded-full font-medium text-foreground underline decoration-border underline-offset-4 transition-colors duration-150 ease-out hover:text-primary hover:decoration-primary ${focusRing}`}
    >
      {CONTACT_EMAIL}
    </a>
  );
}

/**
 * One text column: title, "Last updated" line, a short lead, then numbered sections. Same
 * shape as the terms and privacy pages the site was modelled on, set in the site's own type.
 */
export function LegalPage({
  title,
  lead,
  children,
}: {
  title: string;
  lead: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-[1440px] px-gutter pb-16 pt-8 md:pt-12">
      <article className="max-w-[65ch]">
        <h1 className="type-display-md text-foreground">{title}</h1>
        <p className="mt-3 text-sm text-subtle-foreground">
          Last updated: <time dateTime={LEGAL_UPDATED_ISO}>{LEGAL_UPDATED}</time>
        </p>
        <div className="mt-6 space-y-4 text-base leading-relaxed text-muted-foreground">{lead}</div>

        <div className="mt-10 grid gap-10">{children}</div>

        <p className="mt-12 border-t border-border pt-6 text-sm leading-relaxed text-subtle-foreground">
          {CONTACT_EMAIL ? (
            <>
              Questions about this page: <ContactLink />.{" "}
            </>
          ) : null}
          Also see our <LegalLink href="/legal/terms">Terms of Service</LegalLink>,{" "}
          <LegalLink href="/legal/privacy">Privacy Policy</LegalLink> and{" "}
          <LegalLink href="/about">credits</LegalLink>.
        </p>
      </article>
    </div>
  );
}

/** A numbered section. Pass the number so the order reads the same as on the pages we copied. */
export function LegalSection({
  id,
  number,
  title,
  children,
}: {
  id: string;
  number: number;
  title: string;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="border-t border-border pt-8">
      <h2 id={id} className="type-section text-foreground">
        <span className="tabular-nums text-subtle-foreground">{number}.</span> {title}
      </h2>
      <div className="mt-4 space-y-4 text-base leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}

/** Bold key sentence inside legal text. */
export function Key({ children }: { children: ReactNode }) {
  return <strong className="font-semibold text-foreground">{children}</strong>;
}

export function LegalList({ children }: { children: ReactNode }) {
  return <ul className="list-disc space-y-2 pl-5 marker:text-subtle-foreground">{children}</ul>;
}
