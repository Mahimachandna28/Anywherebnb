"use client";

import React, { useState, useEffect, useCallback } from "react";
import { CategoryBar } from "@/components/layout/CategoryBar";
import { ListingGrid } from "@/components/listings";
import { useFilters } from "@/context/FilterContext";
import { fetchApi } from "@/lib/api";
import { Listing } from "@/types";

export default function HomePage() {
  const { filters, resetFilters } = useFilters();
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isNearby, setIsNearby] = useState<boolean>(false);
  const [searchFeedback, setSearchFeedback] = useState<{
    location: string | null;
    message: string | null;
  }>({ location: null, message: null });

  const fetchListings = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams();

      if (filters.destination && filters.destination.trim()) {
        queryParams.set("destination", filters.destination.trim());
      }

      if (filters.category && filters.category !== "all") {
        queryParams.set("category", filters.category);
      }

      if (filters.propertyType && filters.propertyType !== "any") {
        queryParams.set("property_type", filters.propertyType);
      }

      if (typeof filters.minPrice === "number" && !isNaN(filters.minPrice)) {
        queryParams.set("min_price", String(filters.minPrice));
      }

      if (typeof filters.maxPrice === "number" && !isNaN(filters.maxPrice)) {
        queryParams.set("max_price", String(filters.maxPrice));
      }

      if (typeof filters.guests === "number" && filters.guests > 0) {
        queryParams.set("guests", String(filters.guests));
      }

      if (typeof filters.bedrooms === "number" && !isNaN(filters.bedrooms)) {
        queryParams.set("bedrooms", String(filters.bedrooms));
      }

      if (filters.checkIn) {
        queryParams.set("check_in", filters.checkIn);
      }

      if (filters.checkOut) {
        queryParams.set("check_out", filters.checkOut);
      }

      if (filters.amenities && filters.amenities.length > 0) {
        filters.amenities.forEach((amenityId) => {
          queryParams.append("amenities", String(amenityId));
        });
      }

      const queryString = queryParams.toString();
      const endpoint = queryString ? `/listings?${queryString}` : "/listings";

      const data = await fetchApi<{
        items: Listing[];
        total: number;
        is_nearby?: boolean;
        search_location?: string | null;
        message?: string | null;
        skip: number;
        limit: number;
      }>(endpoint);

      setListings(data.items || []);
      setIsNearby(Boolean(data.is_nearby));
      setSearchFeedback({
        location: data.search_location || null,
        message: data.message || null,
      });
    } catch (err) {
      console.error("Failed to load listings:", err);
      setError("Failed to load listings. Please make sure the backend server is running.");
      setListings([]);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  return (
    <main className="min-h-screen flex flex-col bg-white">
      {/* 1. Category Bar Carousel with Filters button */}
      <CategoryBar />

      {/* 2. Main Explore Listings Feed */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1">
        {/* Nearby / Proximity Notice Banner */}
        {isNearby && searchFeedback.location && !isLoading && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-center justify-between gap-4 animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                <span className="text-sm">📍</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-amber-900">
                  Showing stays near &ldquo;{searchFeedback.location}&rdquo;
                </p>
                <p className="text-xs text-amber-700 mt-0.5">
                  We found {listings.length} {listings.length === 1 ? "stay" : "stays"} nearby within accessible distance.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={resetFilters}
              className="text-xs font-semibold px-3.5 py-1.5 rounded-xl bg-white border border-amber-200 text-amber-900 hover:bg-amber-100/50 transition shrink-0"
            >
              Clear search
            </button>
          </div>
        )}

        {/* Destination Result Heading */}
        {filters.destination && !isNearby && !isLoading && listings.length > 0 && (
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-xl font-bold text-neutral-900">
              Stays in &ldquo;{filters.destination}&rdquo;
            </h1>
            <span className="text-sm text-neutral-500 font-medium">
              {listings.length} {listings.length === 1 ? "stay" : "stays"} found
            </span>
          </div>
        )}

        {error ? (
          <div className="py-16 text-center">
            <p className="text-red-500 font-medium mb-3">{error}</p>
            <button
              type="button"
              onClick={fetchListings}
              className="px-4 py-2 bg-airbnb-dark text-white rounded-xl text-sm font-semibold hover:bg-black transition-colors"
            >
              Retry
            </button>
          </div>
        ) : (
          <ListingGrid
            listings={listings}
            isLoading={isLoading}
            onClearFilters={resetFilters}
          />
        )}
      </div>
    </main>
  );
}
