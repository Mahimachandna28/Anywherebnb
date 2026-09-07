"use client";

import React from "react";
import { Logo } from "@/components/layout/Logo";
import { SearchPill } from "@/components/layout/SearchPill";
import { UserMenu } from "@/components/layout/UserMenu";
import { ExpandedSearchBar } from "@/components/search";
import { useFilters } from "@/context/FilterContext";
import { formatDateRange } from "@/lib/formatters";

export function Navbar() {
  const {
    filters,
    isSearchExpanded,
    setIsSearchExpanded,
    setActiveSearchTab,
  } = useFilters();

  const handleOpenSearch = () => {
    setIsSearchExpanded(true);
    setActiveSearchTab("where");
  };

  const formattedDates =
    filters.checkIn && filters.checkOut
      ? formatDateRange(filters.checkIn, filters.checkOut)
      : undefined;

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-airbnb-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* 1. Left: Brand Logo */}
          <div className="flex-shrink-0">
            <Logo />
          </div>

          {/* 2. Center: Compact Search Pill (rendered when expanded search bar is closed) */}
          <div className="flex-1 max-w-lg mx-auto flex justify-center">
            {!isSearchExpanded && (
              <SearchPill
                destination={filters.destination}
                dateRange={formattedDates}
                guests={filters.guests}
                onClick={handleOpenSearch}
              />
            )}
          </div>

          {/* 3. Right: Host Switcher & User Menu */}
          <div className="flex-shrink-0">
            <UserMenu />
          </div>
        </div>

        {/* 4. Expanded Search Bar Modal / Drawer */}
        <ExpandedSearchBar />
      </div>
    </header>
  );
}
