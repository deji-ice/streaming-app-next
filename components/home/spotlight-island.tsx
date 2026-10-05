"use client";

import { PlayIcon } from "@phosphor-icons/react";
import Image from "next/image";
import { memo, useState, type CSSProperties } from "react";

import { focusRing, pillBase, pillVariants, pressable } from "@/components/ds/classes";
import { IntentLink } from "@/components/ds/intent-link";
import { MetaRow } from "@/components/ds/meta-row";
import { TrailerButton } from "@/components/ds/trailer";
import { IMAGE_SIZES, tmdbImage } from "@/lib/tmdb-image";
import { cn } from "@/lib/utils";

import type { SpotlightItem, SpotlightLogo } from "./types";

/** Tallest title logo: max-h-28, lg:max-h-32. Also the CSS variable the logo width is computed from. */
const LOGO_HEIGHT_VARS = "[--logo-h:7rem] lg:[--logo-h:8rem]";

/**
 * Width and aspect ratio of a title logo box. The height follows from the
 * ratio, never exceeds var(--logo-h) and is known before the image loads, so
 * the logo never shifts the text below it.
 */
function logoBoxStyle(logo: SpotlightLogo): CSSProperties {
  const ratio = logo.width / logo.height;
  return {
    aspectRatio: `${logo.width} / ${logo.height}`,
    width: `min(100%, calc(var(--logo-h) * ${ratio.toFixed(4)}))`,
  };
}

function TitleLogo({
  title,
  logo,
  src,
  loaded,
}: {
  title: string;
  logo: SpotlightLogo;
  src: string;
  loaded: boolean;
}) {
  const style = logoBoxStyle(logo);

  // Logos of the titles that are not shown yet only load once the viewer shows
  // interest in them; until then an empty box of the same size keeps the layout.
  if (!loaded) {
    return (
      <>
        <span aria-hidden="true" className={cn("block", LOGO_HEIGHT_VARS)} style={style} />
        <span className="sr-only">{title}</span>
      </>
    );
  }

  const ratio = logo.width / logo.height;
  const sizes = `(min-width:1024px) ${Math.min(Math.round(ratio * 128), 530)}px, ${Math.min(Math.round(ratio * 112), 360)}px`;

  return (
    <Image
      src={src}
      alt={title}
      width={logo.width}
      height={logo.height}
      sizes={sizes}
      unoptimized={/\.svg$/i.test(logo.path)}
      style={style}
      className={cn(
        "block h-auto max-h-28 object-contain object-left lg:max-h-32",
        LOGO_HEIGHT_VARS,
      )}
    />
  );
}

interface SpotlightPanelProps {
  item: SpotlightItem;
  active: boolean;
  logoLoaded: boolean;
}

/**
 * Text side of one spotlight title. All panels share one grid cell, so the
 * block is as tall as the tallest panel and nothing below it moves when the
 * viewer switches titles. Panels that are not shown are invisible, which
 * also removes them from the accessibility tree and the tab order.
 */
const SpotlightPanel = memo(function SpotlightPanel({ item, active, logoLoaded }: SpotlightPanelProps) {
  const logoSrc = item.logo ? tmdbImage(item.logo.path) : null;

  return (
    <div className={cn("col-start-1 row-start-1 flex min-w-0 flex-col", !active && "invisible")}>
      {item.logo && logoSrc ? (
        <h2 className="text-foreground">
          <TitleLogo title={item.title} logo={item.logo} src={logoSrc} loaded={logoLoaded} />
        </h2>
      ) : (
        <h2 className="type-display-xl text-balance break-words text-foreground">{item.title}</h2>
      )}

      <MetaRow
        className="mt-3"
        items={[
          item.year ? String(item.year) : null,
          item.certification ? (
            <span
              key="certification"
              className="rounded-full border border-input px-2 py-0.5 text-xs font-medium leading-none text-foreground"
            >
              {item.certification}
            </span>
          ) : null,
          item.runtime,
          ...item.genres,
        ]}
      />

      {item.overview ? (
        <p className="mt-3 line-clamp-3 max-w-[52ch] text-base leading-[1.6] text-muted-foreground">
          {item.overview}
        </p>
      ) : null}

      <div className="mt-auto flex flex-wrap items-center gap-3 pt-5">
        <IntentLink href={item.href} className={cn(pillBase, pillVariants.primary, focusRing)}>
          <PlayIcon weight="fill" size={20} aria-hidden="true" />
          Watch now
          <span className="sr-only">: {item.title}</span>
        </IntentLink>
        <TrailerButton videos={item.videos} title={item.title} variant="secondary" />
      </div>
    </div>
  );
});

