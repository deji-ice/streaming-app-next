"use client";

import { X } from "@phosphor-icons/react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { focusRingPopover } from "./classes";

/** Radix Dialog root (controlled or uncontrolled). */
export const Modal = DialogPrimitive.Root;
/** Use with asChild around your own button so focus returns to it on close. */
export const ModalTrigger = DialogPrimitive.Trigger;
/** Closes the nearest Modal; use with asChild for custom close buttons. */
export const ModalClose = DialogPrimitive.Close;

export type ModalSize = "md" | "lg" | "xl" | "video";

export interface ModalContentProps {
  title: string;
  description?: string;
  size?: ModalSize;
  children: ReactNode;
  /** Extra header control, left of the close button. */
  headerAction?: ReactNode;
  className?: string;
  /** Overrides the body wrapper classes (for example a fixed tab bar with its own scroll area). */
  bodyClassName?: string;
  /** Radix close auto-focus hook: call event.preventDefault() and focus your own element. */
  onCloseAutoFocus?: (event: Event) => void;
  /** Radix open auto-focus hook. */
  onOpenAutoFocus?: (event: Event) => void;
}

const WIDTH: Record<ModalSize, string> = {
  md: "w-[min(calc(100vw-2rem),640px)]",
  lg: "w-[min(calc(100vw-2rem),880px)]",
  xl: "w-[min(calc(100vw-2rem),1040px)]",
  // Also capped by height so the 16:9 frame plus the header always fits in 85dvh.
  video: "w-[min(calc(100vw-2rem),1100px,calc((85dvh-5.5rem)*16/9))]",
};

/**
 * Dialog surface: flat black overlay, bg-popover panel with a hairline,
 * header (title + optional action + 44px close) and a scrolling body.
 * Focus trap, Esc and focus return are Radix defaults.
 */
export function ModalContent({
  title,
  description,
  size = "md",
  children,
  headerAction,
  className,
  bodyClassName,
  onCloseAutoFocus,
  onOpenAutoFocus,
}: ModalContentProps) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-overlay bg-black/70 ease-out data-[state=closed]:[animation-duration:220ms] data-[state=open]:[animation-duration:220ms] data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
      <DialogPrimitive.Content
        onCloseAutoFocus={onCloseAutoFocus}
        onOpenAutoFocus={onOpenAutoFocus}
        {...(description ? {} : { "aria-describedby": undefined })}
        className={cn(
          // inset-0 + m-auto + h-fit centers without transforms, so the zoom animation owns `transform`.
          "fixed inset-0 z-overlay m-auto flex h-fit max-h-[85dvh] flex-col overflow-hidden rounded-panel border border-border bg-popover text-popover-foreground focus:outline-none",
          "ease-out data-[state=closed]:[animation-duration:220ms] data-[state=open]:[animation-duration:220ms] data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-[0.98] data-[state=open]:zoom-in-[0.98]",
          WIDTH[size],
          className,
        )}
      >
        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-border px-6 py-4 sm:px-8">
          <div className="min-w-0">
            <DialogPrimitive.Title className="type-section line-clamp-1 text-foreground">{title}</DialogPrimitive.Title>
            {description ? (
              <DialogPrimitive.Description className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                {description}
              </DialogPrimitive.Description>
            ) : null}
          </div>
          <div className="-mr-2 flex shrink-0 items-center gap-2">
            {headerAction}
            <DialogPrimitive.Close
              aria-label="Close"
              className={cn(
                "inline-flex size-11 items-center justify-center rounded-full text-muted-foreground transition-[transform,background-color,color] duration-150 ease-out hover:bg-accent hover:text-foreground active:scale-[0.98]",
                focusRingPopover,
              )}
            >
              <X size={20} aria-hidden="true" />
            </DialogPrimitive.Close>
          </div>
        </div>
        <div
          className={cn(
            "min-h-0 overflow-y-auto overscroll-contain",
            size === "video" ? "p-0" : "px-6 py-6 sm:px-8 sm:py-8",
            bodyClassName,
          )}
        >
          {children}
        </div>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}
