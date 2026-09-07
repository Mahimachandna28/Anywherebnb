"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { Grid, ChevronLeft, ChevronRight } from "lucide-react";
import { ListingImage } from "@/types";

interface PhotoCollageProps {
  images: ListingImage[];
  title: string;
  onOpenModal: (initialIndex?: number) => void;
}

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80",
];

export function PhotoCollage({
  images,
  title,
  onOpenModal,
}: PhotoCollageProps) {
  const [mobileIndex, setMobileIndex] = useState(0);

  // Normalize images to ensure at least 5 photos for the collage
  const sortedImages = useMemo(() => {
    let urls: string[] = [];
    if (images && images.length > 0) {
      urls = [...images]
        .sort((a, b) => a.display_order - b.display_order)
        .map((img) => img.image_url);
    }

    // Fill in fallbacks if fewer than 5 images
    while (urls.length < 5) {
      urls.push(FALLBACK_IMAGES[urls.length % FALLBACK_IMAGES.length]);
    }
    return urls;
  }, [images]);

  const totalCount = Math.max(images?.length || 0, 5);

  return (
    <div className="relative w-full">
      {/* 1. Desktop 5-Photo Collage Grid (md and up) */}
      <div className="hidden md:grid md:grid-cols-4 md:grid-rows-2 gap-2 h-[420px] lg:h-[480px] rounded-2xl overflow-hidden relative">
        {/* Large Hero Photo (Left half: 2 cols, 2 rows) */}
        <div
          onClick={() => onOpenModal(0)}
          className="col-span-2 row-span-2 relative h-full w-full cursor-pointer overflow-hidden group"
        >
          <Image
            src={sortedImages[0]}
            alt={`${title} - Photo 1`}
            fill
            priority
            sizes="(max-width: 1024px) 50vw, 60vw"
            className="object-cover group-hover:brightness-95 group-hover:scale-[1.01] transition-all duration-300"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
        </div>

        {/* Top-Right 2 Photos */}
        <div
          onClick={() => onOpenModal(1)}
          className="col-span-1 row-span-1 relative h-full w-full cursor-pointer overflow-hidden group"
        >
          <Image
            src={sortedImages[1]}
            alt={`${title} - Photo 2`}
            fill
            sizes="25vw"
            className="object-cover group-hover:brightness-95 group-hover:scale-[1.01] transition-all duration-300"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
        </div>

        <div
          onClick={() => onOpenModal(2)}
          className="col-span-1 row-span-1 relative h-full w-full cursor-pointer overflow-hidden group"
        >
          <Image
            src={sortedImages[2]}
            alt={`${title} - Photo 3`}
            fill
            sizes="25vw"
            className="object-cover group-hover:brightness-95 group-hover:scale-[1.01] transition-all duration-300"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
        </div>

        {/* Bottom-Right 2 Photos */}
        <div
          onClick={() => onOpenModal(3)}
          className="col-span-1 row-span-1 relative h-full w-full cursor-pointer overflow-hidden group"
        >
          <Image
            src={sortedImages[3]}
            alt={`${title} - Photo 4`}
            fill
            sizes="25vw"
            className="object-cover group-hover:brightness-95 group-hover:scale-[1.01] transition-all duration-300"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
        </div>

        <div
          onClick={() => onOpenModal(4)}
          className="col-span-1 row-span-1 relative h-full w-full cursor-pointer overflow-hidden group"
        >
          <Image
            src={sortedImages[4]}
            alt={`${title} - Photo 5`}
            fill
            sizes="25vw"
            className="object-cover group-hover:brightness-95 group-hover:scale-[1.01] transition-all duration-300"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
        </div>

        {/* "Show all photos" floating pill button */}
        <button
          type="button"
          onClick={() => onOpenModal(0)}
          className="absolute bottom-5 right-5 z-10 flex items-center gap-2 bg-white/95 hover:bg-white text-neutral-900 px-4 py-2 rounded-lg text-sm font-semibold shadow-md border border-neutral-300 transition-all hover:scale-105 active:scale-95"
        >
          <Grid className="w-4 h-4" />
          <span>Show all {totalCount} photos</span>
        </button>
      </div>

      {/* 2. Mobile Full-Bleed Carousel (below md) */}
      <div className="md:hidden relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-neutral-100">
        <Image
          src={sortedImages[mobileIndex]}
          alt={`${title} - Photo ${mobileIndex + 1}`}
          fill
          priority
          sizes="100vw"
          className="object-cover"
          onClick={() => onOpenModal(mobileIndex)}
        />

        {/* Chevrons */}
        {mobileIndex > 0 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setMobileIndex((prev) => prev - 1);
            }}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 shadow flex items-center justify-center text-neutral-800"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}

        {mobileIndex < sortedImages.length - 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setMobileIndex((prev) => prev + 1);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 shadow flex items-center justify-center text-neutral-800"
            aria-label="Next image"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        {/* Counter Pill */}
        <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs font-medium px-3 py-1 rounded-md">
          {mobileIndex + 1} / {sortedImages.length}
        </div>
      </div>
    </div>
  );
}
