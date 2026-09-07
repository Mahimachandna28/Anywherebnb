"use client";

import React from "react";
import { SearchX, RotateCcw } from "lucide-react";
import { Listing } from "@/types";
import { ListingCard } from "./ListingCard";
import { ListingCardSkeleton } from "./ListingCardSkeleton";
import { useFilters } from "@/context/FilterContext";

interface ListingGridProps {
  listings: Listing[];
  isLoading?: boolean;
  onClearFilters?: () => void;
}

export function ListingGrid({
  listings,
  isLoading = false,
  onClearFilters,
}: ListingGridProps) {
  const { resetFilters } = useFilters();

  const handleClear = () => {
    if (onClearFilters) {
      onClearFilters();
    } else {
      resetFilters();
    }
  };

  // Loading state with skeleton cards to eliminate Cumulative Layout Shift (CLS)
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 gap-x-6 gap-y-10">
        {Array.from({ length: 10 }).map((_, index) => (
          <ListingCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  // Empty state when no listings match active filters
  if (!listings || listings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mb-4 text-neutral-500">
          <SearchX className="w-8 h-8 stroke-[1.5]" />
        </div>
        <h3 className="text-xl font-semibold text-neutral-900 mb-2">
          No exact matches
        </h3>
        <p className="text-neutral-500 text-sm max-w-md mb-6 leading-relaxed">
          Try changing or clearing some of your filters, expanding your search
          destination, or browsing all categories.
        </p>
        <button
          type="button"
          onClick={handleClear}
          className="inline-flex items-center gap-2 border border-neutral-900 hover:bg-neutral-100 px-5 py-2.5 rounded-lg text-sm font-semibold text-neutral-900 transition-colors active:scale-95"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Clear all filters</span>
        </button>
      </div>
    );
  }

  // Active listings grid
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 gap-x-6 gap-y-10">
      {listings.map((listing, index) => (
        <ListingCard
          key={listing.id}
          listing={listing}
          priority={index < 4}
        />
      ))}
    </div>
  );
}
