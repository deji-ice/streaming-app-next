import type { Metadata } from "next";

import { ProfileView } from "@/components/account/profile-view";

export const metadata: Metadata = {
  title: "Profile",
  description: "Your account details and activity.",
  alternates: { canonical: "/profile" },
  // Personal pages: keep them out of search results.
  robots: { index: false, follow: false },
};

export default function ProfilePage() {
  return <ProfileView />;
}
