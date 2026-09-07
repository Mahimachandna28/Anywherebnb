"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ArrowLeft } from "lucide-react";
import { Listing } from "@/types";
import { fetchApi } from "@/lib/api";
import {
  ListingHeader,
  PhotoCollage,
  PhotoModal,
} from "@/components/listings";

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const listingId = Number(params?.id);

  const [listing, setListing] = useState<Listing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Photo gallery modal state
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [photoModalIndex, setPhotoModalIndex] = useState(0);

  useEffect(() => {
    if (!listingId || isNaN(listingId)) {
      setError("Invalid listing ID");
      setIsLoading(false);
      return;
    }

    async function loadListing() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchApi<Listing>(`/listings/${listingId}`);
        setListing(data);
      } catch (err: any) {
        console.error("Failed to load listing:", err);
        setError(err.message || "Failed to load listing details");
      } finally {
        setIsLoading(false);
      }
    }

    loadListing();
  }, [listingId]);

  const handleOpenPhotoModal = (initialIndex = 0) => {
    setPhotoModalIndex(initialIndex);
    setIsPhotoModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
        {/* Title skeleton */}
        <div className="h-8 w-2/3 bg-neutral-200 rounded-lg mb-3" />
        <div className="h-4 w-1/3 bg-neutral-200 rounded mb-6" />

        {/* Collage skeleton */}
        <div className="h-[420px] lg:h-[480px] w-full bg-neutral-200 rounded-2xl mb-8" />

        {/* Content skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-6 w-1/2 bg-neutral-200 rounded" />
            <div className="h-4 w-full bg-neutral-200 rounded" />
            <div className="h-4 w-5/6 bg-neutral-200 rounded" />
          </div>
          <div className="h-80 bg-neutral-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">
          Listing not found
        </h2>
        <p className="text-neutral-500 text-sm mb-6">
          {error || "The property you are looking for does not exist or has been removed."}
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-airbnb-dark hover:bg-black text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to explore</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20">
        {/* Breadcrumb / Back button */}
        <div className="mb-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-700 hover:text-neutral-900 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>All homes</span>
          </button>
        </div>

        {/* 1. Listing Title, Meta & Actions */}
        <ListingHeader
          listingId={listing.id}
          title={listing.title}
          rating={listing.rating}
          reviewCount={listing.review_count}
          city={listing.city}
          state={listing.state}
          country={listing.country}
          isSuperhost={listing.host?.is_superhost}
        />

        {/* 2. 5-Photo Collage Grid with Show All Photos Button */}
        <PhotoCollage
          images={listing.images}
          title={listing.title}
          onOpenModal={handleOpenPhotoModal}
        />

        {/* 3. Stage 6.2 & 6.3 Details Section Placeholder */}
        <div className="mt-8 pt-8 border-t border-neutral-200">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Left Column: Property Info & Details */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-semibold text-neutral-900">
                  {listing.room_type} in {listing.city}, {listing.country}
                </h2>
                <p className="text-neutral-600 text-sm mt-1">
                  {listing.max_guests} guests · {listing.bedrooms} {listing.bedrooms === 1 ? "bedroom" : "bedrooms"} · {listing.beds} {listing.beds === 1 ? "bed" : "beds"} · {listing.bathrooms} {listing.bathrooms === 1 ? "bath" : "baths"}
                </p>
              </div>

              <div className="border-t border-neutral-200 pt-6">
                <h3 className="text-lg font-semibold text-neutral-900 mb-3">About this place</h3>
                <p className="text-neutral-700 leading-relaxed whitespace-pre-line text-sm sm:text-base">
                  {listing.description}
                </p>
              </div>
            </div>

            {/* Right Column: Pricing snippet */}
            <div className="lg:col-span-1">
              <div className="border border-neutral-200 rounded-2xl p-6 shadow-airbnb">
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-2xl font-bold text-neutral-900">
                    ${listing.price_per_night}
                  </span>
                  <span className="text-neutral-600 text-sm">night</span>
                </div>
                <div className="text-xs text-neutral-500 mb-4">
                  Interactive 2-month calendar and sticky checkout widget loading in Stage 6.3...
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 4. Fullscreen Photo Lightbox Modal */}
      <PhotoModal
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
        images={listing.images}
        title={listing.title}
        initialIndex={photoModalIndex}
        listingId={listing.id}
      />
    </div>
  );
}
