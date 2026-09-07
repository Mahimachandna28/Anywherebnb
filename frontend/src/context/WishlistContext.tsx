"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { fetchApi } from "@/lib/api";
import { useUser } from "./UserContext";

interface WishlistContextType {
  wishlistIds: Set<number>;
  isLoading: boolean;
  isWishlisted: (listingId: number) => boolean;
  toggleWishlist: (listingId: number) => Promise<boolean>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { currentUser } = useUser();
  const [wishlistIds, setWishlistIds] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch wishlisted listing IDs when current user changes
  const loadWishlistIds = useCallback(async () => {
    if (!currentUser) {
      setWishlistIds(new Set());
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const ids = await fetchApi<number[]>("/wishlists/ids");
      setWishlistIds(new Set(ids));
    } catch (error) {
      console.warn("Failed to load wishlist IDs:", error);
      // Keep existing or empty state gracefully
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
      const isCurrentlySaved = wishlistIds.has(listingId);
      const nextState = !isCurrentlySaved;

      // Optimistic update
      setWishlistIds((prev) => {
        const next = new Set(prev);
        if (nextState) {
          next.add(listingId);
        } else {
          next.delete(listingId);
        }
        return next;
      });

      try {
        const response = await fetchApi<{
          listing_id: number;
          is_favorited: boolean;
          message: string;
        }>("/wishlists/toggle", {
          method: "POST",
          body: JSON.stringify({ listing_id: listingId }),
        });

        // Ensure state matches server response
        setWishlistIds((prev) => {
          const updated = new Set(prev);
          if (response.is_favorited) {
            updated.add(listingId);
          } else {
            updated.delete(listingId);
          }
          return updated;
        });

        return response.is_favorited;
      } catch (error) {
        console.error("Failed to toggle wishlist item:", error);
        // Revert optimistic update on failure
        setWishlistIds((prev) => {
          const reverted = new Set(prev);
          if (isCurrentlySaved) {
            reverted.add(listingId);
          } else {
            reverted.delete(listingId);
          }
          return reverted;
        });
        return isCurrentlySaved;
      }
    },
    [wishlistIds]
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
