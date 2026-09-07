"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { SearchFilterState, Category } from "@/types";
import { fetchApi } from "@/lib/api";

interface FilterContextType {
  filters: SearchFilterState;
  categories: Category[];
  activeCategory: string;
  isFilterModalOpen: boolean;
  setFilters: React.Dispatch<React.SetStateAction<SearchFilterState>>;
  setActiveCategory: (category: string) => void;
  setIsFilterModalOpen: (open: boolean) => void;
  resetFilters: () => void;
  updateFilter: <K extends keyof SearchFilterState>(key: K, value: SearchFilterState[K]) => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export function FilterProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [isFilterModalOpen, setIsFilterModalOpen] = useState<boolean>(false);
  const [filters, setFilters] = useState<SearchFilterState>({
    category: "all",
    minPrice: undefined,
    maxPrice: undefined,
    propertyType: "any",
    bedrooms: undefined,
    amenities: [],
  });

  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await fetchApi<Category[]>("/categories");
        setCategories(data);
      } catch (err) {
        console.error("Failed to load categories:", err);
        // Fallback default categories
        setCategories([
          { id: "all", label: "All Homes", icon: "Home" },
          { id: "Beachfront", label: "Beachfront", icon: "Waves" },
          { id: "Cabins", label: "Cabins", icon: "Trees" },
          { id: "Amazing pools", label: "Amazing pools", icon: "Sparkles" },
          { id: "Mansions", label: "Mansions", icon: "Castle" },
          { id: "Lakefront", label: "Lakefront", icon: "Anchor" },
          { id: "Tiny homes", label: "Tiny homes", icon: "Warehouse" },
          { id: "Countryside", label: "Countryside", icon: "Sun" },
          { id: "Skiing", label: "Skiing", icon: "Snowflake" },
          { id: "Tropical", label: "Tropical", icon: "Palmtree" },
          { id: "Trending", label: "Trending", icon: "Flame" },
        ]);
      }
    }
    loadCategories();
  }, []);

  const handleCategorySelect = (catId: string) => {
    setActiveCategory(catId);
    setFilters((prev) => ({
      ...prev,
      category: catId === "all" ? undefined : catId,
    }));
  };

  const updateFilter = <K extends keyof SearchFilterState>(
    key: K,
    value: SearchFilterState[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setActiveCategory("all");
    setFilters({
      category: "all",
      minPrice: undefined,
      maxPrice: undefined,
      propertyType: "any",
      bedrooms: undefined,
      amenities: [],
      destination: undefined,
      checkIn: undefined,
      checkOut: undefined,
      guests: undefined,
    });
  };

  return (
    <FilterContext.Provider
      value={{
        filters,
        categories,
        activeCategory,
        isFilterModalOpen,
        setFilters,
        setActiveCategory: handleCategorySelect,
        setIsFilterModalOpen,
        resetFilters,
        updateFilter,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
}

export function useFilters() {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error("useFilters must be used within a FilterProvider");
  }
  return context;
}
