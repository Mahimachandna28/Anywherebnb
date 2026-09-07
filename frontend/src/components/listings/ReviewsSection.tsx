"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import { Star } from "lucide-react";
import { Review } from "@/types";
import { formatRating } from "@/lib/formatters";
import { format, parseISO } from "date-fns";

interface ReviewsSectionProps {
  reviews: Review[];
  rating: number;
  reviewCount: number;
}

const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80";

export function ReviewsSection({
  reviews = [],
  rating,
  reviewCount,
}: ReviewsSectionProps) {
  // Compute category averages dynamically from review dataset
  const categoryScores = useMemo(() => {
    if (!reviews || reviews.length === 0) {
      return [
        { label: "Cleanliness", score: 4.9 },
        { label: "Accuracy", score: 4.9 },
        { label: "Communication", score: 5.0 },
        { label: "Location", score: 4.9 },
        { label: "Check-in", score: 5.0 },
        { label: "Value", score: 4.8 },
      ];
    }

    const totals = {
      cleanliness: 0,
      accuracy: 0,
      communication: 0,
      location: 0,
      check_in: 0,
      value: 0,
    };

    reviews.forEach((r) => {
      totals.cleanliness += r.cleanliness || 5;
      totals.accuracy += r.accuracy || 5;
      totals.communication += r.communication || 5;
      totals.location += r.location || 5;
      totals.check_in += r.check_in || 5;
      totals.value += r.value || 5;
    });

    const count = reviews.length;

    return [
      { label: "Cleanliness", score: Number((totals.cleanliness / count).toFixed(1)) },
      { label: "Accuracy", score: Number((totals.accuracy / count).toFixed(1)) },
      { label: "Communication", score: Number((totals.communication / count).toFixed(1)) },
      { label: "Location", score: Number((totals.location / count).toFixed(1)) },
      { label: "Check-in", score: Number((totals.check_in / count).toFixed(1)) },
      { label: "Value", score: Number((totals.value / count).toFixed(1)) },
    ];
  }, [reviews]);

  return (
    <div className="py-8 border-b border-neutral-200 space-y-8">
      {/* 1. Header: Star Icon & Count */}
      <div className="flex items-center gap-2 text-2xl font-semibold text-neutral-900">
        <Star className="w-6 h-6 fill-current text-neutral-900" />
        <span>{formatRating(rating)}</span>
        <span>·</span>
        <span>
          {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
        </span>
      </div>

      {/* 2. 6-Category Rating Breakdown Bars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-4">
        {categoryScores.map((cat) => (
          <div key={cat.label} className="flex items-center justify-between text-sm">
            <span className="text-neutral-800 font-medium">{cat.label}</span>
            <div className="flex items-center gap-3 w-40 sm:w-48">
              {/* Progress bar container */}
              <div className="h-1 flex-1 bg-neutral-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-neutral-900 rounded-full"
                  style={{ width: `${(cat.score / 5) * 100}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-neutral-900 w-6 text-right">
                {cat.score.toFixed(1)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* 3. Individual Review Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-8 pt-4">
        {reviews.map((review) => {
          const guestName =
            review.guest?.name || review.guest_name || "Verified Guest";
          const avatarUrl =
            review.guest?.avatar_url || review.guest_avatar || DEFAULT_AVATAR;

          let formattedDate = "Recent";
          try {
            if (review.created_at) {
              formattedDate = format(parseISO(review.created_at), "MMMM yyyy");
            }
          } catch {
            // Keep default
          }

          return (
            <div key={review.id} className="space-y-3">
              {/* Reviewer Header */}
              <div className="flex items-center gap-3.5">
                <div className="relative w-12 h-12 rounded-full overflow-hidden border border-neutral-200 shrink-0">
                  <Image
                    src={avatarUrl}
                    alt={guestName}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-semibold text-neutral-900 text-base leading-tight">
                    {guestName}
                  </h4>
                  <p className="text-xs text-neutral-500 mt-0.5">{formattedDate}</p>
                </div>
              </div>

              {/* Review Text */}
              <p className="text-neutral-700 text-sm leading-relaxed whitespace-pre-line">
                {review.comment}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
