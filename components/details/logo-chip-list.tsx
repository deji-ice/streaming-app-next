import { LogoChip } from "@/components/ds/logo-chip";
import { SectionHeader } from "@/components/ds/section-header";

export interface LogoChipItem {
  id: number;
  name: string;
  logoPath: string | null;
  /** companyHref(...) or networkHref(...). */
  href: string;
}

export interface LogoChipListProps {
  /** Section heading, for example "Production" or "Network". */
  title: string;
  /** Unique id for the heading (aria-labelledby). */
  headingId: string;
  items: readonly LogoChipItem[];
  /** Most chips shown; the rest are dropped. */
  limit?: number;
}

/** A small headed list of LogoChips (production companies, networks). Renders nothing when empty. */
export function LogoChipList({ title, headingId, items, limit = 6 }: LogoChipListProps) {
  const shown = items.slice(0, limit);
  if (shown.length === 0) return null;

  return (
    <section aria-labelledby={headingId}>
      <SectionHeader as="h3" id={headingId} title={title} />
      <ul className="mt-3 flex flex-wrap gap-2">
        {shown.map((item) => (
          <li key={item.id}>
            <LogoChip name={item.name} logoPath={item.logoPath} href={item.href} />
          </li>
        ))}
      </ul>
    </section>
  );
}
