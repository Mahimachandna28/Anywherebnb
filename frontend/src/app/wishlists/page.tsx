"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  Heart,
  Compass,
  Search,
  ArrowRight,
  RotateCcw,
  X,
  Share2,
  Check,
} from "lucide-react";
import { Listing } from "@/types";
import { fetchApi } from "@/lib/api";
import { useWishlist } from "@/context/WishlistContext";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/context/ToastContext";
import { ListingCard, ListingCardSkeleton } from "@/components/listings";

export default function WishlistsPage() {
  const { wishlistIds, isWishlisted, toggleWishlist } = useWishlist();
  const { currentUser, setIsAuthModalOpen } = useUser();
  const toast = useToast();

  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [recentlyRemoved, setRecentlyRemoved] = useState<Listing | null>(null);

  // Fetch wishlisted properties for current user account
  const loadWishlists = useCallback(async () => {
    if (!currentUser) {
      setListings([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const headers: Record<string, string> = {};
      if (currentUser.email) headers["X-User-Email"] = currentUser.email;
      if (currentUser.id) headers["X-User-Id"] = String(currentUser.id);

      const data = await fetchApi<Listing[]>("/wishlists", { headers });
      setListings(data);
    } catch (err: any) {
      console.error("Failed to load wishlist listings:", err);
      setError(err.message || "Failed to load wishlists. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    loadWishlists();
  }, [loadWishlists, currentUser]);

  // Derive active items based on global wishlist state
  const activeWishlistListings = useMemo(() => {
    return listings.filter((item) => isWishlisted(item.id));
  }, [listings, isWishlisted]);

  const handleUndoRemove = async () => {
    if (!recentlyRemoved) return;
    await toggleWishlist(recentlyRemoved.id);
    setRecentlyRemoved(null);
  };

  const handleShare = async () => {
    try {
      if (typeof window !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
        setCopiedLink(true);
        toast.success("Wishlist link copied to clipboard!");
        setTimeout(() => setCopiedLink(false), 3000);
      }
    } catch (err) {
      console.warn("Clipboard copy failed:", err);
    }
  };

  // Filter listings by search query (city, title, country, category)
  const filteredListings = useMemo(() => {
    if (!searchQuery.trim()) return activeWishlistListings;
    const q = searchQuery.toLowerCase().trim();
    return activeWishlistListings.filter(
      (l) =>
        l.title.toLowerCase().includes(q) ||
        l.city.toLowerCase().includes(q) ||
        l.country.toLowerCase().includes(q) ||
        l.category.toLowerCase().includes(q)
    );
  }, [activeWishlistListings, searchQuery]);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Undo Alert Banner */}
        {recentlyRemoved && (
          <div className="mb-6 p-4 bg-neutral-900 text-white rounded-2xl flex items-center justify-between shadow-lg animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-3 text-sm">
              <span className="text-neutral-300">
                Removed &ldquo;{recentlyRemoved.title}&rdquo; from wishlists.
              </span>
              <button
                type="button"
                onClick={handleUndoRemove}
                className="inline-flex items-center gap-1.5 font-bold text-white underline hover:text-rose-300 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Undo</span>
              </button>
            </div>
            <button
              type="button"
              onClick={() => setRecentlyRemoved(null)}
              className="p-1 hover:bg-neutral-800 rounded-full text-neutral-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-neutral-200 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-600 mb-1">
              <Heart className="w-4 h-4 fill-current" />
              <span>Saved Places</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">
              Wishlists
            </h1>
            <p className="text-sm text-neutral-500 mt-1">
              {!currentUser
                ? "Sign in to access your personal wishlist."
                : isLoading
                ? "Loading your saved collections..."
                : `${activeWishlistListings.length} ${
                    activeWishlistListings.length === 1 ? "stay" : "stays"
                  } saved for ${currentUser.name || currentUser.phone || currentUser.email}.`}
            </p>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-neutral-200 hover:bg-neutral-100 text-neutral-700 text-xs sm:text-sm font-semibold transition active:scale-95"
            >
              {copiedLink ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">Link copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  <span>Share wishlist</span>
                </>
              )}
            </button>

            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-neutral-900 hover:bg-black text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition active:scale-95 shadow-sm"
            >
              <span>Explore stays</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Search within wishlists (rendered when 2+ items exist) */}
        {!isLoading && activeWishlistListings.length > 1 && (
          <div className="mb-8 max-w-md">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search by city, title, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white transition"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Content States */}
        {!currentUser ? (
          /* Unauthenticated State */
          <div className="border border-neutral-200 rounded-3xl p-12 text-center max-w-lg mx-auto my-12 space-y-5 bg-white shadow-sm">
            <div className="w-20 h-20 rounded-full bg-rose-50 text-[#FF385C] flex items-center justify-center mx-auto shadow-inner">
              <Heart className="w-10 h-10 stroke-[1.5]" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-neutral-900">
                Log in to view your wishlists
              </h3>
              <p className="text-sm text-neutral-500 leading-relaxed max-w-sm mx-auto">
                Every phone number and email account has its own separate, private wishlist. Sign in with OTP to view your saved stays.
              </p>
            </div>
            <div className="pt-3">
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                className="inline-flex items-center gap-2 bg-[#E00B41] hover:bg-[#D70466] text-white font-semibold text-sm px-6 py-3 rounded-xl shadow-md transition active:scale-95 cursor-pointer"
              >
                Log in or sign up
              </button>
            </div>
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
            {Array.from({ length: 8 }).map((_, idx) => (
              <ListingCardSkeleton key={idx} />
            ))}
          </div>
        ) : error ? (
          /* Error State */
          <div className="border border-neutral-200 rounded-3xl p-12 text-center max-w-md mx-auto my-12 space-y-4 bg-neutral-50">
            <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Heart className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-neutral-900">
              Couldn&apos;t load wishlists
            </h3>
            <p className="text-sm text-neutral-500">{error}</p>
            <div className="pt-2">
              <button
                type="button"
                onClick={loadWishlists}
                className="px-5 py-2.5 bg-neutral-900 text-white rounded-xl text-sm font-semibold hover:bg-black transition"
              >
                Try again
              </button>
            </div>
          </div>
        ) : activeWishlistListings.length === 0 ? (
          /* Empty State */
          <div className="border border-neutral-200 rounded-3xl p-12 text-center max-w-lg mx-auto my-12 space-y-5 bg-white shadow-sm">
            <div className="w-20 h-20 rounded-full bg-rose-50 text-[#FF385C] flex items-center justify-center mx-auto shadow-inner">
              <Heart className="w-10 h-10 stroke-[1.5]" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-neutral-900">
                Your wishlist is empty
              </h3>
              <p className="text-sm text-neutral-500 leading-relaxed max-w-sm mx-auto">
                As you explore, click the heart icon on any home or vacation stay to save your favorite spots in one place.
              </p>
            </div>
            <div className="pt-3">
              <Link
                href="/"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#E61E4D] via-[#E31C5F] to-[#D70466] hover:opacity-95 text-white font-semibold text-sm px-6 py-3 rounded-xl shadow-md transition active:scale-95"
              >
                <Compass className="w-4 h-4" />
                <span>Start exploring stays</span>
              </Link>
            </div>
          </div>
        ) : filteredListings.length === 0 ? (
          /* Empty Search Filter State */
          <div className="border border-dashed border-neutral-300 rounded-2xl p-12 text-center bg-neutral-50 space-y-3">
            <p className="text-sm font-semibold text-neutral-800">
              No saved homes matched &ldquo;{searchQuery}&rdquo;
            </p>
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="text-xs font-semibold text-rose-600 hover:underline"
            >
              Clear search filter
            </button>
          </div>
        ) : (
          /* Responsive Listing Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
            {filteredListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
