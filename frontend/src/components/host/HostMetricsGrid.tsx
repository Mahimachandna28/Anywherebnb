"use client";

import React from "react";
import { IndianRupee, Home, CalendarCheck, Star } from "lucide-react";
import { HostMetrics } from "@/types";
import { formatCurrency, formatRating } from "@/lib/formatters";

interface HostMetricsGridProps {
  metrics: HostMetrics;
}

export function HostMetricsGrid({ metrics }: HostMetricsGridProps) {
  const cards = [
    {
      title: "Total Revenue",
      value: formatCurrency(metrics.total_revenue),
      subtext: "Gross confirmed earnings",
      icon: IndianRupee,
      iconColor: "text-emerald-600 bg-emerald-50 border-emerald-100",
    },
    {
      title: "Active Listings",
      value: `${metrics.active_listings_count} ${
        metrics.active_listings_count === 1 ? "property" : "properties"
      }`,
      subtext: "Published on Anywherebnb",
      icon: Home,
      iconColor: "text-blue-600 bg-blue-50 border-blue-100",
    },
    {
      title: "Confirmed Bookings",
      value: metrics.total_reservations_count,
      subtext: "Guest trips reserved",
      icon: CalendarCheck,
      iconColor: "text-airbnb-rose bg-rose-50 border-rose-100",
    },
    {
      title: "Average Rating",
      value: `${formatRating(metrics.average_rating)} ★`,
      subtext: "Across all guest reviews",
      icon: Star,
      iconColor: "text-amber-600 bg-amber-50 border-amber-100",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className="p-5 bg-white rounded-2xl border border-neutral-200 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                {card.title}
              </span>
              <div
                className={`w-9 h-9 rounded-xl border flex items-center justify-center ${card.iconColor}`}
              >
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-neutral-900">
              {card.value}
            </div>
            <p className="text-xs text-neutral-500 mt-1.5">{card.subtext}</p>
          </div>
        );
      })}
    </div>
  );
}
