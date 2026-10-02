"use client";

import dynamic from "next/dynamic";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

// The modal (and supabase-js, which the form uses) loads only after the first open.
const AuthModal = dynamic(
  () => import("./AuthModal").then((m) => m.AuthModal),
  { ssr: false },
);

interface AuthModalContextValue {
  openAuthModal: () => void;
  closeAuthModal: () => void;
}

const AuthModalContext = createContext<AuthModalContextValue | null>(null);

export function AuthModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);

  const openAuthModal = useCallback(() => {
    setHasOpened(true);
    setIsOpen(true);
  }, []);
  const closeAuthModal = useCallback(() => setIsOpen(false), []);

  const value = useMemo(
    () => ({ openAuthModal, closeAuthModal }),
    [openAuthModal, closeAuthModal],
  );

  return (
    <AuthModalContext.Provider value={value}>
      {children}
      {hasOpened ? <AuthModal isOpen={isOpen} onClose={closeAuthModal} /> : null}
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const context = useContext(AuthModalContext);
  if (!context) {
    throw new Error("useAuthModal must be used within AuthModalProvider");
  }
  return context;
}
