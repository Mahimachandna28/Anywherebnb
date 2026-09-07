"use client";

import React, { useState } from "react";
import { AlertTriangle, X, Trash2 } from "lucide-react";
import { Listing } from "@/types";
import { fetchApi } from "@/lib/api";

interface DeleteListingModalProps {
  listing: Listing | null;
  isOpen: boolean;
  onClose: () => void;
  onDeleted: (listingId: number) => void;
}

export function DeleteListingModal({
  listing,
  isOpen,
  onClose,
  onDeleted,
}: DeleteListingModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !listing) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      await fetchApi<void>(`/listings/${listing.id}`, {
        method: "DELETE",
      });
      onDeleted(listing.id);
      onClose();
    } catch (err: any) {
      console.error("Failed to delete listing:", err);
      setError(err.message || "Failed to delete listing. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
          <div className="flex items-center gap-2 text-rose-600">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="font-bold text-base text-neutral-900">
              Delete listing
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="p-1 rounded-full hover:bg-neutral-100 transition text-neutral-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error notice */}
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
            {error}
          </div>
        )}

        {/* Warning text */}
        <p className="text-sm text-neutral-600 leading-relaxed">
          Are you sure you want to permanently delete{" "}
          <span className="font-bold text-neutral-900">
            &ldquo;{listing.title}&rdquo;
          </span>
          ?
        </p>

        <div className="bg-neutral-50 p-3.5 rounded-2xl border border-neutral-200 text-xs text-neutral-600 space-y-1">
          <p className="font-semibold text-neutral-800">Consequences of deletion:</p>
          <p>• The listing will be immediately removed from Anywherebnb search feeds.</p>
          <p>• All photos and associated availability calendar slots will be cleared.</p>
          <p className="text-rose-600 font-medium">⚠️ This action cannot be undone.</p>
        </div>

        {/* Action buttons */}
        <div className="pt-2 flex items-center justify-end gap-3">
          <button
            type="button"
            disabled={isDeleting}
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-neutral-300 font-semibold text-sm text-neutral-800 hover:bg-neutral-100 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isDeleting}
            onClick={handleDelete}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm transition shadow flex items-center gap-2 disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>Delete listing</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
