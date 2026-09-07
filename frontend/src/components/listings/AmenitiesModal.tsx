"use client";

import React, { useEffect, useMemo } from "react";
import {
  X,
  Wifi,
  Utensils,
  Briefcase,
  Shirt,
  Wind,
  Flame,
  Tv,
  Waves,
  Sparkles,
  Car,
  Sun,
  Anchor,
  Snowflake,
  ShieldCheck,
  Check,
  Coffee,
} from "lucide-react";
import { Amenity } from "@/types";

interface AmenitiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  amenities: Amenity[];
}

export const AMENITY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Wifi,
  Utensils,
  Briefcase,
  Shirt,
  Wind,
  Flame,
  Tv,
  Waves,
  Sparkles,
  Car,
  Sun,
  Anchor,
  Snowflake,
  ShieldCheck,
  Coffee,
};

export function getAmenityIcon(iconName?: string) {
  if (!iconName) return Check;
  return AMENITY_ICONS[iconName] || Check;
}

export function AmenitiesModal({ isOpen, onClose, amenities }: AmenitiesModalProps) {
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

  // Group amenities by category
  const groupedAmenities = useMemo(() => {
    const groups: Record<string, Amenity[]> = {};
    amenities.forEach((amenity) => {
      const cat = amenity.category || "General";
      if (!groups[cat]) {
        groups[cat] = [];
      }
      groups[cat].push(amenity);
    });
    return groups;
  }, [amenities]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="p-2 -ml-2 rounded-full hover:bg-neutral-100 transition-colors"
            aria-label="Close amenities modal"
          >
            <X className="w-5 h-5 text-neutral-800" />
          </button>
          <h2 className="text-base font-bold text-neutral-900">What this place offers</h2>
          <div className="w-8" />
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 overflow-y-auto divide-y divide-neutral-200 space-y-8">
          {Object.entries(groupedAmenities).map(([category, items]) => (
            <div key={category} className="pt-6 first:pt-0">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                {category}
              </h3>
              <div className="space-y-4">
                {items.map((amenity) => {
                  const Icon = getAmenityIcon(amenity.icon);
                  return (
                    <div
                      key={amenity.id}
                      className="flex items-center gap-4 py-2 text-neutral-800"
                    >
                      <Icon className="w-6 h-6 text-neutral-700 shrink-0" />
                      <span className="text-base text-neutral-800">{amenity.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
