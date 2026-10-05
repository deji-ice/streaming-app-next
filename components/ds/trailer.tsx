"use client";

import { FilmStrip } from "@phosphor-icons/react";
import { useId, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";

import { cn } from "@/lib/utils";

import { focusRing, pillBase, pillVariants, pressable, railWidths, type PillVariant } from "./classes";
import { LandscapeCardInner } from "./landscape-card";
import { Modal, ModalContent, ModalTrigger } from "./modal";
import { Rail } from "./rail";
import { sortVideos, youtubeEmbedUrl, youtubeThumbnail, type VideoItem } from "./video-utils";

export type { VideoItem } from "./video-utils";

export interface TrailerModalProps {
  videos: VideoItem[];
  /** Media title, used as the modal heading. */
  title: string;
  /** Controlled open state. Leave both open and onOpenChange out to let the modal manage itself. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Video to start with when the modal opens. Defaults to the first video after sorting. */
  initialKey?: string | null;
  /** Element rendered as the Radix trigger (asChild). Focus returns to it on close. */
  trigger?: ReactNode;
  /** Element to refocus on close when there is no trigger (for example the clicked card). */
  returnFocusRef?: RefObject<HTMLElement | null>;
}

/**
 * Trailer player modal. Opening it mounts the youtube-nocookie iframe with
 * autoplay=1, so the click that opened it starts playback; closing it
 * unmounts the iframe and stops playback. Other videos are listed below the
 * frame and swap the playing video. Returns null when there are no videos.
 */
export function TrailerModal({
  videos,
  title,
  open,
  onOpenChange,
  initialKey,
  trigger,
  returnFocusRef,
}: TrailerModalProps) {
  const list = useMemo(() => sortVideos(videos), [videos]);
  const [innerOpen, setInnerOpen] = useState(false);
  const isOpen = open ?? innerOpen;
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [wasOpen, setWasOpen] = useState(isOpen);
  const listHeadingId = useId();

  // Pick the starting video on every open transition (adjusting state during render).
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (isOpen) {
      const start = initialKey && list.some((v) => v.key === initialKey) ? initialKey : list[0]?.key;
      setActiveKey(start ?? null);
    }
  }

  if (list.length === 0) return null;

  const active = list.find((v) => v.key === activeKey) ?? list[0];

  const handleOpenChange = (next: boolean) => {
    if (open === undefined) setInnerOpen(next);
    onOpenChange?.(next);
  };

  const handleCloseAutoFocus = returnFocusRef
    ? (event: Event) => {
        const target = returnFocusRef.current;
        if (target && target.isConnected) {
          event.preventDefault();
          target.focus();
        }
      }
    : undefined;

  return (
    <Modal open={isOpen} onOpenChange={handleOpenChange}>
      {trigger ? <ModalTrigger asChild>{trigger}</ModalTrigger> : null}
      <ModalContent
        size="video"
        title={title}
        description={active.name}
        onCloseAutoFocus={handleCloseAutoFocus}
      >
        <div className="aspect-video w-full bg-black">
          <iframe
            key={active.key}
            src={youtubeEmbedUrl(active.key)}
            title={active.name}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            className="h-full w-full border-0"
          />
        </div>
        {list.length > 1 ? (
          <section aria-labelledby={listHeadingId} className="border-t border-border px-6 py-5 sm:px-8 sm:py-6">
            <h3 id={listHeadingId} className="text-sm font-semibold text-foreground">
              More videos <span className="font-normal text-subtle-foreground tabular-nums">{list.length}</span>
            </h3>
            <ul className="mt-3 grid grid-cols-2 gap-x-3 gap-y-4 sm:grid-cols-3 lg:grid-cols-4">
              {list.map((video) => {
                const current = video.key === active.key;
                return (
                  <li key={video.key}>
                    <button
                      type="button"
                      onClick={() => setActiveKey(video.key)}
                      aria-current={current ? "true" : undefined}
                      className={cn("group block w-full rounded-media text-left focus-visible:outline-none", pressable)}
                    >
                      <LandscapeCardInner
                        title={video.name}
                        imagePath={null}
                        imageSrc={youtubeThumbnail(video.key)}
                        subtitle={current ? "Now playing" : video.type}
                        width="fill"
                        onPopover
                      />
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}
      </ModalContent>
    </Modal>
  );
}

export interface TrailerButtonProps {
  videos: VideoItem[];
  /** Media title (modal heading and the button's accessible name). */
  title: string;
  /** Visible label. Defaults to "Trailer". */
  label?: string;
  variant?: PillVariant;
  className?: string;
}

/** Pill button that opens the TrailerModal with the best video. Null when there are no videos. */
export function TrailerButton({ videos, title, label = "Trailer", variant = "secondary", className }: TrailerButtonProps) {
  const list = useMemo(() => sortVideos(videos), [videos]);
  if (list.length === 0) return null;

  return (
    <TrailerModal
      videos={list}
      title={title}
      trigger={
        <button
          type="button"
          aria-haspopup="dialog"
          className={cn(pillBase, pillVariants[variant], focusRing, className)}
        >
          <FilmStrip size={20} aria-hidden="true" />
          {label}
          <span className="sr-only">: {title}</span>
        </button>
      }
    />
  );
}

export interface VideoRailProps {
  videos: VideoItem[];
  /** Media title, used as the modal heading. */
  title: string;
  /** Rail heading. Defaults to "Videos". */
  heading?: string;
  headingId?: string;
  className?: string;
}

/**
 * Rail of video thumbnails (trailers first). Clicking a card opens the
 * TrailerModal at that video; focus returns to the card on close.
 * Null when there are no videos.
 */
export function VideoRail({ videos, title, heading = "Videos", headingId, className }: VideoRailProps) {
  const list = useMemo(() => sortVideos(videos), [videos]);
  const [openKey, setOpenKey] = useState<string | null>(null);
  const lastTrigger = useRef<HTMLElement | null>(null);

  if (list.length === 0) return null;

  return (
    <>
      <Rail title={heading} headingId={headingId} variant="landscape" className={className}>
        {list.map((video) => (
          <button
            key={video.key}
            type="button"
            aria-haspopup="dialog"
            onClick={(event) => {
              lastTrigger.current = event.currentTarget;
              setOpenKey(video.key);
            }}
            className={cn(
              "group block rounded-media text-left focus-visible:outline-none",
              pressable,
              railWidths.landscape,
            )}
          >
            <LandscapeCardInner
              title={video.name}
              imagePath={null}
              imageSrc={youtubeThumbnail(video.key)}
              subtitle={video.type}
            />
          </button>
        ))}
      </Rail>
      <TrailerModal
        videos={list}
        title={title}
        open={openKey !== null}
        onOpenChange={(next) => {
          if (!next) setOpenKey(null);
        }}
        initialKey={openKey}
        returnFocusRef={lastTrigger}
      />
    </>
  );
}
