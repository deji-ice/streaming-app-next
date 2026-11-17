"use client";

import { QrCodeIcon } from "@phosphor-icons/react";
import { useId, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Shows a QR code from md up. On phones it starts hidden behind a button: a QR code is for
 * sending from another device, and nobody can scan their own screen.
 */
export function QrReveal({ children, className }: { children: ReactNode; className?: string }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className="text-muted-foreground md:hidden"
      >
        <QrCodeIcon aria-hidden="true" />
        {open ? "Hide QR code" : "Show QR code for another device"}
      </Button>
      <div id={panelId} className={cn(open ? "flex" : "hidden", "w-full justify-center md:flex")}>
        {children}
      </div>
    </div>
  );
}
