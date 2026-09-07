"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, Share2, Heart, Check } from "lucide-react";
import { ListingImage } from "@/types";
import { useWishlist } from "@/context/WishlistContext";
import { cn } from "@/lib/utils";

interface PhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: ListingImage[];
  title: string;
  initialIndex?: number;
  listingId: number;
}

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80",
];

export function PhotoModal({
  isOpen,
  onClose,
  images,
  title,
  initialIndex = 0,
  listingId,
}: PhotoModalProps) {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [copied, setCopied] = useState(false);

  const isSaved = isWishlisted(listingId);

  // Normalize images
  const photoList = React.useMemo(() => {
    if (images && images.length > 0) {
      return [...images].sort((a, b) => a.display_order - b.display_order);
    }
    return FALLBACK_IMAGES.map((url, idx) => ({
      id: idx + 1,
      listing_id: listingId,
      image_url: url,
      caption: `View ${idx + 1}`,
      display_order: idx,
      is_cover: idx === 0,
    }));
  }, [images, listingId]);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex, isOpen]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : photoList.length - 1));
  }, [photoList.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < photoList.length - 1 ? prev + 1 : 0));
  }, [photoList.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, handlePrev, handleNext]);

  const handleShare = async () => {
    try {
      if (navigator?.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      // Fallback
    }
  };

  if (!isOpen) return null;

  const currentPhoto = photoList[currentIndex];

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col animate-in fade-in duration-200">
      {/* 1. Modal Top Bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 shrink-0">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="flex items-center gap-2 p-2 -ml-2 rounded-full hover:bg-neutral-100 transition-colors text-neutral-800 font-medium text-sm"
          aria-label="Close photo gallery"
        >
          <X className="w-5 h-5" />
          <span className="hidden sm:inline">Close</span>
        </button>

        {/* Counter */}
        <div className="text-sm font-semibold text-neutral-900">
          {currentIndex + 1} / {photoList.length}
        </div>

        {/* Actions (Share & Save) */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleShare}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-neutral-100 text-sm font-medium text-neutral-800 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-600 font-semibold text-xs">Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline text-xs underline font-semibold">Share</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => toggleWishlist(listingId)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-neutral-100 text-sm font-medium text-neutral-800 transition-colors"
          >
            <Heart
              className={cn(
                "w-4 h-4 transition-colors",
                isSaved ? "fill-[#FF385C] stroke-[#FF385C]" : "stroke-neutral-800"
              )}
            />
            <span className="hidden sm:inline text-xs underline font-semibold">
              {isSaved ? "Saved" : "Save"}
            </span>
          </button>
        </div>
      </div>

      {/* 2. Main Lightbox Image Stage */}
      <div className="flex-1 relative flex items-center justify-center bg-neutral-950 p-4 md:p-8 select-none">
        {/* Previous Button */}
        <button
          type="button"
          onClick={handlePrev}
          className="absolute left-4 md:left-8 z-10 w-11 h-11 rounded-full bg-white/90 hover:bg-white text-neutral-900 shadow-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 focus:outline-none"
          aria-label="Previous photo"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Active Full Resolution Image */}
        <div className="relative w-full h-full max-w-5xl max-h-[75vh] flex items-center justify-center">
          <Image
            src={currentPhoto.image_url}
            alt={currentPhoto.caption || `${title} - Photo ${currentIndex + 1}`}
            fill
            sizes="100vw"
            priority
            className="object-contain"
          />
        </div>

        {/* Next Button */}
        <button
          type="button"
          onClick={handleNext}
          className="absolute right-4 md:right-8 z-10 w-11 h-11 rounded-full bg-white/90 hover:bg-white text-neutral-900 shadow-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 focus:outline-none"
          aria-label="Next photo"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* 3. Bottom Filmstrip Ribbon & Caption */}
      <div className="bg-white border-t border-neutral-200 px-6 py-3 shrink-0 flex flex-col gap-2">
        {currentPhoto.caption && (
          <p className="text-xs text-neutral-600 text-center font-medium">
            {currentPhoto.caption}
          </p>
        )}

        {/* Thumbnails row */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto py-1 no-scrollbar">
          {photoList.map((photo, idx) => (
            <button
              key={photo.id || idx}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              className={cn(
                "relative w-14 h-10 rounded-md overflow-hidden shrink-0 transition-all border-2",
                idx === currentIndex
                  ? "border-[#FF385C] scale-105 shadow-md opacity-100"
                  : "border-transparent opacity-60 hover:opacity-100"
              )}
            >
              <Image
                src={photo.image_url}
                alt={`Thumbnail ${idx + 1}`}
                fill
                sizes="56px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
