"use client";

import { UsersThree } from "@phosphor-icons/react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import Image from "next/image";
import Link from "next/link";
import { useId, useMemo } from "react";

import { getInitials } from "@/lib/format";
import { personHref } from "@/lib/slug";
import { tmdbImage } from "@/lib/tmdb-image";
import { cn } from "@/lib/utils";

import { focusRing, focusRingPopover, pillBase, pillVariants } from "./classes";
import { Modal, ModalContent, ModalTrigger } from "./modal";

export interface CastMember {
  id: number;
  name: string;
  profilePath: string | null;
  character: string | null;
  order?: number;
}

export interface CrewMember {
  id: number;
  name: string;
  profilePath: string | null;
  job: string;
  department: string;
}

export interface CastCrewButtonProps {
  /** Media title, shown under the modal heading. */
  title: string;
  cast: CastMember[];
  crew: CrewMember[];
  /** Trigger label. Defaults to "Full cast & crew". */
  label?: string;
  className?: string;
}

const DEPARTMENT_ORDER = [
  "Directing",
  "Writing",
  "Production",
  "Creator",
  "Camera",
  "Editing",
  "Sound",
  "Art",
  "Costume & Make-Up",
  "Visual Effects",
  "Lighting",
  "Crew",
];

interface CrewGroup {
  department: string;
  people: Array<{ id: number; name: string; jobs: string[] }>;
}

/** Groups crew by department (known departments first), merging one person's jobs per department. */
function groupCrew(crew: CrewMember[]): CrewGroup[] {
  const groups = new Map<string, Map<number, { id: number; name: string; jobs: string[] }>>();
  for (const member of crew) {
    const department = member.department || "Crew";
    let people = groups.get(department);
    if (!people) {
      people = new Map();
      groups.set(department, people);
    }
    const existing = people.get(member.id);
    if (existing) {
      if (member.job && !existing.jobs.includes(member.job)) existing.jobs.push(member.job);
    } else {
      people.set(member.id, { id: member.id, name: member.name, jobs: member.job ? [member.job] : [] });
    }
  }
  const rank = (department: string) => {
    const index = DEPARTMENT_ORDER.indexOf(department);
    return index === -1 ? DEPARTMENT_ORDER.length : index;
  };
  return Array.from(groups.entries())
    .map(([department, people]) => ({ department, people: Array.from(people.values()) }))
    .sort((a, b) => rank(a.department) - rank(b.department) || a.department.localeCompare(b.department, "en-US"));
}

function Avatar({ name, profilePath }: { name: string; profilePath: string | null }) {
  const src = tmdbImage(profilePath);
  return (
    <span className="relative block size-12 shrink-0 overflow-hidden rounded-full bg-muted">
      {src ? (
        <Image src={src} alt="" fill sizes="48px" className="object-cover object-top" />
      ) : (
        <span
          aria-hidden="true"
          className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-subtle-foreground"
        >
          {getInitials(name)}
        </span>
      )}
    </span>
  );
}

const rowLink = cn(
  "group flex min-h-11 items-center gap-3 rounded-panel px-2 py-1.5 transition-colors duration-150 ease-out hover:bg-accent",
  focusRingPopover,
);

const tabTrigger = cn(
  "inline-flex min-h-11 items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-4 text-sm font-medium text-muted-foreground transition-colors duration-150 ease-out hover:text-foreground md:min-h-9",
  "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
  focusRingPopover,
);

/**
 * Secondary pill that opens a modal with the full credits: tabs Cast (n) and
 * Crew (n); crew grouped by department under h3 headings. Person rows link
 * to /person/{slug}-{id}. Null when both lists are empty.
 */
