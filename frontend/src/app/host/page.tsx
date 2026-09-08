"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
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
import { useToast } from "@/context/ToastContext";
import {
  HostMetricsGrid,
  HostListingTable,
  DeleteListingModal,
  RecentReservationsTable,
} from "@/components/host";
import { cn } from "@/lib/utils";

export default function HostDashboardPage() {
  const router = useRouter();
  const toast = useToast();
  const { currentUser, currentRole, allUsers, switchUser, toggleRole } = useUser();

  const [dashboardData, setDashboardData] = useState<HostDashboardData | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Deletion modal state
  const [deletingListing, setDeletingListing] = useState<Listing | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Filter available hosts from all seeded users
  const hosts = useMemo(() => {
    return allUsers.filter(
      (u) => u.role === "host" || u.role === "both" || u.is_superhost
    );
  }, [allUsers]);

  const loadHostData = useCallback(async (targetUserId?: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const activeId = targetUserId ?? currentUser?.id;
      const query = activeId ? `?host_id=${activeId}` : "";
      const [dash, list] = await Promise.all([
        fetchApi<HostDashboardData>(`/host/dashboard${query}`),
        fetchApi<Listing[]>(`/host/listings${query}`),
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
  }, [currentUser?.id]);

  useEffect(() => {
    loadHostData();
  }, [loadHostData]);

  const handleSelectHost = async (hostId: number) => {
    switchUser(hostId);
    await loadHostData(hostId);
  };

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

    setSuccessBanner("Listing was permanently deleted from SQLite database.");
    toast.success("Listing permanently deleted.");
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
              onClick={() => loadHostData()}
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
  const hostFirstName = host.name.split(" ")[0];

  return (
    <div className="min-h-screen bg-neutral-50/50 pb-20">
      {/* 1-Click Host Switcher Pill Bar for Instant Verification */}
      <div className="bg-white border-b border-neutral-200/70 py-2.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-500 uppercase tracking-wider text-[11px]">
              Active Host:
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {hosts.map((h) => {
                const isSelected = h.id === host.id;
                return (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => handleSelectHost(h.id)}
                    className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold transition border",
                      isSelected
                        ? "bg-neutral-900 text-white border-neutral-900 shadow-sm"
                        : "bg-white text-neutral-700 hover:bg-neutral-50 border-neutral-200"
                    )}
                  >
                    <span
                      className={cn(
                        "w-2 h-2 rounded-full",
                        isSelected ? "bg-emerald-400" : "bg-neutral-300"
                      )}
                    />
                    <span>{h.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="text-neutral-500 text-xs hidden sm:block">
            Strictly viewing listings &amp; bookings owned by <span className="font-semibold text-neutral-800">{host.name}</span>
          </div>
        </div>
      </div>

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
                  <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900">
                    Welcome back, {hostFirstName} 👋
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
                <span>+ Create Listing</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
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
              Real-time booking revenue and portfolio metrics for {host.name}.
            </p>
          </div>
          <HostMetricsGrid metrics={dashboardData.metrics} />
        </section>

        {/* 2. Your Listings Section */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-neutral-200 pb-3">
            <div>
              <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-neutral-800" />
                <span>Your Listings</span>
                <span className="text-xs bg-neutral-900 text-white font-bold px-2.5 py-0.5 rounded-full">
                  {listings.length}
                </span>
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Properties owned and managed by {host.name}.
              </p>
            </div>

            <Link
              href="/host/create"
              className="inline-flex items-center gap-2 bg-airbnb-dark hover:bg-black text-white font-semibold text-xs sm:text-sm px-4 py-2 rounded-xl transition shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>+ Create Listing</span>
            </Link>
          </div>

          <HostListingTable
            listings={listings}
            onOpenDeleteModal={(listing) => setDeletingListing(listing)}
          />
        </section>

        {/* 3. Upcoming Bookings Section */}
        <section className="space-y-4 pt-2">
          <div className="border-b border-neutral-200 pb-3">
            <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-neutral-800" />
              <span>Upcoming Bookings</span>
              <span className="text-xs bg-neutral-900 text-white font-bold px-2.5 py-0.5 rounded-full">
                {dashboardData.recent_reservations.length}
              </span>
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Guest reservations strictly for {host.name}&apos;s properties.
            </p>
          </div>

          <RecentReservationsTable
            reservations={dashboardData.recent_reservations}
          />
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
