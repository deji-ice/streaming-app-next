"use client";

import { useAuthUser } from "@/hooks/useAuthUser";
import React from "react";

export function UserInitializer({ children }: { children: React.ReactNode }) {
  // This component initializes the user store when the app loads
  useAuthUser();

  return <>{children}</>;
}
