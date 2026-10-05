import {
  ArrowUpRightIcon,
  BookOpenTextIcon,
  CurrencyDollarSimpleIcon,
  FilmSlateIcon,
  GlobeHemisphereWestIcon,
  InfoIcon,
  MapPinIcon,
  MusicNotesIcon,
  TelevisionIcon,
  TrophyIcon,
  VideoCameraIcon,
} from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";

import { SectionHeader } from "@/components/ds/section-header";
import { getFacts, type FactsTmdbInput } from "@/lib/facts";
import type { Fact, FactIcon } from "@/lib/tmdb/types";

/** Fact.icon is a Phosphor icon name (spec section 3); this maps it to the component. */
const FACT_ICONS: Record<FactIcon, Icon> = {
  Trophy: TrophyIcon,
  CurrencyDollarSimple: CurrencyDollarSimpleIcon,
  BookOpenText: BookOpenTextIcon,
  MapPin: MapPinIcon,
  GlobeHemisphereWest: GlobeHemisphereWestIcon,
  MusicNotes: MusicNotesIcon,
  VideoCamera: VideoCameraIcon,
  FilmSlate: FilmSlateIcon,
  Television: TelevisionIcon,
  Info: InfoIcon,
};

function FactItem({ fact }: { fact: Fact }) {
  const FactGlyph = FACT_ICONS[fact.icon] ?? InfoIcon;

  return (
    <li className="grid grid-cols-[20px_minmax(0,1fr)_auto] items-start gap-x-3">
      <FactGlyph size={20} className="mt-0.5 text-muted-foreground" aria-hidden="true" />
      <div className="min-w-0">
        <p className="text-[13px] leading-5 text-subtle-foreground">{fact.label}</p>
        <p className="text-sm leading-5 text-foreground">{fact.value}</p>
      </div>
      <a
        href={fact.sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="-mr-2 inline-flex size-11 items-center justify-center rounded-full text-subtle-foreground transition-colors duration-150 ease-out hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background md:size-8"
      >
        <ArrowUpRightIcon size={16} aria-hidden="true" />
        <span className="sr-only">Source for {fact.label}, opens in a new tab</span>
      </a>
    </li>
  );
}

export interface FunFactsProps {
  type: "movie" | "tv";
  /** externalIds.wikidataId of the title. */
  wikidataId: string | null;
  /** The loaded MovieDTO or TvDTO. */
  tmdb: FactsTmdbInput;
}

/**
 * Fun facts for a title (Wikidata plus facts derived from TMDB). Async Server
 * Component: render it inside <Suspense fallback={<FunFactsSkeleton />}> (from
 * ./skeletons) so a slow Wikidata answer never blocks the page. Renders
 * nothing when there are no facts.
 */
export async function FunFacts({ type, wikidataId, tmdb }: FunFactsProps) {
  const facts = await getFacts({ type, wikidataId, tmdb });
  if (facts.length === 0) return null;

  return (
    <section aria-labelledby="fun-facts-heading">
      <SectionHeader as="h3" id="fun-facts-heading" title="Fun facts" />
      <ul className="mt-4 grid gap-x-8 gap-y-5 md:grid-cols-2">
        {facts.map((fact) => (
          <FactItem key={fact.id} fact={fact} />
        ))}
      </ul>
    </section>
  );
}
