"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ArrowLeft } from "lucide-react";
import { Listing } from "@/types";
import { fetchApi } from "@/lib/api";
import {
  ListingHeader,
  PhotoCollage,
  PhotoModal,
  HostBanner,
  ListingHighlights,
  SleepingArrangements,
  AmenitiesSection,
  ListingCalendar,
  BookingWidget,
  ReviewsSection,
  ListingMap,
  ListingSubNav,
  MobileReserveFooter,
} from "@/components/listings";

export default function ListingDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const listingId = Number(params?.id);

  const initialCheckIn = searchParams.get("checkIn");
  const initialCheckOut = searchParams.get("checkOut");
  const initialGuests = Number(searchParams.get("guests")) || 1;

  const [listing, setListing] = useState<Listing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Booking & Calendar State (initialized from search parameters if provided)
  const [checkIn, setCheckIn] = useState<string | null>(initialCheckIn || null);
  const [checkOut, setCheckOut] = useState<string | null>(initialCheckOut || null);
  const [guests, setGuests] = useState<number>(initialGuests);
  const calendarRef = useRef<HTMLDivElement>(null);

  const scrollToCalendar = () => {
    calendarRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

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
      {/* Sticky Sub-Navigation Header matching user screenshot */}
      <ListingSubNav listing={listing} onReserveClick={scrollToCalendar} />

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

        {/* 3. Property Information & Highlights Section */}
        <div className="mt-8 pt-8 border-t border-neutral-200">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative">
            {/* Left Column: Property Info, Highlights, Amenities & Calendar */}
            <div className="lg:col-span-2 space-y-2">
              {/* 3.1 Host Banner & Room Specs */}
              <HostBanner
                host={listing.host}
                roomType={listing.room_type}
                city={listing.city}
                country={listing.country}
                maxGuests={listing.max_guests}
                bedrooms={listing.bedrooms}
                beds={listing.beds}
                bathrooms={listing.bathrooms}
                rating={listing.rating}
                reviewCount={listing.review_count}
              />

              {/* 3.2 Property Highlights */}
              <ListingHighlights
                isSuperhost={listing.host?.is_superhost}
                hostName={listing.host?.name}
                rating={listing.rating}
                location={listing.city}
              />

              {/* 3.3 Description */}
              <div className="py-6 border-b border-neutral-200 space-y-3">
                <h3 className="text-xl font-semibold text-neutral-900">
                  About this place
                </h3>
                <p className="text-neutral-700 leading-relaxed whitespace-pre-line text-[15px]">
                  {listing.description}
                </p>
              </div>

              {/* 3.4 Sleeping Arrangements */}
              <SleepingArrangements
                bedrooms={listing.bedrooms}
                beds={listing.beds}
              />

              {/* 3.5 Full Amenities with Modal */}
              <div id="amenities-section">
                <AmenitiesSection
                  amenities={listing.amenities || []}
                />
              </div>

              {/* 3.6 Interactive 2-Month Availability Calendar */}
              <div ref={calendarRef}>
                <ListingCalendar
                  bookedDates={listing.booked_dates || []}
                  checkIn={checkIn}
                  checkOut={checkOut}
                  onChange={(ci, co) => {
                    setCheckIn(ci);
                    setCheckOut(co);
                  }}
                  city={listing.city}
                />
              </div>
            </div>

            {/* Right Column: Sticky Booking Price Calculation Widget */}
            <div className="lg:col-span-1">
              <BookingWidget
                listing={listing}
                checkIn={checkIn}
                checkOut={checkOut}
                onFocusCalendar={scrollToCalendar}
                totalGuests={guests}
                onGuestChange={setGuests}
              />
            </div>
          </div>
        </div>

        {/* 4. 6-Category Reviews Breakdown Section */}
        <div className="mt-8" id="reviews-section">
          <ReviewsSection
            reviews={listing.reviews || []}
            rating={listing.rating}
            reviewCount={listing.review_count}
          />
        </div>

        {/* 5. Where you'll be - Interactive Map with Nearby Famous Places */}
        <div className="mt-8">
          <ListingMap listing={listing} />
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

      {/* 6. Sticky Mobile Reservation Footer (Clean Airbnb style on small screens) */}
      <MobileReserveFooter
        listing={listing}
        checkIn={checkIn}
        checkOut={checkOut}
        guests={guests}
        onFocusCalendar={scrollToCalendar}
      />
    </div>
  );
}
