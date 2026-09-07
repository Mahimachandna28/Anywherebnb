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
      className="flex items-center border border-neutral-200/90 rounded-full py-2 pl-6 pr-2 shadow-sm hover:shadow-md transition duration-200 cursor-pointer bg-white text-left"
      type="button"
    >
      <div className="flex flex-col pr-4 min-w-[120px]">
        <span className="text-xs font-bold text-neutral-900 leading-tight">Where</span>
        <span className="text-xs text-neutral-500 truncate">{destination || "Search destinations"}</span>
      </div>

      <div className="hidden sm:block border-l border-neutral-200 h-7" />

      <div className="hidden sm:flex flex-col px-4 min-w-[100px]">
        <span className="text-xs font-bold text-neutral-900 leading-tight">When</span>
        <span className="text-xs text-neutral-500 truncate">{dateRange || "Add dates"}</span>
      </div>

      <div className="hidden md:block border-l border-neutral-200 h-7" />

      <div className="hidden md:flex flex-col px-4 min-w-[100px]">
        <span className="text-xs font-bold text-neutral-900 leading-tight">Who</span>
        <span className="text-xs text-neutral-500 truncate">
          {guests ? `${guests} guest${guests > 1 ? "s" : ""}` : "Add guests"}
        </span>
      </div>

      <div className="w-9 h-9 bg-[#FF385C] rounded-full text-white flex items-center justify-center shrink-0 ml-1 shadow-sm hover:bg-[#E00B41] transition">
        <Search className="w-4 h-4 stroke-[2.5]" />
      </div>
    </button>
  );
}
