"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, MapPin, X, Minus, Plus, Calendar, Compass } from "lucide-react";
import { useFilters } from "@/context/FilterContext";
import { cn } from "@/lib/utils";
import { format, addDays } from "date-fns";

const POPULAR_DESTINATIONS = [
  { city: "Anywhere", country: "I'm flexible", icon: Compass },
  { city: "Goa", country: "Candolim / Coastal", icon: MapPin },
  { city: "Mumbai", country: "Bandra / Marine Drive", icon: MapPin },
  { city: "Delhi", country: "Connaught Place / Lutyens", icon: MapPin },
  { city: "Jaipur", country: "Amer / Heritage", icon: MapPin },
  { city: "Manali", country: "Solang Valley / Mountains", icon: MapPin },
  { city: "Udaipur", country: "Lake Pichola / Haveli", icon: MapPin },
  { city: "Bengaluru", country: "Indiranagar / Garden City", icon: MapPin },
  { city: "Rishikesh", country: "Tapovan / Ganga Bliss", icon: MapPin },
  { city: "Munnar", country: "Tea Gardens / Kerala", icon: MapPin },
  { city: "Varanasi", country: "Assi Ghat / Holy Ganges", icon: MapPin },
];

export function ExpandedSearchBar() {
  const {
    filters,
    setFilters,
    isSearchExpanded,
    setIsSearchExpanded,
    activeSearchTab,
    setActiveSearchTab,
  } = useFilters();

  // Local draft state while composing search
  const [destinationInput, setDestinationInput] = useState(filters.destination || "");
  const [checkInDate, setCheckInDate] = useState(filters.checkIn || "");
  const [checkOutDate, setCheckOutDate] = useState(filters.checkOut || "");
  const [adults, setAdults] = useState<number>(filters.guests ? Math.max(1, filters.guests) : 0);
  const [children, setChildren] = useState<number>(0);
  const [infants, setInfants] = useState<number>(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync draft state with filters
  useEffect(() => {
    setDestinationInput(filters.destination || "");
    setCheckInDate(filters.checkIn || "");
    setCheckOutDate(filters.checkOut || "");
    if (filters.guests) {
      setAdults(Math.max(1, filters.guests));
    }
  }, [filters]);

  // Focus input when "where" tab becomes active
  useEffect(() => {
    if (isSearchExpanded && activeSearchTab === "where") {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isSearchExpanded, activeSearchTab]);

  const totalGuests = adults + children;

  // Filter destinations based on user input
  const filteredDestinations = POPULAR_DESTINATIONS.filter(
    (d) =>
      d.city.toLowerCase().includes(destinationInput.toLowerCase()) ||
      d.country.toLowerCase().includes(destinationInput.toLowerCase())
  );

  const handleSelectDestination = (dest: { city: string; country: string }) => {
    if (dest.city === "Anywhere") {
      setDestinationInput("");
    } else {
      setDestinationInput(dest.city);
    }
    setActiveSearchTab("checkIn");
  };

  const handleApplySearch = () => {
    setFilters((prev) => ({
      ...prev,
      destination: destinationInput.trim() ? destinationInput.trim() : undefined,
      checkIn: checkInDate || undefined,
      checkOut: checkOutDate || undefined,
      guests: totalGuests > 0 ? totalGuests : undefined,
    }));
    setIsSearchExpanded(false);
    setActiveSearchTab(null);
  };

  const handleClearAll = () => {
    setDestinationInput("");
    setCheckInDate("");
    setCheckOutDate("");
    setAdults(0);
    setChildren(0);
    setInfants(0);
    setFilters((prev) => ({
      ...prev,
      destination: undefined,
      checkIn: undefined,
      checkOut: undefined,
      guests: undefined,
    }));
  };

  if (!isSearchExpanded) return null;

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-black/30 z-40 transition-opacity animate-fade-in"
        onClick={() => {
          setIsSearchExpanded(false);
          setActiveSearchTab(null);
        }}
      />

      {/* Expanded Search Bar Floating Container */}
      <div
        ref={containerRef}
        className="absolute top-2 left-0 right-0 z-50 flex flex-col items-center max-w-4xl mx-auto px-4 sm:px-6"
      >
        {/* Main Search Bar Shell */}
        <div className="w-full bg-[#EBEBEB] p-2 rounded-full shadow-2xl flex items-center border border-neutral-300 relative transition-all">
          {/* 1. Destination Segment */}
          <div
            onClick={() => setActiveSearchTab("where")}
            className={cn(
              "flex-1 px-6 py-3 rounded-full cursor-pointer transition-all flex flex-col justify-center",
              activeSearchTab === "where"
                ? "bg-white shadow-lg"
                : "hover:bg-neutral-200/70"
            )}
          >
            <span className="text-xs font-bold text-neutral-800 tracking-tight">
              Where
            </span>
            <input
              ref={inputRef}
              type="text"
              value={destinationInput}
              onChange={(e) => setDestinationInput(e.target.value)}
              placeholder="Search destinations"
              className="bg-transparent text-sm text-neutral-900 placeholder:text-neutral-500 font-medium focus:outline-none w-full truncate"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleApplySearch();
              }}
            />
          </div>

          <div className="w-[1px] h-8 bg-neutral-300 mx-1" />

          {/* 2. Check-in Segment */}
          <div
            onClick={() => setActiveSearchTab("checkIn")}
            className={cn(
              "flex-1 px-6 py-3 rounded-full cursor-pointer transition-all flex flex-col justify-center",
              activeSearchTab === "checkIn"
                ? "bg-white shadow-lg"
                : "hover:bg-neutral-200/70"
            )}
          >
            <span className="text-xs font-bold text-neutral-800 tracking-tight">
              Check in
            </span>
            <span
              className={cn(
                "text-sm truncate font-medium",
                checkInDate ? "text-neutral-900" : "text-neutral-500"
              )}
            >
              {checkInDate ? format(new Date(checkInDate), "MMM d") : "Add dates"}
            </span>
          </div>

          <div className="w-[1px] h-8 bg-neutral-300 mx-1" />

          {/* 3. Check-out Segment */}
          <div
            onClick={() => setActiveSearchTab("checkOut")}
            className={cn(
              "flex-1 px-6 py-3 rounded-full cursor-pointer transition-all flex flex-col justify-center",
              activeSearchTab === "checkOut"
                ? "bg-white shadow-lg"
                : "hover:bg-neutral-200/70"
            )}
          >
            <span className="text-xs font-bold text-neutral-800 tracking-tight">
              Check out
            </span>
            <span
              className={cn(
                "text-sm truncate font-medium",
                checkOutDate ? "text-neutral-900" : "text-neutral-500"
              )}
            >
              {checkOutDate ? format(new Date(checkOutDate), "MMM d") : "Add dates"}
            </span>
          </div>

          <div className="w-[1px] h-8 bg-neutral-300 mx-1" />

          {/* 4. Guests Segment */}
          <div
            onClick={() => setActiveSearchTab("who")}
            className={cn(
              "flex-1 pl-6 pr-3 py-3 rounded-full cursor-pointer transition-all flex items-center justify-between",
              activeSearchTab === "who"
                ? "bg-white shadow-lg"
                : "hover:bg-neutral-200/70"
            )}
          >
            <div className="flex flex-col justify-center truncate">
              <span className="text-xs font-bold text-neutral-800 tracking-tight">
                Who
              </span>
              <span
                className={cn(
                  "text-sm truncate font-medium",
                  totalGuests > 0 ? "text-neutral-900" : "text-neutral-500"
                )}
              >
                {totalGuests > 0
                  ? `${totalGuests} guest${totalGuests > 1 ? "s" : ""}${
                      infants > 0 ? `, ${infants} infant${infants > 1 ? "s" : ""}` : ""
                    }`
                  : "Add guests"}
              </span>
            </div>

            {/* Airbnb Rose Search Action Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleApplySearch();
              }}
              className="ml-2 flex items-center gap-2 bg-[#FF385C] hover:bg-[#E00B41] text-white px-4 py-3 rounded-full font-semibold text-sm shadow-md transition-all active:scale-95 shrink-0"
            >
              <Search className="w-4 h-4 stroke-[3]" />
              <span>Search</span>
            </button>
          </div>
        </div>

        {/* Floating Popover Panels based on activeSearchTab */}
        <div className="w-full mt-3 flex justify-start">
          {/* Where: Destinations Popover */}
          {activeSearchTab === "where" && (
            <div className="bg-white rounded-3xl p-6 shadow-2xl border border-neutral-200 w-full max-w-md animate-in fade-in-50 zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Popular Destinations
                </span>
                {destinationInput && (
                  <button
                    type="button"
                    onClick={() => setDestinationInput("")}
                    className="text-xs text-neutral-500 hover:text-neutral-900 flex items-center gap-1 font-medium"
                  >
                    <X className="w-3.5 h-3.5" /> Clear
                  </button>
                )}
              </div>

              <div className="mt-3 grid grid-cols-1 gap-1 max-h-72 overflow-y-auto">
                {filteredDestinations.map((dest, idx) => {
                  const Icon = dest.icon;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectDestination(dest)}
                      className="flex items-center gap-3.5 p-3 rounded-xl hover:bg-neutral-100 text-left transition-colors"
                    >
                      <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center shrink-0 border border-neutral-200/60">
                        <Icon className="w-5 h-5 text-neutral-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-neutral-900 leading-tight">
                          {dest.city}
                        </p>
                        <p className="text-xs text-neutral-500">{dest.country}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Dates: Check-in / Check-out Popover */}
          {(activeSearchTab === "checkIn" || activeSearchTab === "checkOut") && (
            <div className="bg-white rounded-3xl p-6 shadow-2xl border border-neutral-200 w-full max-w-lg animate-in fade-in-50 zoom-in-95">
              <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-neutral-700" />
                  <span className="font-semibold text-neutral-900 text-base">
                    {activeSearchTab === "checkIn"
                      ? "Select Check-in Date"
                      : "Select Check-out Date"}
                  </span>
                </div>
                {(checkInDate || checkOutDate) && (
                  <button
                    type="button"
                    onClick={() => {
                      setCheckInDate("");
                      setCheckOutDate("");
                    }}
                    className="text-xs text-neutral-500 hover:text-neutral-900 font-medium"
                  >
                    Reset dates
                  </button>
                )}
              </div>

              {/* Quick Preset Buttons */}
              <div className="grid grid-cols-3 gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    const today = new Date();
                    const nextWeek = addDays(today, 7);
                    setCheckInDate(format(today, "yyyy-MM-dd"));
                    setCheckOutDate(format(nextWeek, "yyyy-MM-dd"));
                    setActiveSearchTab("who");
                  }}
                  className="py-2 px-3 border border-neutral-200 rounded-full text-xs font-semibold hover:border-neutral-900 transition-colors text-center"
                >
                  Next 7 days
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const today = new Date();
                    const weekend = addDays(today, 4);
                    const monday = addDays(weekend, 3);
                    setCheckInDate(format(weekend, "yyyy-MM-dd"));
                    setCheckOutDate(format(monday, "yyyy-MM-dd"));
                    setActiveSearchTab("who");
                  }}
                  className="py-2 px-3 border border-neutral-200 rounded-full text-xs font-semibold hover:border-neutral-900 transition-colors text-center"
                >
                  This weekend
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const today = new Date();
                    const monthEnd = addDays(today, 14);
                    setCheckInDate(format(today, "yyyy-MM-dd"));
                    setCheckOutDate(format(monthEnd, "yyyy-MM-dd"));
                    setActiveSearchTab("who");
                  }}
                  className="py-2 px-3 border border-neutral-200 rounded-full text-xs font-semibold hover:border-neutral-900 transition-colors text-center"
                >
                  2 Weeks
                </button>
              </div>

              {/* Native Date Pickers */}
              <div className="grid grid-cols-2 gap-4 mt-5">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Check-in Date
                  </label>
                  <input
                    type="date"
                    value={checkInDate}
                    onChange={(e) => {
                      setCheckInDate(e.target.value);
                      if (activeSearchTab === "checkIn") {
                        setActiveSearchTab("checkOut");
                      }
                    }}
                    className="w-full border border-neutral-300 rounded-xl px-3 py-2 text-sm text-neutral-800 font-medium focus:outline-none focus:border-neutral-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Check-out Date
                  </label>
                  <input
                    type="date"
                    min={checkInDate || undefined}
                    value={checkOutDate}
                    onChange={(e) => {
                      setCheckOutDate(e.target.value);
                      setActiveSearchTab("who");
                    }}
                    className="w-full border border-neutral-300 rounded-xl px-3 py-2 text-sm text-neutral-800 font-medium focus:outline-none focus:border-neutral-900"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Who: Guests Popover */}
          {activeSearchTab === "who" && (
            <div className="bg-white rounded-3xl p-6 shadow-2xl border border-neutral-200 w-full max-w-sm ml-auto animate-in fade-in-50 zoom-in-95">
              {/* Adults Counter */}
              <div className="flex items-center justify-between py-4 border-b border-neutral-100">
                <div>
                  <p className="font-semibold text-sm text-neutral-900">Adults</p>
                  <p className="text-xs text-neutral-500">Ages 13 or above</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={adults <= 0}
                    onClick={() => setAdults((prev) => Math.max(0, prev - 1))}
                    className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center text-neutral-600 hover:border-neutral-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-6 text-center text-sm font-semibold text-neutral-900">
                    {adults}
                  </span>
                  <button
                    type="button"
                    onClick={() => setAdults((prev) => prev + 1)}
                    className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center text-neutral-600 hover:border-neutral-900 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Children Counter */}
              <div className="flex items-center justify-between py-4 border-b border-neutral-100">
                <div>
                  <p className="font-semibold text-sm text-neutral-900">Children</p>
                  <p className="text-xs text-neutral-500">Ages 2–12</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={children <= 0}
                    onClick={() => setChildren((prev) => Math.max(0, prev - 1))}
                    className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center text-neutral-600 hover:border-neutral-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-6 text-center text-sm font-semibold text-neutral-900">
                    {children}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (adults === 0) setAdults(1);
                      setChildren((prev) => prev + 1);
                    }}
                    className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center text-neutral-600 hover:border-neutral-900 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Infants Counter */}
              <div className="flex items-center justify-between py-4">
                <div>
                  <p className="font-semibold text-sm text-neutral-900">Infants</p>
                  <p className="text-xs text-neutral-500">Under 2</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={infants <= 0}
                    onClick={() => setInfants((prev) => Math.max(0, prev - 1))}
                    className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center text-neutral-600 hover:border-neutral-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-6 text-center text-sm font-semibold text-neutral-900">
                    {infants}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (adults === 0) setAdults(1);
                      setInfants((prev) => prev + 1);
                    }}
                    className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center text-neutral-600 hover:border-neutral-900 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
