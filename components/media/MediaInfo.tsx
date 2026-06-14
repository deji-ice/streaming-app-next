"use client";
import Image from "next/image";
import { Calendar, Clock, Globe, Users, Film } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { tmdb } from "@/lib/tmdb";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface MediaInfoProps {
  type: "movie" | "series";
  tmdbId: number;
  title: string;
  overview: string;
  releaseDate: string;
  rating: number;
  posterPath: string;
  genres: string[];
  duration: number; // in minutes
  cast: Array<{ id: number; name: string }>;
  country: string;
  season?: number;
  episode?: number;
}

export default function MediaInfo({
  type,
  tmdbId,
  title,
  overview,
  releaseDate,
  rating,
  posterPath,
  genres,
  duration,
  cast,
  country,
  season,
  episode,
}: MediaInfoProps) {
  const showEpisodeBadge =
    type === "series" && season != null && episode != null;
  const [isLoadingTrailer, setIsLoadingTrailer] = useState<boolean>(false);
  const [trailerUrl, setTrailerUrl] = useState<string | null>(null);
  const [showTrailer, setShowTrailer] = useState(false);

  const imageUrl = posterPath
    ? `https://image.tmdb.org/t/p/original${posterPath}`
    : "/placeholder-poster.jpg";

  const handleTrailer = async () => {
    setIsLoadingTrailer(true);
    try {
      const trailerType = type == "series" ? "tv" : "movie";
      const trailerUrl = await tmdb.getTrailers(tmdbId, trailerType);

      if (!trailerUrl) {
        toast.error("No trailer available");
        return;
      }

      setTrailerUrl(trailerUrl);
      setShowTrailer(true);
    } catch (error) {
      console.error("Error loading trailer:", error);
      toast.error("Failed to load trailer");
    } finally {
      setIsLoadingTrailer(false);
    }
  };

  const infoItems = [
    {
      icon: Calendar,
      label: "Released",
      text: new Date(releaseDate).toLocaleDateString(),
    },
    {
      icon: Clock,
      label: "Duration",
      text: `${Math.floor(duration / 60)}h ${duration % 60}m`,
    },
    { icon: Film, label: "Genre", text: genres.join(", ") },
    { icon: Globe, label: "Country", text: country },
    {
      icon: Users,
      label: "Cast",
      text: cast
        .slice(0, 3)
        .map((c) => c.name)
        .join(", "),
    },
  ];

  return (
    <>
      <section className="rounded-2xl border border-border bg-background/80 p-4 md:p-6">
        <div className="flex flex-col gap-6 md:flex-row md:gap-8">
          {/* Poster — capped on mobile, fixed column on desktop */}
          <div className="mx-auto w-[60%] max-w-[220px] shrink-0 md:mx-0 md:w-1/4 md:max-w-none">
            <div className="relative aspect-[2/3] overflow-hidden rounded-xl shadow-lg">
              <Image
                src={imageUrl}
                alt={title}
                fill
                sizes="(max-width: 768px) 60vw, 25vw"
                className="object-cover"
                priority
              />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 space-y-5">
            <div className="space-y-2">
              <h1 className="font-montserrat text-2xl font-bold text-foreground sm:text-3xl lg:text-4xl">
                {title}
              </h1>
              {showEpisodeBadge && (
                <span className="inline-flex items-center rounded-md border border-primary/25 bg-primary/15 px-2.5 py-0.5 text-xs font-semibold text-primary sm:text-sm">
                  Season {season} · Episode {episode}
                </span>
              )}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted px-2.5 py-1 text-sm">
                  <span className="font-medium text-yellow-500">IMDb</span>
                  <span className="text-foreground">{rating.toFixed(1)}</span>
                </span>
                <button
                  onClick={handleTrailer}
                  disabled={isLoadingTrailer}
                  className={cn(
                    "rounded-lg border border-border bg-muted px-3 py-1 text-sm text-foreground hover:bg-muted/80",
                    isLoadingTrailer && "cursor-not-allowed opacity-50",
                  )}
                >
                  {isLoadingTrailer ? "Loading…" : "Watch Trailer"}
                </button>
              </div>
            </div>

            <dl className="grid grid-cols-2 gap-x-6 gap-y-4 md:grid-cols-3">
              {infoItems.map(({ icon: Icon, label, text }) => (
                <div key={label} className="flex items-start gap-2.5">
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0">
                    <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                      {label}
                    </dt>
                    <dd className="truncate font-montserrat text-sm text-foreground">
                      {text || "N/A"}
                    </dd>
                  </div>
                </div>
              ))}
            </dl>

            <div>
              <h2 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Overview
              </h2>
              <p className="text-sm leading-relaxed text-foreground/90 md:text-base">
                {overview}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trailer Modal */}
      <Dialog open={showTrailer} onOpenChange={setShowTrailer}>
        <DialogContent className="max-h-[90vh] max-w-[90vw] p-0 md:h-[80vh] md:w-[80vw]">
          <DialogTitle className="sr-only">
            {title} - Official Trailer
          </DialogTitle>
          <div className="relative w-full h-0 pb-[56.25%]">
            {trailerUrl && (
              <iframe
                src={trailerUrl}
                title={`${title} - Official Trailer`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute top-0 left-0 w-full h-full rounded-lg"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