/**
 * Client island of the home hero: which of the spotlight titles is shown.
 *
 * Switching is a click or tap on a thumbnail, never automatic, and makes no
 * network request for text (everything arrived as props). Images of the other
 * titles load on intent (pointer over, focus or press on their thumbnail), so
 * the first backdrop is the only large image the page has to fetch up front.
 */
export function SpotlightIsland({ items }: { items: SpotlightItem[] }) {
  const [active, setActive] = useState(0);
  // Bit i is set once the backdrop and logo of item i may load. Item 0 from the start.
  const [warm, setWarm] = useState(1);
  const [announcement, setAnnouncement] = useState("");

  const isWarm = (index: number) => (warm & (1 << index)) !== 0;
  const warmUp = (index: number) => setWarm((bits) => bits | (1 << index));
  const choose = (index: number) => {
    warmUp(index);
    setActive(index);
    setAnnouncement(`Showing ${items[index].title}`);
  };

  if (items.length === 0) return null;
  const current = items[Math.min(active, items.length - 1)];

  return (
    <div className="grid gap-5 lg:grid-cols-12 lg:grid-rows-[1fr_auto] lg:gap-x-10 lg:gap-y-6">
      {/* Backdrop. A mouse or touch shortcut to the title page; the Watch now link is the accessible one. */}
      <IntentLink
        href={current.href}
        tabIndex={-1}
        aria-hidden="true"
        className="relative block aspect-video overflow-hidden rounded-media bg-muted lg:col-span-7 lg:col-start-6 lg:row-span-2 lg:row-start-1 lg:self-center"
      >
        {items.map((item, index) => {
          const src = isWarm(index) ? tmdbImage(item.backdropPath) : null;
          if (!src) return null;
          return (
            <Image
              key={item.id}
              src={src}
              alt=""
              fill
              sizes={IMAGE_SIZES.heroBackdrop}
              priority={index === 0}
              loading={index === 0 ? undefined : "eager"}
              className={cn("object-cover", index === active ? "visible" : "invisible")}
            />
          );
        })}
      </IntentLink>

      <div className="min-w-0 lg:col-span-5 lg:col-start-1 lg:row-start-1 lg:self-end">
        <p className="type-eyebrow">Trending this week</p>
        <div className="mt-3 grid">
          {items.map((item, index) => (
            <SpotlightPanel key={item.id} item={item} active={index === active} logoLoaded={isWarm(index)} />
          ))}
        </div>
      </div>

      {items.length > 1 ? (
        // Equal columns so every thumbnail fits at any width (no clipped tile at the edge).
        <div
          role="group"
          aria-label="Spotlight titles"
          className="grid min-w-0 max-w-[560px] gap-2 lg:col-span-5 lg:col-start-1 lg:row-start-2"
          style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
        >
          {items.map((item, index) => {
            const src = tmdbImage(item.backdropPath);
            const selected = index === active;
            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={selected}
                aria-label={item.title}
                title={item.title}
                onClick={() => choose(index)}
                onPointerEnter={() => warmUp(index)}
                onPointerDown={() => warmUp(index)}
                onFocus={() => warmUp(index)}
                className={cn("relative block w-full min-w-0 rounded-media", pressable, focusRing)}
              >
                <span className="relative block aspect-video overflow-hidden rounded-media bg-muted">
                  {src ? <Image src={src} alt="" fill sizes="(min-width:1024px) 112px, 20vw" className="object-cover" /> : null}
                </span>
                <span
                  aria-hidden="true"
                  className={cn(
                    "pointer-events-none absolute inset-0 rounded-media border-2",
                    selected ? "border-primary" : "border-transparent",
                  )}
                />
              </button>
            );
          })}
        </div>
      ) : null}

      <p role="status" className="sr-only">
        {announcement}
      </p>
    </div>
  );
}
