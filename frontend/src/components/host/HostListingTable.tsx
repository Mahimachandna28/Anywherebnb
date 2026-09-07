"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  Plus,
  ExternalLink,
  Edit3,
  Trash2,
  MapPin,
  Star,
  Users,
  Bed,
  Home,
} from "lucide-react";
import { Listing } from "@/types";
import { formatCurrency, formatRating } from "@/lib/formatters";

interface HostListingTableProps {
  listings: Listing[];
  onOpenDeleteModal: (listing: Listing) => void;
}

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80";

export function HostListingTable({
  listings,
  onOpenDeleteModal,
}: HostListingTableProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredListings = useMemo(() => {
    if (!searchQuery.trim()) return listings;
    const q = searchQuery.toLowerCase().trim();
    return listings.filter(
      (l) =>
        l.title.toLowerCase().includes(q) ||
        l.city.toLowerCase().includes(q) ||
        l.country.toLowerCase().includes(q) ||
        l.category.toLowerCase().includes(q)
    );
  }, [listings, searchQuery]);

  if (listings.length === 0) {
    return (
      <div className="bg-white border border-neutral-200 rounded-3xl p-12 text-center max-w-lg mx-auto my-8 space-y-4">
        <div className="w-16 h-16 rounded-full bg-neutral-100 text-neutral-600 flex items-center justify-center mx-auto">
          <Home className="w-8 h-8 stroke-[1.5]" />
        </div>
        <h3 className="text-xl font-bold text-neutral-900">
          No listings published yet
        </h3>
        <p className="text-sm text-neutral-500 leading-relaxed">
          Ready to become an Anywherebnb host? Share your home, apartment, or unique space with guests from all over the world.
        </p>
        <div className="pt-2">
          <Link
            href="/host/create"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#E61E4D] via-[#E31C5F] to-[#D70466] hover:opacity-95 text-white font-semibold text-sm px-6 py-3 rounded-xl shadow-md transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Create your first listing</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search Bar & Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, city, or category..."
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-neutral-200 focus:outline-none focus:border-neutral-900 transition bg-white text-neutral-900"
          />
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3">
          <span className="text-xs text-neutral-500 font-medium">
            Showing {filteredListings.length} of {listings.length} listings
          </span>
          <Link
            href="/host/create"
            className="inline-flex items-center gap-2 bg-airbnb-dark hover:bg-black text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition"
          >
            <Plus className="w-4 h-4" />
            <span>Create listing</span>
          </Link>
        </div>
      </div>

      {/* Empty Search Result */}
      {filteredListings.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-neutral-300 rounded-2xl bg-neutral-50">
          <p className="text-sm font-semibold text-neutral-800">
            No properties matched &ldquo;{searchQuery}&rdquo;
          </p>
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="mt-2 text-xs font-semibold text-airbnb-rose hover:underline"
          >
            Clear search filter
          </button>
        </div>
      ) : (
        /* Responsive Listing Cards / Table */
        <div className="bg-white border border-neutral-200 rounded-3xl overflow-hidden divide-y divide-neutral-200 shadow-sm">
          {filteredListings.map((listing) => {
            const coverImage =
              listing.images && listing.images.length > 0
                ? listing.images[0].image_url
                : FALLBACK_IMAGE;

            return (
              <div
                key={listing.id}
                className="p-5 sm:p-6 hover:bg-neutral-50/70 transition-colors flex flex-col md:flex-row gap-5 items-start md:items-center justify-between"
              >
                {/* Left: Thumbnail & Details */}
                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                  <div className="relative w-full sm:w-36 aspect-[4/3] rounded-2xl overflow-hidden shrink-0 bg-neutral-100">
                    <Image
                      src={coverImage}
                      alt={listing.title}
                      fill
                      sizes="144px"
                      className="object-cover"
                    />
                  </div>

                  <div className="flex flex-col justify-between py-0.5 space-y-1.5">
                    <div>
                      {/* Badges */}
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700">
                          {listing.category}
                        </span>
                        <span className="text-xs text-neutral-400">·</span>
                        <span className="text-xs text-neutral-600 font-medium">
                          {listing.property_type} ({listing.room_type})
                        </span>
                      </div>

                      {/* Title */}
                      <Link
                        href={`/listings/${listing.id}`}
                        className="text-base font-bold text-neutral-900 hover:underline line-clamp-1"
                      >
                        {listing.title}
                      </Link>

                      {/* Location */}
                      <p className="text-xs sm:text-sm text-neutral-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 shrink-0 text-neutral-400" />
                        <span>
                          {listing.city}, {listing.state ? `${listing.state}, ` : ""}
                          {listing.country}
                        </span>
                      </p>
                    </div>

                    {/* Meta specs */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500 pt-1">
                      <div className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        <span>Up to {listing.max_guests} guests</span>
                      </div>
                      <span>·</span>
                      <div className="flex items-center gap-1">
                        <Bed className="w-3.5 h-3.5" />
                        <span>
                          {listing.bedrooms} bed{listing.bedrooms > 1 ? "s" : ""}
                        </span>
                      </div>
                      <span>·</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-current text-amber-500" />
                        <span className="font-semibold text-neutral-800">
                          {formatRating(listing.rating)}
                        </span>
                        <span>({listing.review_count})</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Pricing & Actions */}
                <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-neutral-100 gap-4">
                  {/* Price */}
                  <div className="text-left md:text-right">
                    <span className="text-lg font-bold text-neutral-900">
                      {formatCurrency(listing.price_per_night)}
                    </span>
                    <span className="text-xs text-neutral-500 font-normal"> / night</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    {/* View Live */}
                    <Link
                      href={`/listings/${listing.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl border border-neutral-200 hover:bg-neutral-100 text-neutral-700 transition"
                      title="View live listing"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>

                    {/* Edit */}
                    <Link
                      href={`/host/listings/${listing.id}/edit`}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-neutral-200 hover:bg-neutral-100 text-neutral-700 text-xs font-semibold transition"
                      title="Edit property details"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Edit</span>
                    </Link>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => onOpenDeleteModal(listing)}
                      className="p-2 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-600 transition"
                      title="Delete listing"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
