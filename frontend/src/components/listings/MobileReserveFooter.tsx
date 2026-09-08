"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Listing } from "@/types";
import { formatCurrency } from "@/lib/formatters";
import { differenceInDays, parseISO, format } from "date-fns";
import { useUser } from "@/context/UserContext";

interface MobileReserveFooterProps {
  listing: Listing;
  checkIn: string | null;
  checkOut: string | null;
  guests: number;
  onFocusCalendar: () => void;
}

export function MobileReserveFooter({
  listing,
  checkIn,
  checkOut,
  guests,
  onFocusCalendar,
}: MobileReserveFooterProps) {
  const router = useRouter();
  const { isLoggedIn, openAuthModal } = useUser();

  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    try {
      const n = differenceInDays(parseISO(checkOut), parseISO(checkIn));
      return n > 0 ? n : 0;
    } catch {
      return 0;
    }
  }, [checkIn, checkOut]);

  const pricing = useMemo(() => {
    if (nights <= 0) return null;
    const basePrice = listing.price_per_night * nights;
    const cleaningFee = listing.cleaning_fee || 0;
    const serviceRate = listing.service_fee_rate || 0.14;
    const serviceFee = Math.round(basePrice * serviceRate);
    const totalPrice = basePrice + cleaningFee + serviceFee;
    return { totalPrice };
  }, [nights, listing]);

  const handleReserve = () => {
    if (!checkIn || !checkOut || nights <= 0) {
      onFocusCalendar();
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

    const query = new URLSearchParams({
      checkIn,
      checkOut,
      guests: String(guests),
      adults: String(Math.max(1, guests)),
      children: "0",
      infants: "0",
    });

    router.push(`/book/${listing.id}?${query.toString()}`);
  };

  const formattedDateRange = useMemo(() => {
    if (checkIn && checkOut) {
      try {
        const dIn = format(parseISO(checkIn), "MMM d");
        const dOut = format(parseISO(checkOut), "MMM d");
        return `${dIn} – ${dOut}`;
      } catch {
        return null;
      }
    }
    return null;
  }, [checkIn, checkOut]);

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-neutral-200 px-5 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] flex items-center justify-between">
      {/* Left: Pricing & Dates */}
      <div className="flex flex-col justify-center">
        <div className="flex items-baseline gap-1">
          <span className="text-base font-bold text-neutral-900">
            {pricing
              ? formatCurrency(pricing.totalPrice)
              : formatCurrency(listing.price_per_night)}
          </span>
          <span className="text-xs text-neutral-500 font-normal">
            {pricing ? `for ${nights} night${nights > 1 ? "s" : ""}` : "night"}
          </span>
        </div>

        <button
          type="button"
          onClick={onFocusCalendar}
          className="text-xs font-semibold text-neutral-700 underline text-left mt-0.5 hover:text-neutral-900 transition-colors"
        >
          {formattedDateRange || "Select dates"}
        </button>
      </div>

      {/* Right: Reserve CTA */}
      <button
        type="button"
        onClick={handleReserve}
        className="bg-gradient-to-r from-[#E61E4D] via-[#E31C5F] to-[#D70466] hover:opacity-95 text-white font-semibold text-sm px-6 py-3 rounded-xl shadow-md transition active:scale-95"
      >
        {nights > 0 ? "Reserve" : "Check availability"}
      </button>
    </div>
  );
}
