"use client";

import React, { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { Listing } from "@/types";
import { formatCurrency, formatRating } from "@/lib/formatters";

interface ListingSubNavProps {
  listing: Listing;
  onReserveClick: () => void;
}

export function ListingSubNav({ listing, onReserveClick }: ListingSubNavProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<"photos" | "amenities" | "reviews" | "location">("photos");

  useEffect(() => {
    function handleScroll() {
      if (typeof window !== "undefined") {
        if (window.scrollY > 480) {
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string, tab: "photos" | "amenities" | "reviews" | "location") => {
    setActiveTab(tab);
    if (id === "top") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const elem = document.getElementById(id);
    if (elem) {
      const topOffset = elem.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: topOffset, behavior: "smooth" });
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200 shadow-xs transition-all duration-200 animate-in fade-in slide-in-from-top-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Left: Navigation Tabs (Direct Match to User Screenshot) */}
        <div className="flex items-center gap-6 sm:gap-8 text-sm font-semibold">
          <button
            type="button"
            onClick={() => scrollToSection("top", "photos")}
            className={`py-6 border-b-2 transition cursor-pointer ${
              activeTab === "photos"
                ? "border-neutral-900 text-neutral-900"
                : "border-transparent text-neutral-600 hover:text-neutral-900"
            }`}
          >
            Photos
          </button>

          <button
            type="button"
            onClick={() => scrollToSection("amenities-section", "amenities")}
            className={`py-6 border-b-2 transition cursor-pointer ${
              activeTab === "amenities"
                ? "border-neutral-900 text-neutral-900"
                : "border-transparent text-neutral-600 hover:text-neutral-900"
            }`}
          >
            Amenities
          </button>

          <button
            type="button"
            onClick={() => scrollToSection("reviews-section", "reviews")}
            className={`py-6 border-b-2 transition cursor-pointer ${
              activeTab === "reviews"
                ? "border-neutral-900 text-neutral-900"
                : "border-transparent text-neutral-600 hover:text-neutral-900"
            }`}
          >
            Reviews
          </button>

          <button
            type="button"
            onClick={() => scrollToSection("location-section", "location")}
            className={`py-6 border-b-2 transition cursor-pointer ${
              activeTab === "location"
                ? "border-neutral-900 text-neutral-900"
                : "border-transparent text-neutral-600 hover:text-neutral-900"
            }`}
          >
            Location
          </button>
        </div>

        {/* Right: Pricing, Rating & Red Reserve Button (Direct Match to User Screenshot) */}
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <div className="flex items-center justify-end gap-1">
              <span className="font-bold text-neutral-900 text-base">
                ₹{formatCurrency(listing.price_per_night)}
              </span>
              <span className="text-xs text-neutral-500 font-normal">night</span>
            </div>
            <div className="flex items-center justify-end gap-1 text-xs text-neutral-600 font-semibold">
              <Star className="w-3 h-3 fill-neutral-900 stroke-neutral-900" />
              <span>{formatRating(listing.rating)}</span>
              <span className="text-neutral-400 font-normal">·</span>
              <span className="underline font-normal">{listing.review_count} reviews</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onReserveClick}
            className="px-6 py-2.5 rounded-xl bg-[#E00B41] hover:bg-[#D70466] active:scale-95 text-white font-semibold text-sm transition shadow-sm cursor-pointer"
          >
            Reserve
          </button>
        </div>
      </div>
    </div>
  );
}
