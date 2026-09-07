"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { Listing } from "@/types";
import { fetchApi } from "@/lib/api";
import { ListingWizardForm } from "@/components/host";

export default function EditListingPage() {
  const params = useParams();
  const router = useRouter();
  const listingId = Number(params?.id);

  const [listing, setListing] = useState<Listing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!listingId || isNaN(listingId)) {
      setError("Invalid listing ID.");
      setIsLoading(false);
      return;
    }

    async function loadListing() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchApi<Listing>(`/listings/${listingId}`);
        setListing(data);
      } catch (err: any) {
        console.error("Failed to load listing for editing:", err);
        setError(err.message || "Failed to load listing details.");
      } finally {
        setIsLoading(false);
      }
    }

    loadListing();
  }, [listingId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50/50 py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-6 animate-pulse">
          <div className="h-6 w-32 bg-neutral-200 rounded-lg" />
          <div className="h-96 bg-white rounded-3xl border border-neutral-200 p-8 space-y-6">
            <div className="h-8 w-1/2 bg-neutral-200 rounded-lg" />
            <div className="h-4 w-3/4 bg-neutral-200 rounded-lg" />
            <div className="h-32 bg-neutral-100 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-neutral-900">
            Property Not Found
          </h2>
          <p className="text-sm text-neutral-500">
            {error || "The property you are trying to edit could not be found."}
          </p>
          <div className="pt-2">
            <Link
              href="/host"
              className="inline-flex items-center gap-2 bg-neutral-900 hover:bg-black text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Host Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <ListingWizardForm initialData={listing} isEditing={true} />;
}
