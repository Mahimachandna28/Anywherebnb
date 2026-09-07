"use client";

import { useEffect, useState } from "react";
import { X, Check } from "lucide-react";
import { useFilters } from "@/context/FilterContext";
import { Amenity } from "@/types";
import { fetchApi } from "@/lib/api";

const PROPERTY_TYPES = ["House", "Apartment", "Guesthouse", "Villa", "Cabin", "Loft"];

export function FilterModal() {
  const { isFilterModalOpen, setIsFilterModalOpen, filters, setFilters, resetFilters } =
    useFilters();

  const [availableAmenities, setAvailableAmenities] = useState<Amenity[]>([]);

  // Local draft state before user hits "Show places"
  const [minPrice, setMinPrice] = useState<number | "">(filters.minPrice ?? "");
  const [maxPrice, setMaxPrice] = useState<number | "">(filters.maxPrice ?? "");
  const [propertyType, setPropertyType] = useState<string>(filters.propertyType || "any");
  const [bedrooms, setBedrooms] = useState<number | "any">(filters.bedrooms ?? "any");
  const [selectedAmenities, setSelectedAmenities] = useState<number[]>(filters.amenities?.map(Number) || []);

  // Fetch amenities on mount
  useEffect(() => {
    async function loadAmenities() {
      try {
        const data = await fetchApi<Amenity[]>("/amenities");
        setAvailableAmenities(data);
      } catch (err) {
        console.error("Failed to load amenities:", err);
      }
    }
    loadAmenities();
  }, []);

  // Sync draft state when modal opens
  useEffect(() => {
    if (isFilterModalOpen) {
      setMinPrice(filters.minPrice ?? "");
      setMaxPrice(filters.maxPrice ?? "");
      setPropertyType(filters.propertyType || "any");
      setBedrooms(filters.bedrooms ?? "any");
      setSelectedAmenities(filters.amenities?.map(Number) || []);
    }
  }, [isFilterModalOpen, filters]);

  // Handle ESC key close
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setIsFilterModalOpen(false);
    }
    if (isFilterModalOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [isFilterModalOpen, setIsFilterModalOpen]);

  if (!isFilterModalOpen) return null;

  const toggleAmenity = (id: number) => {
    if (selectedAmenities.includes(id)) {
      setSelectedAmenities(selectedAmenities.filter((a) => a !== id));
    } else {
      setSelectedAmenities([...selectedAmenities, id]);
    }
  };

  const handleApply = () => {
    setFilters((prev) => ({
      ...prev,
      minPrice: minPrice !== "" ? Number(minPrice) : undefined,
      maxPrice: maxPrice !== "" ? Number(maxPrice) : undefined,
      propertyType: propertyType !== "any" ? propertyType : undefined,
      bedrooms: bedrooms !== "any" ? Number(bedrooms) : undefined,
      amenities: selectedAmenities.map(String),
    }));
    setIsFilterModalOpen(false);
  };

  const handleClear = () => {
    setMinPrice("");
    setMaxPrice("");
    setPropertyType("any");
    setBedrooms("any");
    setSelectedAmenities([]);
    resetFilters();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-airbnbModal w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-airbnb-border">
          <button
            onClick={() => setIsFilterModalOpen(false)}
            className="p-2 rounded-full hover:bg-airbnb-lightGray transition"
            aria-label="Close"
          >
            <X className="h-4 w-4 text-airbnb-dark" />
          </button>
          <h2 className="text-base font-bold text-airbnb-dark">Filters</h2>
          <div className="w-8" />
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8 divide-y divide-airbnb-border">
          {/* 1. Price Range */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-airbnb-dark">Price range</h3>
            <p className="text-sm text-airbnb-gray">Nightly prices before taxes and fees</p>

            {/* Price Histogram mockup */}
            <div className="h-16 flex items-end gap-1 px-4 pt-4 bg-airbnb-lightGray/50 rounded-xl">
              {[20, 35, 55, 75, 100, 80, 95, 60, 45, 70, 85, 90, 65, 40, 30, 25, 15, 10].map((h, i) => (
                <div
                  key={i}
                  style={{ height: `${h}%` }}
                  className="flex-1 bg-airbnb-border hover:bg-airbnb-rose transition rounded-t-sm"
                />
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="border border-airbnb-border rounded-xl p-3 focus-within:border-airbnb-dark focus-within:ring-1 focus-within:ring-airbnb-dark">
                <label className="text-[11px] font-bold text-airbnb-gray uppercase tracking-wider block">
                  Minimum
                </label>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-sm text-airbnb-gray">$</span>
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : "")}
                    placeholder="50"
                    className="w-full text-sm font-medium outline-none bg-transparent"
                  />
                </div>
              </div>

              <div className="border border-airbnb-border rounded-xl p-3 focus-within:border-airbnb-dark focus-within:ring-1 focus-within:ring-airbnb-dark">
                <label className="text-[11px] font-bold text-airbnb-gray uppercase tracking-wider block">
                  Maximum
                </label>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-sm text-airbnb-gray">$</span>
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : "")}
                    placeholder="1000+"
                    className="w-full text-sm font-medium outline-none bg-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 2. Type of Place */}
          <div className="pt-6 space-y-4">
            <h3 className="text-lg font-semibold text-airbnb-dark">Type of place</h3>
            <div className="grid grid-cols-3 gap-2 p-1.5 bg-airbnb-lightGray rounded-2xl">
              {[
                { id: "any", label: "Any type" },
                { id: "Entire place", label: "Entire place" },
                { id: "Room", label: "Room" },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setPropertyType(t.id)}
                  type="button"
                  className={`py-2.5 text-xs font-semibold rounded-xl transition ${
                    propertyType === t.id
                      ? "bg-white text-airbnb-dark shadow-sm"
                      : "text-airbnb-gray hover:text-airbnb-dark"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Bedrooms */}
          <div className="pt-6 space-y-4">
            <h3 className="text-lg font-semibold text-airbnb-dark">Bedrooms</h3>
            <div className="flex flex-wrap gap-2">
              {["any", 1, 2, 3, 4, 5, "6+"].map((num) => {
                const isSelected = bedrooms === (num === "6+" ? 6 : num);
                return (
                  <button
                    key={String(num)}
                    onClick={() => setBedrooms(num === "6+" ? 6 : (num as number | "any"))}
                    type="button"
                    className={`px-5 py-2.5 rounded-full text-xs font-semibold border transition ${
                      isSelected
                        ? "bg-airbnb-dark text-white border-airbnb-dark"
                        : "bg-white text-airbnb-dark border-airbnb-border hover:border-airbnb-dark"
                    }`}
                  >
                    {num === "any" ? "Any" : num}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Property Type */}
          <div className="pt-6 space-y-4">
            <h3 className="text-lg font-semibold text-airbnb-dark">Property type</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {PROPERTY_TYPES.map((type) => {
                const isChecked = propertyType.toLowerCase() === type.toLowerCase();
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setPropertyType(isChecked ? "any" : type)}
                    className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between h-24 ${
                      isChecked
                        ? "border-airbnb-dark ring-2 ring-airbnb-dark bg-airbnb-lightGray/30"
                        : "border-airbnb-border hover:border-airbnb-dark"
                    }`}
                  >
                    <span className="text-sm font-semibold text-airbnb-dark">{type}</span>
                    {isChecked && (
                      <div className="self-end p-0.5 bg-airbnb-dark text-white rounded-full">
                        <Check className="h-3 w-3" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. Amenities */}
          <div className="pt-6 space-y-4">
            <h3 className="text-lg font-semibold text-airbnb-dark">Amenities</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {availableAmenities.slice(0, 10).map((amenity) => {
                const isChecked = selectedAmenities.includes(amenity.id);
                return (
                  <label
                    key={amenity.id}
                    onClick={() => toggleAmenity(amenity.id)}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-airbnb-lightGray/60 cursor-pointer transition select-none"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      className="h-5 w-5 rounded border-airbnb-border text-airbnb-dark focus:ring-airbnb-dark cursor-pointer accent-airbnb-dark"
                    />
                    <span className="text-sm text-airbnb-dark font-medium">{amenity.name}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-airbnb-border bg-white">
          <button
            onClick={handleClear}
            className="text-sm font-semibold text-airbnb-dark hover:underline underline-offset-4"
          >
            Clear all
          </button>
          <button
            onClick={handleApply}
            className="px-6 py-3 bg-airbnb-dark text-white rounded-xl text-sm font-semibold hover:bg-black transition shadow-sm"
          >
            Show places
          </button>
        </div>
      </div>
    </div>
  );
}
