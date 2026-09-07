"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  ShieldCheck,
  Building2,
  CalendarCheck,
  CheckCircle2,
  X,
  Compass,
} from "lucide-react";
import { Listing, HostDashboardData } from "@/types";
import { fetchApi } from "@/lib/api";
import { useUser } from "@/context/UserContext";
import {
  HostMetricsGrid,
  HostListingTable,
  DeleteListingModal,
  RecentReservationsTable,
} from "@/components/host";
import { cn } from "@/lib/utils";

export default function HostDashboardPage() {
  const router = useRouter();
  const { currentRole, toggleRole } = useUser();

  const [dashboardData, setDashboardData] = useState<HostDashboardData | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"listings" | "reservations">("listings");

  // Deletion modal state
  const [deletingListing, setDeletingListing] = useState<Listing | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const loadHostData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [dash, list] = await Promise.all([
        fetchApi<HostDashboardData>("/host/dashboard"),
        fetchApi<Listing[]>("/host/listings"),
      ]);

      setDashboardData(dash);
      setListings(list);
    } catch (err: any) {
      console.error("Failed to load host dashboard:", err);
      setError(
        err.message || "Failed to load host dashboard. Please ensure the backend is running."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHostData();
  }, [loadHostData]);

  const handleListingDeleted = (deletedId: number) => {
    setListings((prev) => prev.filter((l) => l.id !== deletedId));
    if (dashboardData) {
      setDashboardData({
        ...dashboardData,
        metrics: {
          ...dashboardData.metrics,
          active_listings_count: Math.max(
            0,
            dashboardData.metrics.active_listings_count - 1
          ),
        },
      });
    }

    setSuccessBanner("Listing was permanently deleted.");
    setTimeout(() => setSuccessBanner(null), 5000);
  };

  const handleSwitchToGuest = () => {
    if (currentRole === "host") {
      toggleRole();
    }
    router.push("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50/50 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-pulse">
          {/* Header Skeleton */}
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <div className="h-8 w-64 bg-neutral-200 rounded-xl" />
              <div className="h-4 w-40 bg-neutral-200 rounded-lg" />
            </div>
            <div className="h-10 w-36 bg-neutral-200 rounded-xl" />
          </div>

          {/* Metrics Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-neutral-200 rounded-2xl" />
            ))}
          </div>

          {/* Table Skeleton */}
          <div className="h-80 bg-neutral-200 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-rose-50 text-airbnb-rose flex items-center justify-center mx-auto">
            <Compass className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-neutral-900">
            Host Dashboard Unavailable
          </h2>
          <p className="text-sm text-neutral-500">{error}</p>
          <div className="pt-2 flex justify-center gap-3">
            <button
              type="button"
              onClick={loadHostData}
              className="px-5 py-2.5 bg-neutral-900 text-white font-semibold text-sm rounded-xl hover:bg-black transition"
            >
              Retry
            </button>
            <Link
              href="/"
              className="px-5 py-2.5 border border-neutral-300 text-neutral-800 font-semibold text-sm rounded-xl hover:bg-neutral-100 transition"
            >
              Go to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const host = dashboardData.host;

  return (
    <div className="min-h-screen bg-neutral-50/50 pb-20">
      {/* Top Banner / Breadcrumb Area */}
      <div className="bg-white border-b border-neutral-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Host Identity */}
            <div className="flex items-center gap-4">
              <div className="relative w-14 h-14 rounded-full overflow-hidden shrink-0 border-2 border-neutral-100 shadow-sm bg-neutral-100">
                {host.avatar_url ? (
                  <Image
                    src={host.avatar_url}
                    alt={host.name}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-neutral-600">
                    {host.name[0]}
                  </div>
                )}
                {host.is_superhost && (
                  <div
                    className="absolute -bottom-1 -right-1 bg-airbnb-rose text-white p-1 rounded-full shadow"
                    title="Superhost"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-neutral-900">
                    {host.name}
                  </h1>
                  {host.is_superhost && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-airbnb-rose bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">
                      Superhost
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
                  Host Workspace · {host.email}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              <button
                type="button"
                onClick={handleSwitchToGuest}
                className="px-4 py-2.5 rounded-xl border border-neutral-300 text-neutral-700 hover:bg-neutral-100 text-xs sm:text-sm font-semibold transition"
              >
                Switch to Traveling
              </button>

              <Link
                href="/host/create"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#E61E4D] via-[#E31C5F] to-[#D70466] hover:opacity-95 text-white font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-md transition active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Create listing</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Success Alert */}
        {successBanner && (
          <div className="p-4 bg-neutral-900 text-white rounded-2xl flex items-center justify-between shadow-lg animate-in fade-in">
            <div className="flex items-center gap-2.5 text-sm font-medium">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>{successBanner}</span>
            </div>
            <button
              type="button"
              onClick={() => setSuccessBanner(null)}
              className="p-1 hover:bg-neutral-800 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* 1. Analytics KPI Metrics Grid */}
        <section>
          <div className="mb-4">
            <h2 className="text-lg font-bold text-neutral-900">
              Performance &amp; Earnings
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Real-time booking revenue and portfolio metrics.
            </p>
          </div>
          <HostMetricsGrid metrics={dashboardData.metrics} />
        </section>

        {/* 2. Tabs (Listings vs Reservations) */}
        <section className="space-y-6">
          <div className="border-b border-neutral-200">
            <div className="flex items-center gap-6">
              <button
                type="button"
                onClick={() => setActiveTab("listings")}
                className={cn(
                  "pb-3.5 text-sm font-bold flex items-center gap-2 relative transition",
                  activeTab === "listings"
                    ? "text-neutral-900"
                    : "text-neutral-500 hover:text-neutral-700"
                )}
              >
                <Building2 className="w-4 h-4" />
                <span>Your Listings</span>
                <span
                  className={cn(
                    "text-xs px-2 py-0.5 rounded-full font-bold",
                    activeTab === "listings"
                      ? "bg-neutral-900 text-white"
                      : "bg-neutral-200 text-neutral-700"
                  )}
                >
                  {listings.length}
                </span>
                {activeTab === "listings" && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-neutral-900 rounded-full" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("reservations")}
                className={cn(
                  "pb-3.5 text-sm font-bold flex items-center gap-2 relative transition",
                  activeTab === "reservations"
                    ? "text-neutral-900"
                    : "text-neutral-500 hover:text-neutral-700"
                )}
              >
                <CalendarCheck className="w-4 h-4" />
                <span>Reservations</span>
                <span
                  className={cn(
                    "text-xs px-2 py-0.5 rounded-full font-bold",
                    activeTab === "reservations"
                      ? "bg-neutral-900 text-white"
                      : "bg-neutral-200 text-neutral-700"
                  )}
                >
                  {dashboardData.recent_reservations.length}
                </span>
                {activeTab === "reservations" && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-neutral-900 rounded-full" />
                )}
              </button>
            </div>
          </div>

          {/* Active Tab Content */}
          {activeTab === "listings" ? (
            <HostListingTable
              listings={listings}
              onOpenDeleteModal={(listing) => setDeletingListing(listing)}
            />
          ) : (
            <RecentReservationsTable
              reservations={dashboardData.recent_reservations}
            />
          )}
        </section>
      </main>

      {/* Delete Confirmation Modal */}
      <DeleteListingModal
        listing={deletingListing}
        isOpen={!!deletingListing}
        onClose={() => setDeletingListing(null)}
        onDeleted={handleListingDeleted}
      />
    </div>
  );
}
