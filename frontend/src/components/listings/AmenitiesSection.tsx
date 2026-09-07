"use client";

import React, { useState } from "react";
import { Amenity } from "@/types";
import { AmenitiesModal, getAmenityIcon } from "./AmenitiesModal";

interface AmenitiesSectionProps {
  amenities: Amenity[];
}

export function AmenitiesSection({ amenities }: AmenitiesSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Take top 8-10 amenities for the inline preview
  const previewAmenities = amenities.slice(0, 10);

  return (
    <div className="py-6 border-b border-neutral-200">
      <h3 className="text-xl font-semibold text-neutral-900 mb-6">
        What this place offers
      </h3>

      {/* 2-Column Grid Preview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 mb-6">
        {previewAmenities.map((amenity) => {
          const Icon = getAmenityIcon(amenity.icon);
          return (
            <div key={amenity.id} className="flex items-center gap-4 text-neutral-800">
              <Icon className="w-6 h-6 text-neutral-700 shrink-0" />
              <span className="text-sm sm:text-base text-neutral-800 font-normal">
                {amenity.name}
              </span>
            </div>
          );
        })}
      </div>

      {/* "Show all amenities" button */}
      {amenities.length > 0 && (
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="border border-neutral-900 hover:bg-neutral-100 text-neutral-900 font-semibold text-sm sm:text-base px-6 py-3 rounded-xl transition-colors active:scale-95"
        >
          Show all {amenities.length} amenities
        </button>
      )}

      {/* Full Modal */}
      <AmenitiesModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        amenities={amenities}
      />
    </div>
  );
}
