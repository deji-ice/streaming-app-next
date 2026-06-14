"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_PROVIDER_ID, getProvider } from "@/lib/stream-providers";

interface StreamSourceStore {
  providerId: string;
  setProviderId: (id: string) => void;
}

/**
 * Remembers the user's chosen streaming source across sessions (localStorage).
 * The stored id is always validated against the registry via getProvider, so a
 * provider that gets removed later can't leave the store in a broken state.
 */
export const useStreamSource = create<StreamSourceStore>()(
  persist(
    (set) => ({
      providerId: DEFAULT_PROVIDER_ID,
      setProviderId: (id) => set({ providerId: getProvider(id).id }),
    }),
    {
      name: "stream-source",
      onRehydrateStorage: () => (state) => {
        if (state) state.providerId = getProvider(state.providerId).id;
      },
    }
  )
);
