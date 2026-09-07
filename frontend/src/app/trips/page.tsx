"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Calendar,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  X,
  CreditCard,
  ChevronRight,
  Compass,
  Clock,
  Ban,
  ArrowRight,
} from "lucide-react";
import { Booking } from "@/types";
import { fetchApi } from "@/lib/api";
import { formatCurrency, formatDateRange } from "@/lib/formatters";
import { useToast } from "@/context/ToastContext";
import { cn } from "@/lib/utils";

type TripFilter = "all" | "confirmed" | "completed" | "cancelled";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80";

function TripsContent() {
  const toast = useToast();
  const searchParams = useSearchParams();
  const isJustConfirmed = searchParams.get("confirmed") === "1";

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<TripFilter>("all");
  const [showCelebration, setShowCelebration] = useState(isJustConfirmed);

  // Cancellation Modal State
  const [cancellingBooking, setCancellingBooking] = useState<Booking | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelSuccessMessage, setCancelSuccessMessage] = useState<string | null>(null);

  const loadTrips = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await fetchApi<Booking[]>("/bookings/my-trips");
      setBookings(data);
    } catch (err) {
      console.error("Failed to load user trips:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTrips();
  }, [loadTrips]);

  const handleCancelBooking = async () => {
    if (!cancellingBooking) return;

    try {
      setIsCancelling(true);
      const updatedBooking = await fetchApi<Booking>(
        `/bookings/${cancellingBooking.id}/cancel`,
        { method: "POST" }
      );

      // Update state locally
      setBookings((prev) =>
        prev.map((b) => (b.id === updatedBooking.id ? updatedBooking : b))
      );

      setCancelSuccessMessage(
        `Reservation at "${cancellingBooking.listing?.title || "Property"}" cancelled. The dates have been released.`
      );
      toast.info(`Reservation cancelled. Dates released.`);
      setCancellingBooking(null);

      setTimeout(() => setCancelSuccessMessage(null), 5000);
    } catch (err: any) {
      console.error("Failed to cancel booking:", err);
      const errMsg = err.message || "Failed to cancel reservation.";
      toast.error(errMsg);
    } finally {
      setIsCancelling(false);
    }
  };

  const filteredBookings = useMemo(() => {
    if (activeFilter === "all") return bookings;
    return bookings.filter((b) => b.status === activeFilter);
  }, [bookings, activeFilter]);

  const counts = useMemo(() => {
    return {
      all: bookings.length,
      confirmed: bookings.filter((b) => b.status === "confirmed").length,
      completed: bookings.filter((b) => b.status === "completed").length,
      cancelled: bookings.filter((b) => b.status === "cancelled").length,
    };
  }, [bookings]);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Success Confirmation Banner */}
        {showCelebration && (
          <div className="mb-8 p-5 bg-emerald-50 border border-emerald-200 rounded-3xl flex items-start justify-between gap-4 animate-in fade-in">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-emerald-900 text-base">
                  Reservation confirmed! You&apos;re all set.
                </h3>
                <p className="text-emerald-700 text-sm mt-0.5">
                  Your reservation is locked in and dates are reserved. You can view all trip details below.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowCelebration(false)}
              className="p-1.5 text-emerald-700 hover:bg-emerald-100 rounded-full transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Cancel Success Alert */}
        {cancelSuccessMessage && (
          <div className="mb-8 p-4 bg-neutral-100 border border-neutral-300 rounded-2xl flex items-center justify-between gap-3 text-neutral-800 animate-in fade-in">
            <div className="flex items-center gap-2 text-sm font-medium">
              <CheckCircle2 className="w-5 h-5 text-neutral-700" />
              <span>{cancelSuccessMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setCancelSuccessMessage(null)}
              className="p-1 hover:bg-neutral-200 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Page Title */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900">
              Trips
            </h1>
            <p className="text-sm text-neutral-500 mt-1">
              Manage your upcoming reservations, past travel history, and receipts.
            </p>
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-airbnb-rose hover:underline"
          >
            <span>Explore more homes</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 border-b border-neutral-200 pb-4 overflow-x-auto no-scrollbar mb-8">
          {(
            [
              { id: "all", label: "All trips", count: counts.all },
              { id: "confirmed", label: "Upcoming / Confirmed", count: counts.confirmed },
              { id: "completed", label: "Completed", count: counts.completed },
              { id: "cancelled", label: "Cancelled", count: counts.cancelled },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveFilter(tab.id)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-semibold transition shrink-0 flex items-center gap-2",
                activeFilter === tab.id
                  ? "bg-neutral-900 text-white shadow-sm"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              )}
            >
              <span>{tab.label}</span>
              <span
                className={cn(
                  "text-xs px-2 py-0.5 rounded-full font-bold",
                  activeFilter === tab.id
                    ? "bg-neutral-700 text-white"
                    : "bg-neutral-200 text-neutral-700"
                )}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        {isLoading ? (
          <div className="space-y-6">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-44 bg-neutral-100 rounded-3xl animate-pulse"
              />
            ))}
          </div>
        ) : filteredBookings.length === 0 ? (
          /* Empty State */
          <div className="border border-neutral-200 rounded-3xl p-12 text-center max-w-lg mx-auto my-12 space-y-4">
            <div className="w-16 h-16 rounded-full bg-neutral-100 text-neutral-600 flex items-center justify-center mx-auto">
              <Compass className="w-8 h-8 stroke-[1.5]" />
            </div>
            <h3 className="text-xl font-bold text-neutral-900">
              No trips booked... yet!
            </h3>
            <p className="text-sm text-neutral-500 leading-relaxed">
              Time to dust off your bags and start planning your next great getaway. Explore thousands of world-class stays.
            </p>
            <div className="pt-2">
              <Link
                href="/"
                className="inline-block bg-gradient-to-r from-[#E61E4D] via-[#E31C5F] to-[#D70466] hover:opacity-95 text-white font-semibold text-sm px-6 py-3 rounded-xl shadow-md transition active:scale-95"
              >
                Start exploring
              </Link>
            </div>
          </div>
        ) : (
          /* Bookings List */
          <div className="space-y-6">
            {filteredBookings.map((booking) => {
              const listing = booking.listing;
              const coverUrl =
                listing?.images && listing.images.length > 0
                  ? listing.images[0].image_url
                  : FALLBACK_IMAGE;

              const isConfirmed = booking.status === "confirmed";
              const isCompleted = booking.status === "completed";
              const isCancelled = booking.status === "cancelled";

              return (
                <div
                  key={booking.id}
                  className="border border-neutral-200 rounded-3xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-all bg-white flex flex-col md:flex-row gap-6 items-start md:items-center justify-between"
                >
                  {/* Left: Thumbnail & Details */}
                  <div className="flex flex-col sm:flex-row gap-5 w-full md:w-auto">
                    {/* Listing Thumbnail */}
                    <Link
                      href={`/listings/${booking.listing_id}`}
                      className="relative w-full sm:w-44 aspect-[4/3] rounded-2xl overflow-hidden shrink-0 bg-neutral-100 group"
                    >
                      <Image
                        src={coverUrl}
                        alt={listing?.title || "Property"}
                        fill
                        sizes="(max-width: 640px) 100vw, 176px"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </Link>

                    {/* Meta Details */}
                    <div className="flex flex-col justify-between py-1 space-y-2">
                      <div>
                        {/* Status Badge */}
                        <div className="flex items-center gap-2 mb-1.5">
                          {isConfirmed && (
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Confirmed</span>
                            </span>
                          )}
                          {isCompleted && (
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-700 bg-neutral-100 px-3 py-1 rounded-full border border-neutral-300">
                              <Clock className="w-3.5 h-3.5" />
                              <span>Completed</span>
                            </span>
                          )}
                          {isCancelled && (
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
                              <Ban className="w-3.5 h-3.5" />
                              <span>Cancelled</span>
                            </span>
                          )}

                          <span className="text-xs text-neutral-400">
                            Reservation #{booking.id}
                          </span>
                        </div>

                        {/* Title & City */}
                        <Link
                          href={`/listings/${booking.listing_id}`}
                          className="font-bold text-base sm:text-lg text-neutral-900 hover:underline leading-snug line-clamp-1"
                        >
                          {listing?.title || "Vacation Stay"}
                        </Link>
                        <p className="text-xs sm:text-sm text-neutral-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 shrink-0" />
                          <span>
                            {listing?.city}, {listing?.country}
                          </span>
                        </p>
                      </div>

                      {/* Travel Dates & Guests */}
                      <div className="text-xs sm:text-sm text-neutral-600 flex flex-wrap items-center gap-x-3 gap-y-1 pt-1">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                          <span className="font-semibold text-neutral-800">
                            {formatDateRange(booking.check_in_date, booking.check_out_date)}
                          </span>
                        </div>
                        <span>·</span>
                        <span>
                          {booking.total_nights} night{booking.total_nights > 1 ? "s" : ""}
                        </span>
                        <span>·</span>
                        <span>
                          {booking.total_guests} guest{booking.total_guests > 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Pricing & Actions */}
                  <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end justify-between w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-neutral-100 gap-4">
                    {/* Total Price */}
                    <div className="text-left md:text-right">
                      <span className="text-xs text-neutral-500 font-medium block">
                        Total Paid
                      </span>
                      <span className="text-lg sm:text-xl font-bold text-neutral-900">
                        {formatCurrency(booking.total_price)}
                      </span>
                      <span className="text-[11px] text-neutral-400 block mt-0.5">
                        {booking.payment_method}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/listings/${booking.listing_id}`}
                        className="px-4 py-2 rounded-xl border border-neutral-300 hover:border-neutral-900 text-xs sm:text-sm font-semibold text-neutral-900 transition active:scale-95"
                      >
                        View listing
                      </Link>

                      {isConfirmed && (
                        <button
                          type="button"
                          onClick={() => setCancellingBooking(booking)}
                          className="px-4 py-2 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs sm:text-sm font-semibold transition active:scale-95"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Cancellation Warning Modal */}
      {cancellingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
              <div className="flex items-center gap-2 text-rose-600">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-bold text-base text-neutral-900">
                  Cancel this reservation?
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setCancellingBooking(null)}
                className="p-1 rounded-full hover:bg-neutral-100"
              >
                <X className="w-5 h-5 text-neutral-600" />
              </button>
            </div>

            <p className="text-sm text-neutral-600 leading-relaxed">
              Are you sure you want to cancel your stay at{" "}
              <span className="font-bold text-neutral-900">
                {cancellingBooking.listing?.title || "this property"}
              </span>{" "}
              for{" "}
              <span className="font-semibold text-neutral-900">
                {formatDateRange(
                  cancellingBooking.check_in_date,
                  cancellingBooking.check_out_date
                )}
              </span>
              ?
            </p>

            <div className="bg-neutral-50 p-3.5 rounded-2xl border border-neutral-200 text-xs text-neutral-600 space-y-1">
              <p className="font-semibold text-neutral-800">Cancellation terms:</p>
              <p>• Your dates will be released and made available for other guests.</p>
              <p>• A full refund of {formatCurrency(cancellingBooking.total_price)} will be credited back to your payment method.</p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={isCancelling}
                onClick={() => setCancellingBooking(null)}
                className="px-4 py-2.5 rounded-xl border border-neutral-300 font-semibold text-sm text-neutral-800 hover:bg-neutral-100 transition"
              >
                Keep reservation
              </button>
              <button
                type="button"
                disabled={isCancelling}
                onClick={handleCancelBooking}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm transition shadow flex items-center gap-2"
              >
                {isCancelling ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Cancelling...</span>
                  </>
                ) : (
                  <span>Yes, cancel reservation</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TripsPage() {
  return (
    <React.Suspense
      fallback={
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="h-8 w-48 bg-neutral-200 rounded animate-pulse mb-8" />
          <div className="space-y-6">
            <div className="h-44 bg-neutral-100 rounded-3xl animate-pulse" />
            <div className="h-44 bg-neutral-100 rounded-3xl animate-pulse" />
          </div>
        </div>
      }
    >
      <TripsContent />
    </React.Suspense>
  );
}
