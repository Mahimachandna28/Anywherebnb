"use client";

import React from "react";
import Image from "next/image";
import { Award, Star, Trophy } from "lucide-react";
import { User } from "@/types";
import { formatRating } from "@/lib/formatters";

interface HostBannerProps {
  host?: User;
  roomType: string;
  city: string;
  country: string;
  maxGuests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  rating: number;
  reviewCount: number;
}

const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80";

export function HostBanner({
  host,
  roomType,
  city,
  country,
  maxGuests,
  bedrooms,
  beds,
  bathrooms,
  rating,
  reviewCount,
}: HostBannerProps) {
  const hostName = host?.name || "Marco";
  const isSuperhost = host?.is_superhost ?? true;
  const isGuestFavorite = rating >= 4.96 && reviewCount >= 40;

  return (
    <div className="space-y-6 pb-6 border-b border-neutral-200">
      {/* 1. Room Specs & Host Avatar Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-neutral-900 leading-tight">
            {roomType} in {city}, {country}
          </h2>
          <p className="text-neutral-600 text-sm mt-1">
            {maxGuests} {maxGuests === 1 ? "guest" : "guests"} · {bedrooms}{" "}
            {bedrooms === 1 ? "bedroom" : "bedrooms"} · {beds}{" "}
            {beds === 1 ? "bed" : "beds"} · {bathrooms}{" "}
            {bathrooms === 1 ? "bath" : "baths"}
          </p>
        </div>

        {/* Host Avatar with Superhost badge badge overlay */}
        <div className="relative shrink-0">
          <div className="relative w-14 h-14 rounded-full overflow-hidden border border-neutral-200 shadow-sm">
            <Image
              src={host?.avatar_url || DEFAULT_AVATAR}
              alt={hostName}
              fill
              sizes="56px"
              className="object-cover"
            />
          </div>
          {isSuperhost && (
            <div
              title="Superhost"
              className="absolute -bottom-1 -right-1 bg-airbnb-rose text-white p-1 rounded-full shadow"
            >
              <Award className="w-3.5 h-3.5" />
            </div>
          )}
        </div>
      </div>

      {/* 2. Guest Favorite Trophy Ribbon */}
      {isGuestFavorite && (
        <div className="border border-neutral-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-neutral-50/70">
          {/* Left: Trophy & Laurel description */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-neutral-900 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Trophy className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <p className="font-bold text-neutral-900 text-sm sm:text-base leading-tight">
                Guest favorite
              </p>
              <p className="text-xs text-neutral-500 mt-0.5">
                One of the most loved homes on Anywherebnb based on guest ratings
              </p>
            </div>
          </div>

          {/* Right: Star Rating & Total Reviews Badges */}
          <div className="flex items-center gap-6 sm:border-l sm:border-neutral-200 sm:pl-6 shrink-0">
            <div className="text-center">
              <p className="font-bold text-neutral-900 text-base leading-none">
                {formatRating(rating)}
              </p>
              <div className="flex items-center justify-center gap-0.5 mt-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-2.5 h-2.5 fill-neutral-900 text-neutral-900"
                  />
                ))}
              </div>
            </div>

            <div className="text-center">
              <p className="font-bold text-neutral-900 text-base leading-none">
                {reviewCount}
              </p>
              <p className="text-[11px] text-neutral-500 font-medium underline mt-1">
                Reviews
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
