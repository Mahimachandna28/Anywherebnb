"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Star, ChevronDown, Minus, Plus } from "lucide-react";
import { Listing } from "@/types";
import { formatCurrency, formatRating } from "@/lib/formatters";
import { differenceInDays, parseISO, format } from "date-fns";
import { useUser } from "@/context/UserContext";

interface BookingWidgetProps {
  listing: Listing;
  checkIn: string | null;
  checkOut: string | null;
  onFocusCalendar?: () => void;
  totalGuests: number;
  onGuestChange: (guests: number) => void;
}

export function BookingWidget({
  listing,
  checkIn,
  checkOut,
  onFocusCalendar,
  totalGuests,
  onGuestChange,
}: BookingWidgetProps) {
  const router = useRouter();
  const { isLoggedIn, openAuthModal } = useUser();

  const [isGuestPickerOpen, setIsGuestPickerOpen] = useState(false);
  const [adults, setAdults] = useState(Math.max(1, totalGuests));
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);

  const guestPickerRef = useRef<HTMLDivElement>(null);

  // Sync total guests to parent
  useEffect(() => {
    const total = adults + children;
    onGuestChange(total);
  }, [adults, children, onGuestChange]);

  // Click outside to close guest popover
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        guestPickerRef.current &&
        !guestPickerRef.current.contains(event.target as Node)
      ) {
        setIsGuestPickerOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    try {
      const n = differenceInDays(parseISO(checkOut), parseISO(checkIn));
      return n > 0 ? n : 0;
    } catch {
      return 0;
    }
  }, [checkIn, checkOut]);

  // Itemized pricing calculation matching backend pricing service
  const pricing = useMemo(() => {
    if (nights <= 0) return null;
    const basePrice = listing.price_per_night * nights;
    const cleaningFee = listing.cleaning_fee || 0;
    const serviceRate = listing.service_fee_rate || 0.14;
    const serviceFee = Math.round(basePrice * serviceRate);
    const totalPrice = basePrice + cleaningFee + serviceFee;

    return {
      basePrice,
      cleaningFee,
      serviceFee,
      totalPrice,
    };
  }, [nights, listing]);

  const handleReserve = () => {
    if (!checkIn || !checkOut || nights <= 0) {
      if (onFocusCalendar) onFocusCalendar();
      return;
    }

    if (!isLoggedIn) {
      openAuthModal({
        title: "Log in or sign up to book",
        message: "You need to log in or create an account to reserve this property.",
        mode: "login",
      });
      return;
    }

    // Navigate to Checkout Page
    const query = new URLSearchParams({
      checkIn,
      checkOut,
      guests: String(totalGuests),
      adults: String(adults),
      children: String(children),
      infants: String(infants),
    });

    router.push(`/book/${listing.id}?${query.toString()}`);
  };

  const formattedCheckIn = checkIn ? format(parseISO(checkIn), "MM/dd/yyyy") : null;
  const formattedCheckOut = checkOut ? format(parseISO(checkOut), "MM/dd/yyyy") : null;

  const currentCount = adults + children;
  const maxAllowed = listing.max_guests;

  return (
    <div className="sticky top-28 bg-white border border-neutral-200 rounded-3xl p-6 shadow-xl space-y-6">
      {/* 1. Header: Nightly Rate & Star Rating */}
      <div className="flex items-baseline justify-between gap-2">
        <div className="flex items-baseline gap-1">
          <span className="text-2xl sm:text-3xl font-bold text-neutral-900">
            {formatCurrency(listing.price_per_night)}
          </span>
          <span className="text-neutral-500 font-normal text-base">night</span>
        </div>

        <div className="flex items-center gap-1 text-sm font-semibold text-neutral-900">
          <Star className="w-3.5 h-3.5 fill-current text-neutral-900" />
          <span>{listing.rating ? formatRating(listing.rating) : "New"}</span>
          <span>·</span>
          <span className="underline font-normal text-neutral-500">
            {listing.review_count} {listing.review_count === 1 ? "review" : "reviews"}
          </span>
        </div>
      </div>

      {/* 2. Combined Date & Guest Picker Box */}
      <div className="border border-neutral-300 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-neutral-900 transition">
        {/* Dates Row */}
        <div
          onClick={onFocusCalendar}
          className="grid grid-cols-2 border-b border-neutral-300 cursor-pointer"
        >
          <div className="p-3 border-r border-neutral-300 hover:bg-neutral-50 transition">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-neutral-800">
              CHECK-IN
            </span>
            <span className="text-sm font-medium text-neutral-900 truncate block mt-0.5">
              {formattedCheckIn || "Add date"}
            </span>
          </div>

          <div className="p-3 hover:bg-neutral-50 transition">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-neutral-800">
              CHECKOUT
            </span>
            <span className="text-sm font-medium text-neutral-900 truncate block mt-0.5">
              {formattedCheckOut || "Add date"}
            </span>
          </div>
        </div>

        {/* Guests Dropdown Row */}
        <div ref={guestPickerRef} className="relative">
          <div
            onClick={() => setIsGuestPickerOpen((prev) => !prev)}
            className="p-3 cursor-pointer hover:bg-neutral-50 transition flex items-center justify-between"
          >
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-neutral-800">
                GUESTS
              </span>
              <span className="text-sm font-medium text-neutral-900 block mt-0.5">
                {totalGuests} {totalGuests === 1 ? "guest" : "guests"}
                {infants > 0 ? `, ${infants} infant${infants > 1 ? "s" : ""}` : ""}
              </span>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-neutral-600 transition-transform ${
                isGuestPickerOpen ? "rotate-180" : ""
              }`}
            />
          </div>

          {/* Guest Stepper Popover */}
          {isGuestPickerOpen && (
            <div className="absolute top-full left-0 right-0 z-30 bg-white border border-neutral-200 rounded-2xl p-4 shadow-2xl space-y-4 animate-in fade-in-50 zoom-in-95 mt-1">
              {/* Adults */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm text-neutral-900">Adults</p>
                  <p className="text-xs text-neutral-500">Age 13+</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={adults <= 1}
                    onClick={() => setAdults((prev) => Math.max(1, prev - 1))}
                    className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center text-neutral-600 hover:border-neutral-900 disabled:opacity-30 transition"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-4 text-center font-semibold text-sm">
                    {adults}
                  </span>
                  <button
                    type="button"
                    disabled={currentCount >= maxAllowed}
                    onClick={() => setAdults((prev) => prev + 1)}
                    className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center text-neutral-600 hover:border-neutral-900 disabled:opacity-30 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Children */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm text-neutral-900">Children</p>
                  <p className="text-xs text-neutral-500">Ages 2–12</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={children <= 0}
                    onClick={() => setChildren((prev) => Math.max(0, prev - 1))}
                    className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center text-neutral-600 hover:border-neutral-900 disabled:opacity-30 transition"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-4 text-center font-semibold text-sm">
                    {children}
                  </span>
                  <button
                    type="button"
                    disabled={currentCount >= maxAllowed}
                    onClick={() => setChildren((prev) => prev + 1)}
                    className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center text-neutral-600 hover:border-neutral-900 disabled:opacity-30 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Infants */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm text-neutral-900">Infants</p>
                  <p className="text-xs text-neutral-500">Under 2</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={infants <= 0}
                    onClick={() => setInfants((prev) => Math.max(0, prev - 1))}
                    className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center text-neutral-600 hover:border-neutral-900 disabled:opacity-30 transition"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-4 text-center font-semibold text-sm">
                    {infants}
                  </span>
                  <button
                    type="button"
                    onClick={() => setInfants((prev) => prev + 1)}
                    className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center text-neutral-600 hover:border-neutral-900 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsGuestPickerOpen(false)}
                  className="text-xs font-bold underline text-neutral-900"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. Signature Airbnb "Reserve" Button */}
      <button
        type="button"
        onClick={handleReserve}
        className="w-full bg-gradient-to-r from-[#E61E4D] via-[#E31C5F] to-[#D70466] hover:opacity-95 text-white font-semibold py-3.5 rounded-xl shadow-md transition-all active:scale-[0.98] text-base"
      >
        {nights > 0 ? "Reserve" : "Check availability"}
      </button>

      <p className="text-center text-xs text-neutral-500">
        You won't be charged yet
      </p>

      {/* 4. Live Itemized Price Calculation Breakdown */}
      {pricing ? (
        <div className="space-y-3 pt-4 text-sm text-neutral-700">
          <div className="flex justify-between">
            <span className="underline">
              {formatCurrency(listing.price_per_night)} × {nights} night
              {nights > 1 ? "s" : ""}
            </span>
            <span>{formatCurrency(pricing.basePrice)}</span>
          </div>

          <div className="flex justify-between">
            <span className="underline">Cleaning fee</span>
            <span>{formatCurrency(pricing.cleaningFee)}</span>
          </div>

          <div className="flex justify-between">
            <span className="underline">Anywherebnb service fee (14%)</span>
            <span>{formatCurrency(pricing.serviceFee)}</span>
          </div>

          <div className="border-t border-neutral-200 pt-4 flex justify-between font-bold text-neutral-900 text-base">
            <span>Total before taxes</span>
            <span>{formatCurrency(pricing.totalPrice)}</span>
          </div>
        </div>
      ) : (
        <div className="pt-2 text-center text-xs text-neutral-500">
          Select check-in and checkout dates above to calculate the total price.
        </div>
      )}
    </div>
  );
}
