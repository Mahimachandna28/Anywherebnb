"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  MapPin,
  Home,
  Navigation,
  Utensils,
  Compass,
  Trophy,
  Trees,
  Landmark,
  Maximize2,
  Minimize2,
  Plus,
  Minus,
  Sparkles,
} from "lucide-react";
import { Listing } from "@/types";
import { getNeighbourhoodForListing, NearbyPlace } from "@/data/nearbyPlaces";
import { cn } from "@/lib/utils";

interface ListingMapProps {
  listing: Listing;
}

type FilterCategory = "all" | "dining" | "adventure" | "heritage" | "nature" | "sports";

export function ListingMap({ listing }: ListingMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>("all");
  const [activePlaceId, setActivePlaceId] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const lat = listing.latitude || 15.5188;
  const lng = listing.longitude || 73.7663;

  const neighbourhood = React.useMemo(() => {
    return getNeighbourhoodForListing(listing.city, listing.state, lat, lng);
  }, [listing.city, listing.state, lat, lng]);

  const filteredPlaces = React.useMemo(() => {
    if (selectedCategory === "all") return neighbourhood.places;
    return neighbourhood.places.filter((p) => p.category === selectedCategory);
  }, [neighbourhood.places, selectedCategory]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    let isMounted = true;

    async function initLeaflet() {
      try {
        const L = (await import("leaflet")).default;
        if (!isMounted || !mapContainerRef.current) return;

        // Clean existing map instance if any
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }

        // Initialize map
        const map = L.map(mapContainerRef.current, {
          center: [lat, lng],
          zoom: 14,
          zoomControl: false, // We render custom Airbnb styled controls
          attributionControl: false,
        });

        mapInstanceRef.current = map;

        // CartoDB Voyager Tile Layer (Modern, crisp, Google Maps style)
        L.tileLayer(
          "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
          {
            maxZoom: 19,
            subdomains: "abcd",
          }
        ).addTo(map);

        // 1. Add BnB Home Marker (Black circle with white house icon)
        const homeIconHtml = `
          <div class="relative group cursor-pointer flex flex-col items-center">
            <div class="w-11 h-11 bg-neutral-900 text-white rounded-full flex items-center justify-center shadow-2xl border-2 border-white transition-transform hover:scale-110">
              <svg class="w-6 h-6 fill-white" viewBox="0 0 24 24">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
              </svg>
            </div>
            <div class="w-2.5 h-2.5 bg-neutral-900 rotate-45 -mt-1 border-r border-b border-white"></div>
            <div class="mt-1 px-2.5 py-0.5 bg-neutral-900/90 text-white text-[11px] font-bold rounded-full shadow-md whitespace-nowrap backdrop-blur-xs tracking-tight">
              ${listing.title.split("-")[0].trim()}
            </div>
          </div>
        `;

        const homeIcon = L.divIcon({
          html: homeIconHtml,
          className: "custom-home-pin",
          iconSize: [44, 44],
          iconAnchor: [22, 22],
        });

        const homeMarker = L.marker([lat, lng], { icon: homeIcon }).addTo(map);
        homeMarker.bindPopup(`
          <div class="p-1 min-w-[200px]">
            <p class="text-xs font-bold text-[#E00B41] uppercase tracking-wider mb-0.5">Your Stay Location</p>
            <p class="text-sm font-bold text-neutral-900">${listing.title}</p>
            <p class="text-xs text-neutral-500 mt-1">${listing.city}, ${listing.state || ""}</p>
          </div>
        `);

        // 2. Render Nearby Famous Place Pins
        renderPlaceMarkers(L, map);
      } catch (err) {
        console.error("Failed to initialize map:", err);
      }
    }

    initLeaflet();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [lat, lng]);

  // Re-render place markers when filter changes
  useEffect(() => {
    async function updateMarkers() {
      if (!mapInstanceRef.current) return;
      const L = (await import("leaflet")).default;
      renderPlaceMarkers(L, mapInstanceRef.current);
    }
    updateMarkers();
  }, [filteredPlaces]);

  const renderPlaceMarkers = (L: any, map: any) => {
    // Remove previous place markers
    markersRef.current.forEach((m) => map.removeLayer(m));
    markersRef.current = [];

    // Category colors and SVG icons
    const categoryConfig: Record<string, { bg: string; border: string; svg: string }> = {
      sports: {
        bg: "bg-emerald-600",
        border: "border-emerald-700",
        svg: `<svg class="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>`,
      },
      adventure: {
        bg: "bg-rose-500",
        border: "border-rose-600",
        svg: `<svg class="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/></svg>`,
      },
      heritage: {
        bg: "bg-purple-600",
        border: "border-purple-700",
        svg: `<svg class="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24"><path d="M12 3L2 12h3v8h14v-8h3L12 3zm1 15h-2v-5h2v5z"/></svg>`,
      },
      dining: {
        bg: "bg-amber-500",
        border: "border-amber-600",
        svg: `<svg class="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24"><path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z"/></svg>`,
      },
      nature: {
        bg: "bg-cyan-600",
        border: "border-cyan-700",
        svg: `<svg class="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24"><path d="M17 12c-2.76 0-5 2.24-5 5 0 .34.04.67.1 1H4.1c-.06-.33-.1-.66-.1-1 0-2.76 2.24-5 5-5 .34 0 .67.04 1 .1-1.2-1.38-2-3.21-2-5.1C8 4.24 10.24 2 13 2s5 2.24 5 5c0 1.89-.8 3.72-2 5.1.33-.06.66-.1 1-.1z"/></svg>`,
      },
    };

    filteredPlaces.forEach((place) => {
      const config = categoryConfig[place.category] || categoryConfig.heritage;

      const placeIconHtml = `
        <div class="group relative cursor-pointer flex items-center gap-1.5 transition-transform hover:scale-110 active:scale-95">
          <div class="w-7 h-7 rounded-full ${config.bg} text-white flex items-center justify-center shadow-lg border-2 border-white shrink-0">
            ${config.svg}
          </div>
          <div class="bg-white/95 px-2.5 py-1 rounded-full shadow-md border border-neutral-200 text-xs font-bold text-neutral-800 whitespace-nowrap backdrop-blur-xs tracking-tight group-hover:bg-neutral-900 group-hover:text-white transition-colors">
            ${place.name}
          </div>
        </div>
      `;

      const placeIcon = L.divIcon({
        html: placeIconHtml,
        className: "custom-place-pin",
        iconSize: [160, 32],
        iconAnchor: [14, 16],
      });

      const marker = L.marker([place.lat, place.lng], { icon: placeIcon }).addTo(map);

      // Popup Content
      marker.bindPopup(`
        <div class="p-1 min-w-[220px]">
          <div class="flex items-center justify-between gap-2 mb-1.5">
            <span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${config.bg} text-white tracking-wide uppercase">
              ${place.categoryLabel}
            </span>
            <span class="text-xs font-semibold text-neutral-500 font-mono">
              ${place.distance} (${place.travelTime})
            </span>
          </div>
          <h4 class="text-sm font-bold text-neutral-900 leading-snug">${place.name}</h4>
          <p class="text-xs text-neutral-600 mt-1 leading-relaxed">${place.description}</p>
        </div>
      `);

      marker.on("click", () => {
        setActivePlaceId(place.id);
      });

      markersRef.current.push(marker);
    });
  };

  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  const handleCenterStay = () => {
    mapInstanceRef.current?.flyTo([lat, lng], 14, { duration: 1 });
  };

  const handleFocusPlace = (place: NearbyPlace) => {
    setActivePlaceId(place.id);
    mapInstanceRef.current?.flyTo([place.lat, place.lng], 15, { duration: 1.2 });
  };

  const handleToggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <section className="py-8 border-t border-neutral-200" id="location-section">
      {/* 1. Header & Location Subtitle (Direct Match to User Screenshot) */}
      <div className="mb-5">
        <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">
          Where you&apos;ll be
        </h2>
        <p className="text-sm text-neutral-700 mt-1 font-medium flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-[#E00B41] shrink-0 inline" />
          <span>
            {listing.address ? `${listing.address}, ` : ""}
            <strong className="text-neutral-900">{listing.city}</strong>,{" "}
            {listing.state ? `${listing.state}, ` : ""}
            {listing.country}
          </span>
        </p>
      </div>

      {/* 2. Interactive Map Container with Floating Controls */}
      <div
        className={cn(
          "relative w-full rounded-3xl overflow-hidden border border-neutral-200 shadow-sm transition-all duration-300",
          isFullscreen
            ? "fixed inset-0 z-50 rounded-none h-screen w-screen border-none"
            : "h-[480px] sm:h-[520px]"
        )}
      >
        {/* Leaflet DOM Anchor */}
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* 2.1 Floating Top-Left Search & Filter Pill Bar (From Reference Screenshot) */}
        <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-1.5 max-w-[85%] sm:max-w-none">
          <div className="bg-white/95 backdrop-blur-md rounded-full shadow-lg border border-neutral-200 p-1 flex items-center gap-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setSelectedCategory("all")}
              className={cn(
                "px-3 py-1.5 rounded-full transition cursor-pointer flex items-center gap-1.5",
                selectedCategory === "all"
                  ? "bg-neutral-900 text-white shadow-xs"
                  : "text-neutral-700 hover:bg-neutral-100"
              )}
            >
              <span>Explore all ({neighbourhood.places.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedCategory("dining")}
              className={cn(
                "px-3 py-1.5 rounded-full transition cursor-pointer flex items-center gap-1.5",
                selectedCategory === "dining"
                  ? "bg-amber-500 text-white shadow-xs"
                  : "text-neutral-700 hover:bg-neutral-100"
              )}
            >
              <Utensils className="w-3 h-3" />
              <span>Dining</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedCategory("heritage")}
              className={cn(
                "hidden sm:flex px-3 py-1.5 rounded-full transition cursor-pointer items-center gap-1.5",
                selectedCategory === "heritage"
                  ? "bg-purple-600 text-white shadow-xs"
                  : "text-neutral-700 hover:bg-neutral-100"
              )}
            >
              <Landmark className="w-3 h-3" />
              <span>Heritage</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedCategory("nature")}
              className={cn(
                "hidden md:flex px-3 py-1.5 rounded-full transition cursor-pointer items-center gap-1.5",
                selectedCategory === "nature"
                  ? "bg-cyan-600 text-white shadow-xs"
                  : "text-neutral-700 hover:bg-neutral-100"
              )}
            >
              <Trees className="w-3 h-3" />
              <span>Beach &amp; Nature</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedCategory("sports")}
              className={cn(
                "hidden lg:flex px-3 py-1.5 rounded-full transition cursor-pointer items-center gap-1.5",
                selectedCategory === "sports"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-neutral-700 hover:bg-neutral-100"
              )}
            >
              <Trophy className="w-3 h-3" />
              <span>Sports</span>
            </button>
          </div>
        </div>

        {/* 2.2 Floating Right-Side Controls: Fullscreen, Zoom In/Out, Reset Stay Pin */}
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
          {/* Fullscreen Button */}
          <button
            type="button"
            onClick={handleToggleFullscreen}
            aria-label="Toggle Fullscreen"
            title="Toggle Fullscreen"
            className="w-10 h-10 bg-white/95 backdrop-blur-md rounded-full shadow-md border border-neutral-200 flex items-center justify-center text-neutral-800 hover:bg-neutral-100 transition cursor-pointer"
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>
        </div>

        <div className="absolute bottom-6 right-4 z-10 flex flex-col gap-1.5">
          {/* Recenter Stay Pin */}
          <button
            type="button"
            onClick={handleCenterStay}
            aria-label="Center on Stay"
            title="Center on Stay"
            className="w-10 h-10 bg-white/95 backdrop-blur-md rounded-full shadow-md border border-neutral-200 flex items-center justify-center text-neutral-800 hover:bg-neutral-100 transition cursor-pointer"
          >
            <Home className="w-4 h-4" />
          </button>

          {/* Zoom In & Out */}
          <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-md border border-neutral-200 flex flex-col overflow-hidden">
            <button
              type="button"
              onClick={handleZoomIn}
              aria-label="Zoom In"
              className="w-10 h-9 flex items-center justify-center text-neutral-800 hover:bg-neutral-100 border-b border-neutral-200 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleZoomOut}
              aria-label="Zoom Out"
              className="w-10 h-9 flex items-center justify-center text-neutral-800 hover:bg-neutral-100 transition cursor-pointer"
            >
              <Minus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2.3 Map Attribution Pill & Scale Indicator (Reference Match) */}
        <div className="absolute bottom-2 left-4 z-10 flex items-center gap-2 text-[10px] text-neutral-600 bg-white/85 px-2.5 py-1 rounded-md shadow-xs backdrop-blur-xs font-mono select-none">
          <span className="font-bold text-neutral-800">Anywherebnb Maps</span>
          <span>·</span>
          <span>500 m scale</span>
          <span>·</span>
          <span>OpenStreetMap &amp; CartoDB Data</span>
        </div>
      </div>

      {/* 3. Neighbourhood Highlights & Nearby Famous Places List (Under Map) */}
      <div className="mt-8">
        <h3 className="text-xl font-bold text-neutral-900 tracking-tight mb-2">
          Neighbourhood highlights
        </h3>
        <p className="text-[15px] text-neutral-700 leading-relaxed max-w-3xl mb-6">
          {neighbourhood.summary}
        </p>

        {/* Nearby Famous Places Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {neighbourhood.places.map((place) => {
            const isSelected = activePlaceId === place.id;
            return (
              <div
                key={place.id}
                onClick={() => handleFocusPlace(place)}
                className={cn(
                  "p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group",
                  isSelected
                    ? "border-neutral-900 bg-neutral-50 ring-2 ring-neutral-900 shadow-md"
                    : "border-neutral-200 hover:border-neutral-400 bg-white hover:shadow-xs"
                )}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider",
                        place.category === "sports" && "bg-emerald-100 text-emerald-800",
                        place.category === "adventure" && "bg-rose-100 text-rose-800",
                        place.category === "heritage" && "bg-purple-100 text-purple-800",
                        place.category === "dining" && "bg-amber-100 text-amber-800",
                        place.category === "nature" && "bg-cyan-100 text-cyan-800"
                      )}
                    >
                      {place.categoryLabel}
                    </span>
                    <span className="text-xs font-bold text-neutral-900 flex items-center gap-1 font-mono">
                      <Navigation className="w-3 h-3 text-[#E00B41]" />
                      {place.distance}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-neutral-900 group-hover:text-[#E00B41] transition-colors leading-snug">
                    {place.name}
                  </h4>
                  <p className="text-xs text-neutral-600 mt-1 line-clamp-2 leading-relaxed">
                    {place.description}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
                  <span className="font-medium text-neutral-700">
                    🚶 {place.travelTime}
                  </span>
                  <span className="text-[11px] text-[#E00B41] font-semibold group-hover:underline">
                    View on map →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
