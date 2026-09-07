"use client";

import React, { useState } from "react";
import { Logo } from "@/components/layout/Logo";
import { SearchPill } from "@/components/layout/SearchPill";
import { UserMenu } from "@/components/layout/UserMenu";
import { ExpandedSearchBar } from "@/components/search";
import { AuthModal } from "@/components/auth";
import { useFilters } from "@/context/FilterContext";
import { formatDateRange } from "@/lib/formatters";

export function Navbar() {
  const {
    filters,
    isSearchExpanded,
    setIsSearchExpanded,
    setActiveSearchTab,
    updateFilter,
  } = useFilters();

  const [activeTab, setActiveTab] = useState<"all" | "homes" | "experiences" | "services">("all");

  const handleOpenSearch = () => {
    setIsSearchExpanded(true);
    setActiveSearchTab("where");
  };

  const handleTabSelect = (tab: "all" | "homes" | "experiences" | "services") => {
    setActiveTab(tab);
    if (tab === "all") {
      updateFilter("category", "all");
    } else if (tab === "homes") {
      updateFilter("propertyType", "House");
    } else if (tab === "experiences") {
      updateFilter("category", "Trending");
    } else if (tab === "services") {
      updateFilter("category", "Mansions");
    }
  };

  const formattedDates =
    filters.checkIn && filters.checkOut
      ? formatDateRange(filters.checkIn, filters.checkOut)
      : undefined;

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Top Row: Logo | Center Top Tabs | Right Controls */}
        <div className="flex items-center justify-between h-20 gap-4">
          {/* 1. Left: Brand Logo */}
          <div className="flex-shrink-0">
            <Logo />
          </div>

          {/* 2. Center: Top Product Tabs matching reference screenshot */}
          <nav className="hidden md:flex items-center gap-7 pt-1" aria-label="Product categories">
            <button
              type="button"
              onClick={() => handleTabSelect("all")}
              className={`flex items-center gap-2.5 pb-2 transition text-sm font-medium relative ${
                activeTab === "all"
                  ? "text-neutral-900 border-b-2 border-neutral-900 font-semibold"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              <span className="text-xl leading-none">🌐</span>
              <span>All</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabSelect("homes")}
              className={`flex items-center gap-2.5 pb-2 transition text-sm font-medium relative ${
                activeTab === "homes"
                  ? "text-neutral-900 border-b-2 border-neutral-900 font-semibold"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              <span className="text-xl leading-none">🏡</span>
              <span>Homes</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabSelect("experiences")}
              className={`flex items-center gap-2.5 pb-2 transition text-sm font-medium relative ${
                activeTab === "experiences"
                  ? "text-neutral-900 border-b-2 border-neutral-900 font-semibold"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              <span className="text-xl leading-none">🎈</span>
              <span>Experiences</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabSelect("services")}
              className={`flex items-center gap-2.5 pb-2 transition text-sm font-medium relative ${
                activeTab === "services"
                  ? "text-neutral-900 border-b-2 border-neutral-900 font-semibold"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              <span className="text-xl leading-none">🛎️</span>
              <span>Services</span>
            </button>
          </nav>

          {/* 3. Right: User Menu */}
          <div className="flex-shrink-0">
            <UserMenu />
          </div>
        </div>

        {/* Search Bar Row */}
        <div className="pb-4 flex justify-center">
          {!isSearchExpanded && (
            <SearchPill
              destination={filters.destination}
              dateRange={formattedDates}
              guests={filters.guests}
              onClick={handleOpenSearch}
            />
          )}
        </div>

        {/* 4. Expanded Search Bar Modal / Drawer */}
        <ExpandedSearchBar />
      </div>

      {/* 5. Sign In / Log In Authentication Modal */}
      <AuthModal />
    </header>
  );
}
