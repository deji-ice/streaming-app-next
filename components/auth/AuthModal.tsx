"use client";

import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { AuthForm } from "./AuthForm";
import { cn } from "@/lib/utils";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={cn(
          "max-w-sm p-0 overflow-hidden border-0",
          // Glassmorphism effect
          "bg-white/70 dark:bg-gray-900/70",
          "backdrop-blur-2xl backdrop-saturate-150",
          // Border with gradient
          "ring-1 ring-white/20 dark:ring-white/10",
          // Shadows for depth
          "shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)]",
          // Inner glow
          "before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-br",
          "before:from-white/40 before:via-transparent before:to-transparent",
          "before:dark:from-white/10 before:dark:via-transparent before:dark:to-transparent",
          "before:pointer-events-none",
          // Animation
          "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
          "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
        )}
      >
        <DialogHeader className="sr-only">
          <span>Authentication</span>
        </DialogHeader>

        {/* Content wrapper with padding */}
        <div className="relative z-10 p-6">
          <AuthForm onSuccess={onClose} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
