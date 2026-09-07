"use client";

import React, { useState } from "react";
import { Star, Share2, Heart, Check, Award } from "lucide-react";
import { formatRating } from "@/lib/formatters";
import { useWishlist } from "@/context/WishlistContext";
import { cn } from "@/lib/utils";

interface ListingHeaderProps {
  listingId: number;
  title: string;
  rating: number;
  reviewCount: number;
  city: string;
  state?: string | null;
  country: string;
  isSuperhost?: boolean;
}

export function ListingHeader({
  listingId,
  title,
  rating,
  reviewCount,
  city,
  state,
  country,
  isSuperhost = false,
}: ListingHeaderProps) {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const [copied, setCopied] = useState(false);

  const isSaved = isWishlisted(listingId);

  const handleShare = async () => {
    try {
      if (typeof window !== "undefined" && navigator?.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      // Fallback
    }
  };

  const locationText = state ? `${city}, ${state}, ${country}` : `${city}, ${country}`;

  return (
    <div className="flex flex-col gap-2 pb-6">
      {/* 1. Main Title */}
      <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight leading-tight">
        {title}
      </h1>

      {/* 2. Meta Info and Action Buttons Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
        {/* Left: Rating, Reviews, Superhost, Location */}
        <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-neutral-900 font-medium">
          <div className="flex items-center gap-1 font-semibold">
            <Star className="w-4 h-4 fill-neutral-900 text-neutral-900" />
            <span>{formatRating(rating)}</span>
          </div>

          <span>·</span>

          <span className="underline cursor-pointer hover:text-neutral-600">
            {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
          </span>

          {isSuperhost && (
            <>
              <span>·</span>
              <div className="flex items-center gap-1 text-neutral-700">
                <Award className="w-4 h-4 text-airbnb-rose" />
                <span>Superhost</span>
              </div>
            </>
          )}

          <span>·</span>

          <span className="underline cursor-pointer hover:text-neutral-600">
            {locationText}
          </span>
        </div>

        {/* Right: Share and Save Actions */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          {/* Share Button */}
          <button
            type="button"
            onClick={handleShare}
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-neutral-100 transition-colors text-neutral-900 font-semibold text-sm underline active:scale-95"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-600 no-underline text-xs">Link copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </>
            )}
          </button>

          {/* Save / Wishlist Button */}
          <button
            type="button"
            onClick={() => toggleWishlist(listingId)}
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-neutral-100 transition-colors text-neutral-900 font-semibold text-sm underline active:scale-95"
          >
            <Heart
              className={cn(
                "w-4 h-4 transition-colors",
                isSaved ? "fill-[#FF385C] stroke-[#FF385C]" : "stroke-neutral-900"
              )}
            />
            <span>{isSaved ? "Saved" : "Save"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
