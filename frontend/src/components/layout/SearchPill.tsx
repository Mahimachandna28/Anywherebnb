"use client";

import { Search } from "lucide-react";

interface SearchPillProps {
  destination?: string;
  dateRange?: string;
  guests?: number;
  onClick?: () => void;
}

export function SearchPill({
  destination,
  dateRange,
  guests,
  onClick,
}: SearchPillProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center border border-airbnb-border rounded-full py-2 px-4 shadow-airbnb hover:shadow-airbnbHover transition duration-200 cursor-pointer text-sm"
      type="button"
    >
      <div className="font-semibold text-airbnb-dark px-3 truncate max-w-[120px]">
        {destination || "Anywhere"}
      </div>

      <div className="hidden sm:block border-l border-airbnb-border h-4" />

      <div className="hidden sm:block font-semibold text-airbnb-dark px-3 truncate max-w-[140px]">
        {dateRange || "Any week"}
      </div>

      <div className="hidden md:block border-l border-airbnb-border h-4" />

      <div className="hidden md:block text-airbnb-gray font-normal px-3 truncate max-w-[120px]">
        {guests ? `${guests} guest${guests > 1 ? "s" : ""}` : "Add guests"}
      </div>

      <div className="p-2 bg-airbnb-rose rounded-full text-white ml-2 flex items-center justify-center">
        <Search className="h-3.5 w-3.5 stroke-[2.5]" />
      </div>
    </button>
  );
}
