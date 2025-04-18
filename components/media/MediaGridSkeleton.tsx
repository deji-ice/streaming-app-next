import { Skeleton } from "@/components/ui/skeleton";
import MediaCardSkeleton from "./MediaCardSkeleton";

interface MediaGridSkeletonProps {
  count?: number;
  title?: string;
}

export default function MediaGridSkeleton({
  count = 10,
  title,
}: MediaGridSkeletonProps) {
  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        {title && (
          <div className="mb-8">
            <Skeleton className="h-8 w-48" />
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {Array.from({ length: count }).map((_, index) => (
            <MediaCardSkeleton key={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
