"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Star, Trash2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRatings } from "@/hooks/useRatings";
import { toast } from "sonner";

interface RatingDisplayProps {
  tmdbId: number;
  mediaType: "movie" | "series";
  showReviewForm?: boolean;
}

export function RatingDisplay({
  tmdbId,
  mediaType,
  showReviewForm = false,
}: RatingDisplayProps) {
  const { userRating, aggregated, fetchUserRating, fetchAggregatedRating } =
    useRatings();
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const [review, setReview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchUserRating(tmdbId, mediaType);
    fetchAggregatedRating(tmdbId, mediaType);
  }, [tmdbId, mediaType, fetchUserRating, fetchAggregatedRating]);

  useEffect(() => {
    if (userRating) {
      setSelectedRating(userRating.rating);
      setReview(userRating.review || "");
    } else {
      setSelectedRating(0);
      setReview("");
    }
  }, [userRating]);

  const { submitRating, deleteRating } = useRatings();

  const handleSubmit = async () => {
    if (selectedRating === 0) {
      toast.error("Please select a rating");
      return;
    }

    setIsSubmitting(true);
    try {
      await submitRating(
        tmdbId,
        mediaType,
        selectedRating,
        review || undefined,
      );
      toast.success(userRating ? "Rating updated" : "Rating submitted");
      setIsEditing(false);
    } catch (error) {
      toast.error("Failed to submit rating");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!userRating) return;

    setIsSubmitting(true);
    try {
      await deleteRating(tmdbId, mediaType);
      toast.success("Rating deleted");
      setIsEditing(false);
    } catch (error) {
      toast.error("Failed to delete rating");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Aggregated Rating */}
      {aggregated && aggregated.totalRatings > 0 && (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < Math.round(aggregated.averageRating)
                    ? "fill-yellow-500 text-yellow-500"
                    : "text-muted-foreground"
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-muted-foreground">
            {aggregated.averageRating.toFixed(1)}/10 ({aggregated.totalRatings}{" "}
            {aggregated.totalRatings === 1 ? "rating" : "ratings"})
          </span>
        </div>
      )}

      {/* User Rating Display */}
      {userRating && !isEditing && (
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < userRating.rating
                        ? "fill-primary text-primary"
                        : "text-muted-foreground"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-semibold text-primary">
                {userRating.rating}/10
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="text-muted-foreground hover:text-foreground"
            >
              Edit
            </Button>
          </div>
          {userRating.review && (
            <p className="text-sm text-foreground">{userRating.review}</p>
          )}
        </div>
      )}

      {/* Rating Form */}
      {(showReviewForm || isEditing) && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-card border border-border rounded-lg p-4 space-y-4"
        >
          <div>
            <label className="text-sm font-medium block mb-2">
              Your Rating
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                <motion.button
                  key={rating}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedRating(rating)}
                  className={`w-8 h-8 rounded-full font-semibold text-xs transition-all ${
                    selectedRating >= rating
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {rating}
                </motion.button>
              ))}
            </div>
          </div>

          {showReviewForm && (
            <div>
              <label className="text-sm font-medium block mb-2">
                Review (optional)
              </label>
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Share your thoughts about this title..."
                className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm resize-none"
                rows={3}
              />
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || selectedRating === 0}
              className="flex-1 gap-2"
              size="sm"
            >
              <Send className="w-4 h-4" />
              {isSubmitting
                ? "Submitting..."
                : userRating
                  ? "Update"
                  : "Submit"}
            </Button>
            {userRating && (
              <Button
                onClick={handleDelete}
                disabled={isSubmitting}
                variant="destructive"
                size="sm"
                className="gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </Button>
            )}
            {isEditing && (
              <Button
                onClick={() => setIsEditing(false)}
                variant="outline"
                size="sm"
              >
                Cancel
              </Button>
            )}
          </div>
        </motion.div>
      )}

      {/* Prompt to rate */}
      {!userRating && !isEditing && showReviewForm && (
        <Button
          onClick={() => setIsEditing(true)}
          variant="outline"
          className="w-full"
          size="sm"
        >
          <Star className="w-4 h-4 mr-2" />
          Rate this title
        </Button>
      )}
    </div>
  );
}
