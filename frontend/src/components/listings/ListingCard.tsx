"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Star, Heart } from "lucide-react";
import { Listing } from "@/types";
import { formatCurrency, formatRating } from "@/lib/formatters";
import { useWishlist } from "@/context/WishlistContext";
import { useUser } from "@/context/UserContext";
import { cn } from "@/lib/utils";

interface ListingCardProps {
  listing: Listing;
  priority?: boolean;
}

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80";

export function ListingCard({ listing, priority = false }: ListingCardProps) {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { isLoggedIn, setIsAuthModalOpen } = useUser();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [isTogglingHeart, setIsTogglingHeart] = useState(false);

  const isSaved = isWishlisted(listing.id);

  // Sort images by display_order, or fall back to default image
  const displayImages = useMemo(() => {
    if (listing.images && listing.images.length > 0) {
      return [...listing.images]
        .sort((a, b) => a.display_order - b.display_order)
        .map((img) => img.image_url);
    }
    return [FALLBACK_IMAGE];
  }, [listing.images]);

  const hasMultipleImages = displayImages.length > 1;

  const handlePrevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (currentIndex < displayImages.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleHeartClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoggedIn) {
      setIsAuthModalOpen(true);
      return;
    }
    setIsTogglingHeart(true);
    await toggleWishlist(listing.id);
    setTimeout(() => setIsTogglingHeart(false), 300);
  };

  const isGuestFavorite = listing.rating >= 4.96 && listing.review_count >= 40;

  return (
    <Link
      href={`/listings/${listing.id}`}
      className="group flex flex-col gap-2 cursor-pointer select-none"
    >
      {/* Photo Carousel Container */}
      <div className="relative aspect-square md:aspect-[20/19] w-full overflow-hidden rounded-xl bg-neutral-100">
        {/* Main Image */}
        <Image
          src={imageError ? FALLBACK_IMAGE : displayImages[currentIndex]}
          alt={listing.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
          priority={priority}
          onError={() => setImageError(true)}
          className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        />

        {/* Guest Favorite Pill Badge */}
        {isGuestFavorite && (
          <div className="absolute top-3 left-3 z-10 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-neutral-900 shadow-sm backdrop-blur-sm tracking-tight">
            Guest favorite
          </div>
        )}

        {/* Wishlist Heart Button */}
        <button
          type="button"
          onClick={handleHeartClick}
          aria-label={isSaved ? "Remove from wishlist" : "Add to wishlist"}
          className="absolute top-3 right-3 z-10 p-1.5 focus:outline-none transition-transform hover:scale-110 active:scale-90"
        >
          <Heart
            className={cn(
              "w-6 h-6 transition-all duration-200",
              isSaved
                ? "fill-[#FF385C] stroke-[#FF385C]"
                : "fill-black/35 stroke-white stroke-[2] hover:stroke-white/95",
              isTogglingHeart && "scale-125"
            )}
          />
        </button>

        {/* Previous Image Chevron */}
        {hasMultipleImages && currentIndex > 0 && (
          <button
            type="button"
            onClick={handlePrevImage}
            aria-label="Previous photo"
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-neutral-800 flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-all duration-150 hover:scale-105 active:scale-95 focus:outline-none"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}

        {/* Next Image Chevron */}
        {hasMultipleImages && currentIndex < displayImages.length - 1 && (
          <button
            type="button"
            onClick={handleNextImage}
            aria-label="Next photo"
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-neutral-800 flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-all duration-150 hover:scale-105 active:scale-95 focus:outline-none"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        {/* Dot Pagination Indicators */}
        {hasMultipleImages && (
          <div className="absolute bottom-3 left-0 right-0 z-10 flex justify-center items-center gap-1.5 pointer-events-none">
            {displayImages.slice(0, 5).map((_, idx) => (
              <span
                key={idx}
                className={cn(
                  "rounded-full transition-all duration-200",
                  idx === (currentIndex % 5)
                    ? "w-1.5 h-1.5 bg-white scale-125 shadow"
                    : "w-1.5 h-1.5 bg-white/60 shadow-sm"
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* Listing Information */}
      <div className="pt-1 flex flex-col gap-0.5 text-[15px]">
        {/* Location & Star Rating */}
        <div className="flex justify-between items-start gap-2">
          <span className="font-semibold text-neutral-900 truncate leading-snug">
            {(() => {
              const parts = (listing.address || "").split(",").map((s) => s.trim());
              if (parts.length > 1) {
                const locality = parts[parts.length - 1];
                if (locality && locality.toLowerCase() !== listing.city.toLowerCase()) {
                  return `${locality}, ${listing.city}`;
                }
              }
              return `${listing.city}, ${listing.state || listing.country}`;
            })()}
          </span>
          <div className="flex items-center gap-1 shrink-0 text-sm font-normal text-neutral-900">
            <Star className="w-3.5 h-3.5 fill-current text-neutral-900" />
            <span>{listing.rating ? formatRating(listing.rating) : "New"}</span>
          </div>
        </div>

        {/* Category or View Subtitle */}
        <p className="text-neutral-500 text-sm truncate leading-snug">
          {listing.category ? `${listing.category} views` : `${listing.property_type} · ${listing.room_type}`}
        </p>

        {/* Date Availability Snippet */}
        <p className="text-neutral-500 text-sm leading-snug">
          Available this month
        </p>

        {/* Price Row */}
        <div className="mt-1 flex items-baseline gap-1 text-sm">
          <span className="font-semibold text-neutral-900 text-[15px]">
            {formatCurrency(listing.price_per_night)}
          </span>
          <span className="text-neutral-600 font-normal">night</span>
        </div>
      </div>
    </Link>
  );
}
