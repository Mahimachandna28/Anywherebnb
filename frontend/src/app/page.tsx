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
        skip: number;
        limit: number;
      }>(endpoint);

      setListings(data.items || []);
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
