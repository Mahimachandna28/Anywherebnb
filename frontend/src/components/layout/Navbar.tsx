"use client";

import { Logo } from "@/components/layout/Logo";
import { SearchPill } from "@/components/layout/SearchPill";
import { UserMenu } from "@/components/layout/UserMenu";

interface NavbarProps {
  onSearchClick?: () => void;
  destination?: string;
  dateRange?: string;
  guests?: number;
}

export function Navbar({
  onSearchClick,
  destination,
  dateRange,
  guests,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-airbnb-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* 1. Left: Brand Logo */}
          <div className="flex-shrink-0">
            <Logo />
          </div>

          {/* 2. Center: Compact Search Pill */}
          <div className="flex-1 max-w-lg mx-auto flex justify-center">
            <SearchPill
              destination={destination}
              dateRange={dateRange}
              guests={guests}
              onClick={onSearchClick}
            />
          </div>

          {/* 3. Right: Host Switcher & User Menu */}
          <div className="flex-shrink-0">
            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  );
}
