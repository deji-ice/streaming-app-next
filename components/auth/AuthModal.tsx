"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "@phosphor-icons/react";
import { AuthForm } from "./AuthForm";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  return (
    <DialogPrimitive.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-overlay bg-black/70 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 duration-220 ease-out" />
        <DialogPrimitive.Content className="fixed left-1/2 top-1/2 z-overlay flex max-h-[85dvh] w-[min(100vw_-_2rem,440px)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-panel border border-border bg-popover text-popover-foreground outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-[0.98] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-1/2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-[0.98] data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-1/2 duration-220 ease-out">
          <div className="overflow-y-auto px-6 py-6 sm:px-8 sm:py-7">
            <AuthForm
              onSuccess={onClose}
              renderHeader={({ title, description }) => (
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 space-y-1.5">
                    <DialogPrimitive.Title className="type-section text-foreground">
                      {title}
                    </DialogPrimitive.Title>
                    <DialogPrimitive.Description className="text-sm text-muted-foreground">
                      {description}
                    </DialogPrimitive.Description>
                  </div>
                  <DialogPrimitive.Close
                    aria-label="Close"
                    className="-mr-2 -mt-1.5 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors duration-150 ease-out hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-popover active:scale-[0.98]"
                  >
                    <X size={20} aria-hidden="true" />
                  </DialogPrimitive.Close>
                </div>
              )}
            />
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
