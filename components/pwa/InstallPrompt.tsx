"use client";

import { useEffect, useState } from "react";
import { X, Share } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "pwa-install-dismissed";

/**
 * Lightweight install nudge. Self-suppresses when the app is already installed
 * (standalone) or previously dismissed. Uses the native beforeinstallprompt on
 * Android/Chrome and shows manual Add-to-Home-Screen guidance on iOS.
 * Note: installing the app does NOT block ads — the ad-blocker note is kept.
 */
export default function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null,
  );
  const [showIosHint, setShowIosHint] = useState(false);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    if (localStorage.getItem(DISMISS_KEY)) return;

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
    localStorage.setItem(DISMISS_KEY, "1");
  };

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    close();
  };

  if (dismissed || (!deferred && !showIosHint)) return null;

  return (
    <div className="fixed inset-x-3 bottom-3 z-[90] mx-auto max-w-md rounded-xl border border-border bg-background/95 p-4 shadow-lg backdrop-blur">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-montserrat text-sm font-bold">
            Install StreamScapeX
          </p>
          {showIosHint ? (
            <p className="mt-1 text-xs text-muted-foreground">
              Tap Share <Share className="inline h-3 w-3" />, then &ldquo;Add to
              Home Screen&rdquo;.
            </p>
          ) : (
            <p className="mt-1 text-xs text-muted-foreground">
              Add to your home screen for an app-like experience.
            </p>
          )}
          <p className="mt-2 text-[11px] text-amber-500">
            Note: installing does not block ads. You still need an ad blocker or
            Brave for popup-free playback.
          </p>
          {deferred && (
            <button
              onClick={install}
              className="mt-3 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Install
            </button>
          )}
        </div>
        <button
          onClick={close}
          aria-label="Dismiss install prompt"
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