export function CastCrewButton({ title, cast, crew, label = "Full cast & crew", className }: CastCrewButtonProps) {
  const baseId = useId();
  const sortedCast = useMemo(
    () =>
      cast
        .map((member, index) => ({ member, index }))
        .sort((a, b) => (a.member.order ?? a.index) - (b.member.order ?? b.index))
        .map((entry) => entry.member),
    [cast],
  );
  const crewGroups = useMemo(() => groupCrew(crew), [crew]);
  const crewCount = useMemo(() => new Set(crew.map((member) => member.id)).size, [crew]);

  if (sortedCast.length === 0 && crew.length === 0) return null;

  return (
    <Modal>
      <ModalTrigger asChild>
        <button
          type="button"
          aria-haspopup="dialog"
          className={cn(pillBase, pillVariants.secondary, "h-11 px-4 md:h-10", focusRing, className)}
        >
          <UsersThree size={20} aria-hidden="true" />
          {label}
        </button>
      </ModalTrigger>
      <ModalContent
        size="lg"
        title="Cast and crew"
        description={title}
        bodyClassName="flex flex-col overflow-hidden p-0 sm:p-0"
      >
        <TabsPrimitive.Root
          defaultValue={sortedCast.length > 0 ? "cast" : "crew"}
          className="flex min-h-0 flex-col"
        >
          <div className="shrink-0 border-b border-border px-6 py-3 sm:px-8">
            <TabsPrimitive.List
              aria-label="Credits"
              className="inline-flex gap-1 rounded-full border border-border bg-card p-1"
            >
              <TabsPrimitive.Trigger value="cast" className={tabTrigger} disabled={sortedCast.length === 0}>
                Cast <span className="tabular-nums">({sortedCast.length})</span>
              </TabsPrimitive.Trigger>
              <TabsPrimitive.Trigger value="crew" className={tabTrigger} disabled={crew.length === 0}>
                Crew <span className="tabular-nums">({crewCount})</span>
              </TabsPrimitive.Trigger>
            </TabsPrimitive.List>
          </div>

          <TabsPrimitive.Content
            value="cast"
            className="min-h-0 overflow-y-auto overscroll-contain px-4 py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:px-6 sm:py-6"
          >
            <ul className="grid gap-x-4 gap-y-1 sm:grid-cols-2">
              {sortedCast.map((member, index) => (
                <li key={`${member.id}-${index}`}>
                  <Link href={personHref(member.id, member.name)} prefetch={false} className={rowLink}>
                    <Avatar name={member.name} profilePath={member.profilePath} />
                    <span className="min-w-0">
                      <span className="line-clamp-1 text-sm font-medium leading-5 text-foreground transition-colors duration-150 group-hover:text-primary">
                        {member.name}
                      </span>
                      {member.character ? (
                        <span className="line-clamp-1 text-[13px] leading-[18px] text-subtle-foreground">
                          {member.character}
                        </span>
                      ) : null}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </TabsPrimitive.Content>

          <TabsPrimitive.Content
            value="crew"
            className="min-h-0 overflow-y-auto overscroll-contain px-4 py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:px-6 sm:py-6"
          >
            <div className="space-y-6">
              {crewGroups.map((group, groupIndex) => {
                const headingId = `${baseId}-dept-${groupIndex}`;
                return (
                  <section key={group.department} aria-labelledby={headingId}>
                    <h3 id={headingId} className="px-2 font-display text-base font-semibold text-foreground">
                      {group.department}
                    </h3>
                    <ul className="mt-2 grid gap-x-4 gap-y-1 sm:grid-cols-2">
                      {group.people.map((person) => (
                        <li key={person.id}>
                          <Link href={personHref(person.id, person.name)} prefetch={false} className={rowLink}>
                            <span className="min-w-0">
                              <span className="line-clamp-1 text-sm font-medium leading-5 text-foreground transition-colors duration-150 group-hover:text-primary">
                                {person.name}
                              </span>
                              {person.jobs.length > 0 ? (
                                <span className="line-clamp-1 text-[13px] leading-[18px] text-subtle-foreground">
                                  {person.jobs.join(", ")}
                                </span>
                              ) : null}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </section>
                );
              })}
            </div>
          </TabsPrimitive.Content>
        </TabsPrimitive.Root>
      </ModalContent>
    </Modal>
  );
}
