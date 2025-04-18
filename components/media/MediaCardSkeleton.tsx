import { Skeleton } from "@/components/ui/skeleton";

export default function MediaCardSkeleton() {
  return (
    <div className="space-y-2 animate-pulse">
      {/* Poster skeleton */}
      <div className="relative aspect-[2/3] overflow-hidden rounded-lg">
        <Skeleton className="absolute inset-0" />
      </div>

      {/* Title skeleton */}
      <Skeleton className="h-5 w-3/4 my-2" />

      {/* Info skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-4 w-1/4" />
      </div>
    </div>
  );
}
