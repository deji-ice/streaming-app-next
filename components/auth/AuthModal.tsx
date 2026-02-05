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
          "max-w-sm border-white/10",
          // Glassmorphism effect
          "bg-gradient-to-br from-background/15 via-background/10 to-background/25",
          "backdrop-blur-xl",
          "shadow-2xl shadow-primary/5",
          // Subtle border glow
          "before:absolute before:inset-0 before:rounded-lg before:p-[1px]",
          "before:bg-gradient-to-br before:from-white/20 before:via-white/5 before:to-white/20",
          "before:-z-10 before:blur-sm",
          // Animation
          "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
          "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
        )}
      >
        <DialogHeader className="sr-only">
          <span>Authentication</span>
        </DialogHeader>
        <AuthForm onSuccess={onClose} />
      </DialogContent>
    </Dialog>
  );
}
