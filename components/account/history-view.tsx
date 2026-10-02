"use client";

import { ClockCounterClockwiseIcon, TrashIcon, WarningCircleIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";

import { useAuthModal } from "@/components/auth/AuthModalProvider";
import { EmptyState } from "@/components/ds/empty-state";
import { LandscapeCard } from "@/components/ds/landscape-card";
import { Modal, ModalClose, ModalContent, ModalTrigger } from "@/components/ds/modal";
import { Button } from "@/components/ui/button";
import { useAuthStatus } from "@/hooks/useUser";
import { useWatchHistory, type WatchHistoryItem } from "@/hooks/useWatchHistory";
import { formatCompact, formatRelativeTime } from "@/lib/format";
import { useHistoryActions } from "@/lib/user-data";
import { cn } from "@/lib/utils";

import { HISTORY_GRID } from "./classes";
import { historyHref, historySubtitle } from "./history-utils";
import { AccountPage, PAGE_TITLE_ID } from "./page-shell";
import { RemoveButton } from "./remove-button";
import { HistorySkeleton } from "./skeletons";
import { useRemovalFocus } from "./use-removal-focus";

/** Grid cells are 2 / 3 / 4 columns wide (see HISTORY_GRID). */
const CARD_SIZES = "(min-width:1280px) 25vw, (min-width:768px) 33vw, 50vw";

/** Focus ring for buttons inside the dialog, which sits on the popover surface. */
const ON_POPOVER = "focus-visible:ring-offset-popover";

/**
 * Watch history: local (this device) and account history merged, newest
 * first. Works signed out. Remove deletes one title (locally and, signed in,
 * from the account); Clear history asks for confirmation first.
 */
export function HistoryView() {
  const status = useAuthStatus();
  const { openAuthModal } = useAuthModal();
  const { items, isLoading, error, refresh } = useWatchHistory();
  const { remove, clear } = useHistoryActions();

  const listRef = useRef<HTMLUListElement>(null);
  const focus = useRemovalFocus(listRef, items.length);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [clearing, setClearing] = useState(false);
  const clearedRef = useRef(false);

  const handleRemove = useCallback(
    async (item: WatchHistoryItem, index: number) => {
      focus.expect(index);
      try {
        await remove(item.tmdb_id, item.media_type);
        toast.success(`Removed ${item.title} from your history`);
      } catch {
        toast.error(`Could not remove ${item.title}. Try again.`);
      } finally {
        focus.cancel();
      }
    },
    [focus, remove],
  );

  const handleClear = useCallback(async () => {
    setClearing(true);
    try {
      await clear();
      clearedRef.current = true;
      setConfirmOpen(false);
      toast.success("Watch history cleared");
    } catch {
      toast.error("Could not clear your watch history. Try again.");
    } finally {
      setClearing(false);
    }
  }, [clear]);

  // The session is part of "loading": history merges in the account copy once it is known.
  if (isLoading || status === "loading") return <HistorySkeleton />;

  const signedIn = status === "authenticated";
  const count = items.length;

  if (error && count === 0) {
    return (
      <AccountPage title="History">
        <EmptyState
          className="mt-8"
          icon={<WarningCircleIcon weight="duotone" />}
          title="Could not load your watch history"
          body="Check your connection and try again."
          action={
            <Button variant="secondary" onClick={() => void refresh()}>
              Try again
            </Button>
          }
        />
      </AccountPage>
    );
  }

  const actions = (
    <>
      {signedIn ? null : (
        <Button variant="secondary" onClick={() => openAuthModal()}>
          Sign in to sync
        </Button>
      )}
      {/* Stay mounted while the dialog is open: clearing empties the list before the request ends. */}
      {count > 0 || confirmOpen ? (
        <Modal open={confirmOpen} onOpenChange={setConfirmOpen}>
          <ModalTrigger asChild>
            <Button variant="secondary">
              <TrashIcon aria-hidden="true" />
              Clear history
            </Button>
          </ModalTrigger>
          <ModalContent
            title="Clear watch history"
            description="This cannot be undone."
            size="md"
            onCloseAutoFocus={(event) => {
              // The Clear history button is gone once the list is empty: land on the page title instead.
              if (clearedRef.current) {
                clearedRef.current = false;
                event.preventDefault();
                document.getElementById(PAGE_TITLE_ID)?.focus();
              }
            }}
          >
            <p className="max-w-[65ch] text-base text-muted-foreground">
              {count > 0 ? `${formatCompact(count)} ${count === 1 ? "title" : "titles"}` : "Your watch history"} will be
              removed from this device{signedIn ? " and your account" : ""}.
            </p>
            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <ModalClose asChild>
                <Button variant="secondary" className={ON_POPOVER}>
                  Cancel
                </Button>
              </ModalClose>
              <Button variant="destructive" className={ON_POPOVER} onClick={handleClear} disabled={clearing}>
                {clearing ? "Clearing..." : "Clear history"}
              </Button>
            </div>
          </ModalContent>
        </Modal>
      ) : null}
    </>
  );

  return (
    <AccountPage
      title="History"
      description={`${formatCompact(count)} ${count === 1 ? "title" : "titles"}${signedIn ? "" : " saved on this device"}`}
      actions={actions}
    >
      {count === 0 ? (
        <EmptyState
          className="mt-8"
          icon={<ClockCounterClockwiseIcon weight="duotone" />}
          title="No watch history yet"
          body={
            signedIn
              ? "Titles you watch will show up here."
              : "Titles you watch are saved on this device. Sign in to keep your history with your account."
          }
          action={
            <>
              <Button asChild>
                <Link href="/movie">Browse movies</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/series">Browse series</Link>
              </Button>
            </>
          }
        />
      ) : (
        <ul ref={listRef} className={cn("mt-8", HISTORY_GRID)}>
          {items.map((item, index) => (
            <li key={item.id} className="min-w-0">
              <LandscapeCard
                width="fill"
                sizes={CARD_SIZES}
                href={historyHref(item)}
                title={item.title}
                imagePath={item.backdrop_path ?? item.poster_path}
                subtitle={historySubtitle(item)}
                meta={formatRelativeTime(item.watched_at)}
              />
              <RemoveButton title={item.title} from="history" onClick={() => handleRemove(item, index)} />
            </li>
          ))}
        </ul>
      )}
    </AccountPage>
  );
}
