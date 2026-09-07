import React from "react";

export function ListingCardSkeleton() {
  return (
    <div className="flex flex-col gap-2 animate-pulse">
      {/* Photo carousel skeleton */}
      <div className="relative aspect-square md:aspect-[20/19] w-full rounded-xl bg-neutral-200" />

      {/* Info lines skeleton */}
      <div className="pt-2 flex flex-col gap-1.5">
        <div className="flex justify-between items-center gap-2">
          <div className="h-4 w-3/5 bg-neutral-200 rounded" />
          <div className="h-4 w-12 bg-neutral-200 rounded" />
        </div>
        <div className="h-3.5 w-2/5 bg-neutral-200 rounded" />
        <div className="h-3.5 w-1/3 bg-neutral-200 rounded" />
        <div className="h-4 w-28 bg-neutral-200 rounded mt-1" />
      </div>
    </div>
  );
}
