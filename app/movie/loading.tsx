import { ListingPageSkeleton } from "@/components/catalog/skeletons";

// 19 movie genres. Note: this also covers /movie/[slug] until that route has its own loading.tsx.
export default function Loading() {
  return <ListingPageSkeleton chips={19} />;
}
