"use client";

import React from "react";
import { BedDouble, Bed } from "lucide-react";

interface SleepingArrangementsProps {
  bedrooms: number;
  beds: number;
}

export function SleepingArrangements({ bedrooms, beds }: SleepingArrangementsProps) {
  // Generate bedroom cards dynamically based on listing bedroom and bed counts
  const bedroomCards = Array.from({ length: Math.max(1, bedrooms) }).map((_, idx) => {
    const isMaster = idx === 0;
    const bedType = isMaster ? "1 king bed" : "1 queen bed";
    return {
      title: `Bedroom ${idx + 1}`,
      description: bedType,
      Icon: isMaster ? BedDouble : Bed,
    };
  });

  return (
    <div className="py-6 border-b border-neutral-200">
      <h3 className="text-xl font-semibold text-neutral-900 mb-5">
        Where you'll sleep
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {bedroomCards.map((card, idx) => {
          const Icon = card.Icon;
          return (
            <div
              key={idx}
              className="border border-neutral-200 rounded-2xl p-5 flex flex-col gap-3 hover:border-neutral-400 transition-colors"
            >
              <Icon className="w-6 h-6 text-neutral-800" />
              <div>
                <p className="font-semibold text-neutral-900 text-sm">{card.title}</p>
                <p className="text-xs text-neutral-500 mt-0.5">{card.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
