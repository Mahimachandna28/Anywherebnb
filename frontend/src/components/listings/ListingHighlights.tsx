"use client";

import React from "react";
import { Award, Key, MapPin, Sparkles, ShieldCheck } from "lucide-react";

interface ListingHighlightsProps {
  isSuperhost?: boolean;
  hostName?: string;
  rating?: number;
  location?: string;
}

export function ListingHighlights({
  isSuperhost = false,
  hostName = "The host",
  rating = 4.9,
  location,
}: ListingHighlightsProps) {
  return (
    <div className="py-6 border-b border-neutral-200 space-y-6">
      {/* 1. Self Check-in Highlight */}
      <div className="flex items-start gap-4">
        <Key className="w-6 h-6 text-neutral-800 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-semibold text-neutral-900 text-[15px]">
            Self check-in
          </h4>
          <p className="text-neutral-500 text-sm">
            Check yourself in easily with the smart lock or keypad.
          </p>
        </div>
      </div>

      {/* 2. Superhost Highlight */}
      {isSuperhost && (
        <div className="flex items-start gap-4">
          <Award className="w-6 h-6 text-airbnb-rose shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-neutral-900 text-[15px]">
              {hostName} is a Superhost
            </h4>
            <p className="text-neutral-500 text-sm">
              Superhosts are experienced, highly rated hosts committed to great stays.
            </p>
          </div>
        </div>
      )}

      {/* 3. Great Location Highlight */}
      {rating >= 4.8 && (
        <div className="flex items-start gap-4">
          <MapPin className="w-6 h-6 text-neutral-800 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-neutral-900 text-[15px]">
              Exceptional location
            </h4>
            <p className="text-neutral-500 text-sm">
              95% of recent guests gave the location a 5-star rating.
            </p>
          </div>
        </div>
      )}

      {/* 4. Free Cancellation Highlight */}
      <div className="flex items-start gap-4">
        <ShieldCheck className="w-6 h-6 text-neutral-800 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-semibold text-neutral-900 text-[15px]">
            Free cancellation available
          </h4>
          <p className="text-neutral-500 text-sm">
            Cancel up to 48 hours before check-in for a full refund.
          </p>
        </div>
      </div>
    </div>
  );
}
