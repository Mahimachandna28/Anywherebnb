"use client";

import { useRef, useState, useEffect } from "react";
import {
  Home,
  Waves,
  Trees,
  Sparkles,
  Castle,
  Anchor,
  Warehouse,
  Sun,
  Snowflake,
  Palmtree,
  Flame,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
} from "lucide-react";
import { useFilters } from "@/context/FilterContext";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Home,
  Waves,
  Trees,
  Sparkles,
  Castle,
  Anchor,
  Warehouse,
  Sun,
  Snowflake,
  Palmtree,
  Flame,
};

export function CategoryBar() {
  const { categories, activeCategory, setActiveCategory, setIsFilterModalOpen, filters } =
    useFilters();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollability = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScrollability();
    window.addEventListener("resize", checkScrollability);
    return () => window.removeEventListener("resize", checkScrollability);
  }, [categories]);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === "left" ? -350 : 350;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
      setTimeout(checkScrollability, 350);
    }
  };

  // Count active filters (excluding category)
  const activeFilterCount = [
    filters.minPrice !== undefined,
    filters.maxPrice !== undefined,
    filters.propertyType && filters.propertyType !== "any",
    filters.bedrooms !== undefined,
    (filters.amenities?.length || 0) > 0,
  ].filter(Boolean).length;

  return (
    <div className="sticky top-20 z-30 w-full bg-white border-b border-airbnb-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 py-3">
        {/* Left Scroll Button */}
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className="p-2 rounded-full border border-airbnb-border bg-white shadow-sm hover:scale-105 hover:shadow-md transition duration-150 z-10 flex-shrink-0"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-4 w-4 text-airbnb-dark" />
          </button>
        )}

        {/* Horizontal Category Carousel */}
        <div
          ref={scrollContainerRef}
          onScroll={checkScrollability}
          className="flex items-center gap-7 overflow-x-auto no-scrollbar scroll-smooth flex-1 py-1"
        >
          {categories.map((cat) => {
            const Icon = ICON_MAP[cat.icon] || Home;
            const isActive = activeCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex flex-col items-center gap-1.5 pb-2 cursor-pointer transition duration-150 border-b-2 flex-shrink-0 group ${
                  isActive
                    ? "border-airbnb-dark text-airbnb-dark font-semibold opacity-100"
                    : "border-transparent text-airbnb-gray hover:text-airbnb-dark hover:border-airbnb-border opacity-70 hover:opacity-100 font-medium"
                }`}
              >
                <Icon className={`h-6 w-6 transition-transform group-hover:scale-105 ${isActive ? "stroke-[2.2]" : "stroke-[1.8]"}`} />
                <span className="text-xs whitespace-nowrap">{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Scroll Button */}
        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            className="p-2 rounded-full border border-airbnb-border bg-white shadow-sm hover:scale-105 hover:shadow-md transition duration-150 z-10 flex-shrink-0"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-4 w-4 text-airbnb-dark" />
          </button>
        )}

        {/* Filters Button */}
        <div className="flex-shrink-0 pl-2">
          <button
            onClick={() => setIsFilterModalOpen(true)}
            className="flex items-center gap-2.5 px-4 py-2.5 border border-airbnb-border rounded-xl text-xs font-semibold text-airbnb-dark hover:border-airbnb-dark transition shadow-sm"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="bg-airbnb-dark text-white rounded-full h-5 w-5 flex items-center justify-center text-[10px]">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
