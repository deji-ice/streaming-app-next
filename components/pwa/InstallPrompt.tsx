"use client";

import { useEffect, useState } from "react";
import { DownloadSimpleIcon, ExportIcon, XIcon } from "@phosphor-icons/react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "pwa-install-dismissed";

function readDismissed(): boolean {
  try {
    return Boolean(localStorage.getItem(DISMISS_KEY));
  } catch {
    return false;
  }
}

function writeDismissed() {
  try {
    localStorage.setItem(DISMISS_KEY, "1");
  } catch {
    // Storage unavailable (private mode): the prompt simply shows again next visit.
  }
}

/**
 * Lightweight install nudge. Self-suppresses when the app is already installed
 * (standalone) or previously dismissed. Uses the native beforeinstallprompt on
 * Android/Chrome and shows manual Add to Home Screen guidance on iOS.
 * Sits above the mobile tab bar (z-banner, below dialogs and menus).
 */
export default function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null,
  );
  const [showIosHint, setShowIosHint] = useState(false);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    if (readDismissed()) return;

    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;
    if (isStandalone) return;

    const ua = navigator.userAgent.toLowerCase();
    const isIos = /iphone|ipad|ipod/.test(ua);
    if (isIos) {
      setShowIosHint(true);
      setDismissed(false);
      return;
    }

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setDismissed(false);
    };
    const onInstalled = () => setDismissed(true);

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const close = () => {
    setDismissed(true);
    writeDismissed();
  };

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    close();
  };

  if (dismissed || (!deferred && !showIosHint)) return null;

  return (
    <div
      role="region"
      aria-label="Install app"
      className="fixed inset-x-3 bottom-[calc(64px+env(safe-area-inset-bottom)+12px)] z-banner mx-auto max-w-md rounded-panel border border-border bg-popover p-4 text-popover-foreground md:inset-x-auto md:bottom-4 md:right-4 md:mx-0 md:w-[360px]"
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1 pt-0.5">
          <p className="text-sm font-semibold text-foreground">
            Install StreamScapeX
          </p>
          {showIosHint ? (
            <p className="mt-1 text-[13px] leading-5 text-muted-foreground">
              Tap Share{" "}
              <ExportIcon
                size={16}
                aria-hidden="true"
                className="inline-block align-text-bottom"
              />
              , then &ldquo;Add to Home Screen&rdquo;.
            </p>
          ) : (
            <p className="mt-1 text-[13px] leading-5 text-muted-foreground">
              Add it to your home screen for an app-like experience.
            </p>
          )}
          {deferred && (
            <button
              type="button"
              onClick={install}
              className="mt-3 inline-flex h-11 items-center gap-2 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground transition-transform duration-150 ease-out hover:bg-primary-hover active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-popover md:h-10"
            >
              <DownloadSimpleIcon size={20} aria-hidden="true" />
              Install
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={close}
          aria-label="Dismiss install prompt"
          className="-mr-2 -mt-2 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-popover"
        >
          <XIcon size={20} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
