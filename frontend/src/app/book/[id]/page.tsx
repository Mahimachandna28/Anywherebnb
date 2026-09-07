"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronLeft,
  Star,
  ShieldCheck,
  CreditCard,
  Lock,
  Sparkles,
  AlertCircle,
  Check,
  Minus,
  Plus,
  X,
  Calendar,
} from "lucide-react";
import { Listing, Booking } from "@/types";
import { fetchApi } from "@/lib/api";
import { formatCurrency, formatRating, formatDateRange } from "@/lib/formatters";
import { differenceInDays, parseISO, format, addDays } from "date-fns";
import { cn } from "@/lib/utils";

function CheckoutContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const listingId = Number(params?.id);

  const [listing, setListing] = useState<Listing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Booking details from URL search params with sensible defaults
  const initialCheckIn = searchParams.get("checkIn");
  const initialCheckOut = searchParams.get("checkOut");
  const initialAdults = Number(searchParams.get("adults") || searchParams.get("guests") || "1");
  const initialChildren = Number(searchParams.get("children") || "0");
  const initialInfants = Number(searchParams.get("infants") || "0");

  const [checkIn, setCheckIn] = useState<string>(
    initialCheckIn || format(addDays(new Date(), 2), "yyyy-MM-dd")
  );
  const [checkOut, setCheckOut] = useState<string>(
    initialCheckOut || format(addDays(new Date(), 6), "yyyy-MM-dd")
  );
  const [adults, setAdults] = useState<number>(Math.max(1, initialAdults));
  const [children, setChildren] = useState<number>(initialChildren);
  const [infants, setInfants] = useState<number>(initialInfants);

  // Edit popups
  const [isEditingDates, setIsEditingDates] = useState(false);
  const [isEditingGuests, setIsEditingGuests] = useState(false);

  // Mock Payment state
  const [paymentMethod, setPaymentMethod] = useState<"card" | "paypal" | "gpay">("card");
  const [cardNumber, setCardNumber] = useState("4242 •••• •••• 4242");
  const [cardExpiry, setCardExpiry] = useState("12/28");
  const [cardCvc, setCardCvc] = useState("123");
  const [cardZip, setCardZip] = useState("90210");

  useEffect(() => {
    if (!listingId || isNaN(listingId)) {
      setErrorMessage("Invalid listing specified.");
      setIsLoading(false);
      return;
    }

    async function loadListing() {
      try {
        setIsLoading(true);
        const data = await fetchApi<Listing>(`/listings/${listingId}`);
        setListing(data);
      } catch (err: any) {
        console.error("Failed to load listing for checkout:", err);
        setErrorMessage(err.message || "Failed to load listing details.");
      } finally {
        setIsLoading(false);
      }
    }

    loadListing();
  }, [listingId]);

  const totalGuests = adults + children;

  const nights = useMemo(() => {
    try {
      const n = differenceInDays(parseISO(checkOut), parseISO(checkIn));
      return n > 0 ? n : 0;
    } catch {
      return 0;
    }
  }, [checkIn, checkOut]);

  // Itemized pricing
  const pricing = useMemo(() => {
    if (!listing || nights <= 0) return null;
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
  }, [listing, nights]);

  const handleConfirmAndPay = async () => {
    if (!listing) return;

    if (nights <= 0) {
      setErrorMessage("Please select valid check-in and checkout dates.");
      return;
    }

    if (totalGuests > listing.max_guests) {
      setErrorMessage(`This property accommodates a maximum of ${listing.max_guests} guests.`);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const paymentLabel =
      paymentMethod === "card"
        ? `Credit Card (ending in ${cardNumber.slice(-4)})`
        : paymentMethod === "paypal"
        ? "PayPal (Instant)"
        : "Google Pay";

    try {
      await fetchApi<Booking>("/bookings", {
        method: "POST",
        body: JSON.stringify({
          listing_id: listing.id,
          check_in_date: checkIn,
          check_out_date: checkOut,
          total_guests: totalGuests,
          adults: adults,
          children: children,
          infants: infants,
          payment_method: paymentLabel,
        }),
      });

      // Successful reservation: redirect to My Trips
      router.push("/trips?confirmed=1");
    } catch (err: any) {
      console.error("Failed to create booking:", err);
      setErrorMessage(
        err.message || "These dates are no longer available. Please select different dates."
      );
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 animate-pulse space-y-6">
        <div className="h-8 w-1/4 bg-neutral-200 rounded" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7 space-y-6">
            <div className="h-32 bg-neutral-200 rounded-2xl" />
            <div className="h-48 bg-neutral-200 rounded-2xl" />
          </div>
          <div className="lg:col-span-5">
            <div className="h-96 bg-neutral-200 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-neutral-900">Listing Not Found</h2>
        <p className="text-neutral-500 text-sm">{errorMessage}</p>
        <Link
          href="/"
          className="inline-block bg-neutral-900 text-white px-5 py-2.5 rounded-xl text-sm font-semibold"
        >
          Return to Explore
        </Link>
      </div>
    );
  }

  const coverImage =
    listing.images && listing.images.length > 0
      ? listing.images[0].image_url
      : "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80";

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Back navigation header */}
        <div className="flex items-center gap-3 mb-8">
          <button
            type="button"
            onClick={() => router.back()}
            className="p-2 -ml-2 rounded-full hover:bg-neutral-100 transition text-neutral-800"
            aria-label="Back"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900">
            Request to book
          </h1>
        </div>

        {/* Error Banner */}
        {errorMessage && (
          <div className="mb-8 p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-800 animate-in fade-in">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600" />
            <div className="text-sm">
              <p className="font-semibold">Reservation could not be completed</p>
              <p className="mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* LEFT COLUMN: Trip Review & Payment */}
          <div className="lg:col-span-7 space-y-8">
            {/* Rare Find Banner */}
            <div className="border border-neutral-200 rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4">
              <div>
                <p className="font-bold text-neutral-900 text-sm sm:text-base">
                  This is a rare find
                </p>
                <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
                  {listing.host?.name || "The host"}&apos;s place on Anywherebnb is usually fully booked.
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-rose-50 text-airbnb-rose flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
            </div>

            {/* 1. Your Trip Section */}
            <div className="space-y-4 pb-8 border-b border-neutral-200">
              <h2 className="text-xl font-semibold text-neutral-900">Your trip</h2>

              {/* Dates */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-sm text-neutral-900">Dates</h3>
                  <p className="text-sm text-neutral-600 mt-0.5">
                    {formatDateRange(checkIn, checkOut)} ({nights} nights)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditingDates(true)}
                  className="font-semibold text-sm underline text-neutral-900 hover:text-neutral-600"
                >
                  Edit
                </button>
              </div>

              {/* Guests */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-sm text-neutral-900">Guests</h3>
                  <p className="text-sm text-neutral-600 mt-0.5">
                    {totalGuests} guest{totalGuests > 1 ? "s" : ""}
                    {infants > 0 ? `, ${infants} infant${infants > 1 ? "s" : ""}` : ""}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditingGuests(true)}
                  className="font-semibold text-sm underline text-neutral-900 hover:text-neutral-600"
                >
                  Edit
                </button>
              </div>
            </div>

            {/* 2. Pay With Section */}
            <div className="space-y-4 pb-8 border-b border-neutral-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-neutral-900">Pay with</h2>
                <div className="flex items-center gap-2 text-neutral-500 text-xs">
                  <Lock className="w-3.5 h-3.5" />
                  <span>256-bit encrypted</span>
                </div>
              </div>

              {/* Payment Method Tabs */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={cn(
                    "p-3 rounded-xl border flex flex-col items-center gap-1 text-xs font-semibold transition",
                    paymentMethod === "card"
                      ? "border-neutral-900 bg-neutral-50 text-neutral-900 ring-1 ring-neutral-900"
                      : "border-neutral-200 text-neutral-600 hover:border-neutral-400"
                  )}
                >
                  <CreditCard className="w-5 h-5" />
                  <span>Credit Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("paypal")}
                  className={cn(
                    "p-3 rounded-xl border flex flex-col items-center gap-1 text-xs font-semibold transition",
                    paymentMethod === "paypal"
                      ? "border-neutral-900 bg-neutral-50 text-neutral-900 ring-1 ring-neutral-900"
                      : "border-neutral-200 text-neutral-600 hover:border-neutral-400"
                  )}
                >
                  <span className="font-bold text-sm text-blue-600">PayPal</span>
                  <span>Fast Checkout</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("gpay")}
                  className={cn(
                    "p-3 rounded-xl border flex flex-col items-center gap-1 text-xs font-semibold transition",
                    paymentMethod === "gpay"
                      ? "border-neutral-900 bg-neutral-50 text-neutral-900 ring-1 ring-neutral-900"
                      : "border-neutral-200 text-neutral-600 hover:border-neutral-400"
                  )}
                >
                  <span className="font-bold text-sm text-neutral-800">G Pay</span>
                  <span>One-Touch</span>
                </button>
              </div>

              {/* Card Inputs (if card selected) */}
              {paymentMethod === "card" && (
                <div className="border border-neutral-300 rounded-2xl overflow-hidden mt-3">
                  <div className="p-3 border-b border-neutral-300">
                    <label className="block text-[10px] font-bold uppercase text-neutral-500">
                      Card Number
                    </label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="1234 5678 9012 3456"
                      className="w-full text-sm font-medium outline-none text-neutral-900 bg-transparent mt-0.5"
                    />
                  </div>

                  <div className="grid grid-cols-3 divide-x divide-neutral-300">
                    <div className="p-3">
                      <label className="block text-[10px] font-bold uppercase text-neutral-500">
                        Expiration
                      </label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM/YY"
                        className="w-full text-sm font-medium outline-none text-neutral-900 bg-transparent mt-0.5"
                      />
                    </div>
                    <div className="p-3">
                      <label className="block text-[10px] font-bold uppercase text-neutral-500">
                        CVV
                      </label>
                      <input
                        type="text"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        placeholder="123"
                        className="w-full text-sm font-medium outline-none text-neutral-900 bg-transparent mt-0.5"
                      />
                    </div>
                    <div className="p-3">
                      <label className="block text-[10px] font-bold uppercase text-neutral-500">
                        ZIP code
                      </label>
                      <input
                        type="text"
                        value={cardZip}
                        onChange={(e) => setCardZip(e.target.value)}
                        placeholder="ZIP"
                        className="w-full text-sm font-medium outline-none text-neutral-900 bg-transparent mt-0.5"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Cancellation Policy */}
            <div className="space-y-2 pb-8 border-b border-neutral-200">
              <h2 className="text-xl font-semibold text-neutral-900">
                Cancellation policy
              </h2>
              <p className="text-sm text-neutral-700 leading-relaxed">
                <span className="font-semibold">Free cancellation before check-in.</span> If you cancel before check-in on {format(parseISO(checkIn), "MMM d")}, you&apos;ll get a full refund minus the Anywherebnb service fee.
              </p>
            </div>

            {/* 4. Ground Rules */}
            <div className="space-y-3 pb-8 border-b border-neutral-200">
              <h2 className="text-xl font-semibold text-neutral-900">
                Ground rules
              </h2>
              <p className="text-sm text-neutral-600">
                We ask every guest to remember a few simple things about what makes a great guest:
              </p>
              <ul className="text-sm text-neutral-700 space-y-1.5 list-disc pl-5">
                <li>Follow the house rules set by the host</li>
                <li>Treat the property and neighborhood like your own home</li>
                <li>Respect quiet hours from 10:00 PM to 8:00 AM</li>
              </ul>
            </div>

            {/* 5. Submit Button & Disclaimer */}
            <div className="space-y-4 pt-2">
              <p className="text-xs text-neutral-500 leading-relaxed">
                By selecting the button below, I agree to the Host&apos;s House Rules, Ground rules for guests, Anywherebnb&apos;s Rebooking and Refund Policy, and that Anywherebnb can charge my payment method.
              </p>

              <button
                type="button"
                disabled={isSubmitting || !pricing}
                onClick={handleConfirmAndPay}
                className="w-full sm:w-auto min-w-[200px] bg-gradient-to-r from-[#E61E4D] via-[#E31C5F] to-[#D70466] hover:opacity-95 disabled:opacity-50 text-white font-semibold text-base py-3.5 px-8 rounded-xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing reservation...</span>
                  </>
                ) : (
                  <span>Confirm and pay</span>
                )}
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: Sticky Listing Summary & Price Details */}
          <div className="lg:col-span-5">
            <div className="sticky top-28 border border-neutral-200 rounded-3xl p-6 shadow-xl space-y-6 bg-white">
              {/* Thumbnail and Listing Title */}
              <div className="flex gap-4 pb-6 border-b border-neutral-200">
                <div className="relative w-28 h-24 rounded-xl overflow-hidden shrink-0 bg-neutral-100">
                  <Image
                    src={coverImage}
                    alt={listing.title}
                    fill
                    sizes="112px"
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col justify-between overflow-hidden">
                  <div>
                    <span className="text-xs text-neutral-500 font-medium truncate block">
                      {listing.room_type} in {listing.city}
                    </span>
                    <h3 className="font-semibold text-sm text-neutral-900 line-clamp-2 mt-0.5 leading-snug">
                      {listing.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1 text-xs font-semibold text-neutral-900 mt-2">
                    <Star className="w-3.5 h-3.5 fill-current text-neutral-900" />
                    <span>{formatRating(listing.rating)}</span>
                    <span className="text-neutral-500 font-normal">
                      ({listing.review_count} reviews)
                    </span>
                  </div>
                </div>
              </div>

              {/* Price Details Breakdown */}
              {pricing && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-neutral-900">
                    Price details
                  </h3>

                  <div className="space-y-3 text-sm text-neutral-700">
                    <div className="flex justify-between">
                      <span>
                        {formatCurrency(listing.price_per_night)} × {nights} night{nights > 1 ? "s" : ""}
                      </span>
                      <span>{formatCurrency(pricing.basePrice)}</span>
                    </div>

                    <div className="flex justify-between">
                      <span>Cleaning fee</span>
                      <span>{formatCurrency(pricing.cleaningFee)}</span>
                    </div>

                    <div className="flex justify-between">
                      <span>Anywherebnb service fee (14%)</span>
                      <span>{formatCurrency(pricing.serviceFee)}</span>
                    </div>

                    <div className="border-t border-neutral-200 pt-4 flex justify-between font-bold text-neutral-900 text-base">
                      <span>Total (USD)</span>
                      <span>{formatCurrency(pricing.totalPrice)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Protection Badge */}
              <div className="pt-2 flex items-start gap-3 text-xs text-neutral-500 border-t border-neutral-100">
                <ShieldCheck className="w-5 h-5 text-neutral-700 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Every booking includes free protection from Host cancellations, listing inaccuracies, and other issues like trouble checking in.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Dates Modal */}
      {isEditingDates && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
              <h3 className="font-bold text-base text-neutral-900">Change dates</h3>
              <button
                type="button"
                onClick={() => setIsEditingDates(false)}
                className="p-1 rounded-full hover:bg-neutral-100"
              >
                <X className="w-5 h-5 text-neutral-600" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Check-in Date
                </label>
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full border border-neutral-300 rounded-xl px-3 py-2 text-sm font-medium text-neutral-900 focus:outline-none focus:border-neutral-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Check-out Date
                </label>
                <input
                  type="date"
                  min={checkIn}
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full border border-neutral-300 rounded-xl px-3 py-2 text-sm font-medium text-neutral-900 focus:outline-none focus:border-neutral-900"
                />
              </div>
            </div>

            <div className="pt-3 flex justify-end">
              <button
                type="button"
                onClick={() => setIsEditingDates(false)}
                className="bg-neutral-900 text-white font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-black transition"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Guests Modal */}
      {isEditingGuests && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
              <h3 className="font-bold text-base text-neutral-900">Guests</h3>
              <button
                type="button"
                onClick={() => setIsEditingGuests(false)}
                className="p-1 rounded-full hover:bg-neutral-100"
              >
                <X className="w-5 h-5 text-neutral-600" />
              </button>
            </div>

            {/* Adults */}
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-semibold text-sm text-neutral-900">Adults</p>
                <p className="text-xs text-neutral-500">Age 13+</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={adults <= 1}
                  onClick={() => setAdults((prev) => Math.max(1, prev - 1))}
                  className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center text-neutral-600 hover:border-neutral-900 disabled:opacity-30"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-4 text-center font-semibold text-sm">{adults}</span>
                <button
                  type="button"
                  disabled={totalGuests >= listing.max_guests}
                  onClick={() => setAdults((prev) => prev + 1)}
                  className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center text-neutral-600 hover:border-neutral-900 disabled:opacity-30"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Children */}
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-semibold text-sm text-neutral-900">Children</p>
                <p className="text-xs text-neutral-500">Ages 2–12</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={children <= 0}
                  onClick={() => setChildren((prev) => Math.max(0, prev - 1))}
                  className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center text-neutral-600 hover:border-neutral-900 disabled:opacity-30"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-4 text-center font-semibold text-sm">{children}</span>
                <button
                  type="button"
                  disabled={totalGuests >= listing.max_guests}
                  onClick={() => setChildren((prev) => prev + 1)}
                  className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center text-neutral-600 hover:border-neutral-900 disabled:opacity-30"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="pt-3 flex justify-end">
              <button
                type="button"
                onClick={() => setIsEditingGuests(false)}
                className="bg-neutral-900 text-white font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-black transition"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <React.Suspense
      fallback={
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 animate-pulse space-y-6">
          <div className="h-8 w-1/4 bg-neutral-200 rounded" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-7 space-y-6">
              <div className="h-32 bg-neutral-200 rounded-2xl" />
              <div className="h-48 bg-neutral-200 rounded-2xl" />
            </div>
            <div className="lg:col-span-5">
              <div className="h-96 bg-neutral-200 rounded-2xl" />
            </div>
          </div>
        </div>
      }
    >
      <CheckoutContent />
    </React.Suspense>
  );
}
