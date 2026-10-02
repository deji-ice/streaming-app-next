import { ListingPageSkeleton } from "@/components/catalog/skeletons";

// 16 TV genres. Note: this also covers /series/[slug] until that route has its own loading.tsx.
export default function Loading() {
  return <ListingPageSkeleton chips={16} />;
}
