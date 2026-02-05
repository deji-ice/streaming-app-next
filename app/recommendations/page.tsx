"use client";

import { Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRecommendations } from "@/hooks/useRecommendations";
import MediaCard from "@/components/media/MediaCard";
import Link from "next/link";
import { useEffect } from "react";
import { useUser } from "@/hooks/useUser";
import { useAuthModal } from "@/components/auth/AuthModalProvider";

export default function RecommendationsPage() {
  const { isAuthenticated, isLoading: authLoading } = useUser();
  const { openAuthModal } = useAuthModal();
  const { recommendations, isLoading } = useRecommendations();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      openAuthModal();
    }
  }, [authLoading, isAuthenticated, openAuthModal]);

  if (authLoading || !isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-20 pt-24">
        <p className="text-muted-foreground">Generating recommendations...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 pb-10 pt-20 md:pt-24">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-6 h-6 text-primary" />
          <h1 className="text-3xl md:text-4xl font-montserrat font-bold">
            Recommended For You
          </h1>
        </div>
        <p className="text-muted-foreground mt-2">
          Based on your watchlist and favorite content
        </p>
      </div>

      {recommendations.length === 0 ? (
        <div className="rounded-xl border border-border p-12 bg-card text-center">
          <Sparkles className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">
            No recommendations yet. Add movies and series to your watchlist or
            favorites to get personalized recommendations.
          </p>
          <Button asChild>
            <Link href="/">
              Discover Content
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {recommendations.map((item) => (
            <MediaCard
              key={`${item.media_type}-${item.id}`}
              item={item as any}
              type={item.media_type}
            />
          ))}
        </div>
      )}

      {/* Related Actions */}
      {recommendations.length > 0 && (
        <div className="mt-16 border-t border-border pt-8">
          <h2 className="text-xl font-montserrat font-bold mb-4">
            Explore More
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Button asChild variant="outline" className="h-auto py-4" size="lg">
              <Link href="/watchlist">
                <div className="text-left">
                  <p className="font-semibold">Continue from Watchlist</p>
                  <p className="text-sm text-muted-foreground">
                    Check what you want to watch
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 ml-auto" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto py-4" size="lg">
              <Link href="/favorites">
                <div className="text-left">
                  <p className="font-semibold">View Favorites</p>
                  <p className="text-sm text-muted-foreground">
                    See your favorite content
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 ml-auto" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto py-4" size="lg">
              <Link href="/search">
                <div className="text-left">
                  <p className="font-semibold">Advanced Search</p>
                  <p className="text-sm text-muted-foreground">
                    Search with filters
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 ml-auto" />
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
