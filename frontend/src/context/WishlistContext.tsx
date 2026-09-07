"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { fetchApi } from "@/lib/api";
import { useUser } from "./UserContext";
import { useToast } from "./ToastContext";

interface WishlistContextType {
  wishlistIds: Set<number>;
  isLoading: boolean;
  isWishlisted: (listingId: number) => boolean;
  toggleWishlist: (listingId: number) => Promise<boolean>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

function getAccountKey(user: { id?: number; email?: string; phone?: string } | null): string {
  if (!user) return "anonymous";
  if (user.phone && user.phone.trim()) return user.phone.trim();
  if (user.email && user.email.trim()) return user.email.trim().toLowerCase();
  if (user.id) return `user_${user.id}`;
  return "anonymous";
}

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { currentUser } = useUser();
  const toast = useToast();
  const [wishlistIds, setWishlistIds] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch wishlisted listing IDs when current user changes
  const loadWishlistIds = useCallback(async () => {
    if (!currentUser) {
      setWishlistIds(new Set());
      setIsLoading(false);
      return;
    }

    const key = `anywherebnb_wishlist_${getAccountKey(currentUser)}`;

    // 1. Instant local cache lookup for fast UI rendering
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem(key);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed)) {
            setWishlistIds(new Set(parsed));
          }
        } else {
          setWishlistIds(new Set());
        }
      } catch (err) {
        console.warn("Failed to read local wishlist cache:", err);
      }
    }

    // 2. Fetch from backend with user headers for persistent sync
    try {
      setIsLoading(true);
      const headers: Record<string, string> = {};
      if (currentUser.email) headers["X-User-Email"] = currentUser.email;
      if (currentUser.id) headers["X-User-Id"] = String(currentUser.id);

      const ids = await fetchApi<number[]>("/wishlists/ids", { headers });
      const idSet = new Set(ids);
      setWishlistIds(idSet);

      if (typeof window !== "undefined") {
        localStorage.setItem(key, JSON.stringify(Array.from(idSet)));
      }
    } catch (error) {
      console.warn("Failed to load wishlist IDs from server:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    loadWishlistIds();
  }, [loadWishlistIds]);

  const isWishlisted = useCallback(
    (listingId: number) => {
      return wishlistIds.has(listingId);
    },
    [wishlistIds]
  );

  const toggleWishlist = useCallback(
    async (listingId: number): Promise<boolean> => {
      if (!currentUser) {
        toast.info("Please log in to save stays to your wishlist");
        return false;
      }

      const isCurrentlySaved = wishlistIds.has(listingId);
      const nextState = !isCurrentlySaved;
      const key = `anywherebnb_wishlist_${getAccountKey(currentUser)}`;

      // Optimistic update
      const updated = new Set(wishlistIds);
      if (nextState) {
        updated.add(listingId);
      } else {
        updated.delete(listingId);
      }
      setWishlistIds(updated);

      if (typeof window !== "undefined") {
        localStorage.setItem(key, JSON.stringify(Array.from(updated)));
      }

      try {
        const headers: Record<string, string> = {};
        if (currentUser.email) headers["X-User-Email"] = currentUser.email;
        if (currentUser.id) headers["X-User-Id"] = String(currentUser.id);

        const response = await fetchApi<{
          listing_id: number;
          is_favorited: boolean;
          message: string;
        }>("/wishlists/toggle", {
          method: "POST",
          headers,
          body: JSON.stringify({ listing_id: listingId }),
        });

        // Ensure state matches server response
        setWishlistIds((prev) => {
          const finalSet = new Set(prev);
          if (response.is_favorited) {
            finalSet.add(listingId);
          } else {
            finalSet.delete(listingId);
          }
          if (typeof window !== "undefined") {
            localStorage.setItem(key, JSON.stringify(Array.from(finalSet)));
          }
          return finalSet;
        });

        if (response.is_favorited) {
          toast.success("Saved to your wishlist");
        } else {
          toast.info("Removed from your wishlist");
        }

        return response.is_favorited;
      } catch (error) {
        console.error("Failed to toggle wishlist item:", error);
        toast.error("Failed to update wishlist. Please try again.");
        // Revert on failure
        setWishlistIds((prev) => {
          const reverted = new Set(prev);
          if (isCurrentlySaved) {
            reverted.add(listingId);
          } else {
            reverted.delete(listingId);
          }
          if (typeof window !== "undefined") {
            localStorage.setItem(key, JSON.stringify(Array.from(reverted)));
          }
          return reverted;
        });
        return isCurrentlySaved;
      }
    },
    [wishlistIds, currentUser, toast]
  );

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds,
        isLoading,
        isWishlisted,
        toggleWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
