"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Calendar, Users, CheckCircle2, User as UserIcon } from "lucide-react";
import { HostRecentReservation } from "@/types";
import { formatCurrency, formatDateRange } from "@/lib/formatters";

interface RecentReservationsTableProps {
  reservations: HostRecentReservation[];
}

export function RecentReservationsTable({
  reservations,
}: RecentReservationsTableProps) {
  if (reservations.length === 0) {
    return (
      <div className="bg-white border border-neutral-200 rounded-3xl p-12 text-center max-w-lg mx-auto my-8 space-y-3">
        <div className="w-14 h-14 rounded-full bg-neutral-100 text-neutral-500 flex items-center justify-center mx-auto">
          <Calendar className="w-7 h-7 stroke-[1.5]" />
        </div>
        <h3 className="text-lg font-bold text-neutral-900">
          No guest bookings yet
        </h3>
        <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed">
          When guests book your Anywherebnb properties, their trip itineraries and payout calculations will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-neutral-200 rounded-3xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50/70 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
              <th className="py-3.5 px-6">Guest</th>
              <th className="py-3.5 px-6">Listing</th>
              <th className="py-3.5 px-6">Dates</th>
              <th className="py-3.5 px-6">Guests</th>
              <th className="py-3.5 px-6">Payout</th>
              <th className="py-3.5 px-6 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 text-sm">
            {reservations.map((res) => (
              <tr key={res.id} className="hover:bg-neutral-50/50 transition-colors">
                {/* Guest */}
                <td className="py-4 px-6 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="relative w-9 h-9 rounded-full overflow-hidden shrink-0 bg-neutral-100 border border-neutral-200">
                      {res.guest_avatar ? (
                        <Image
                          src={res.guest_avatar}
                          alt={res.guest_name}
                          fill
                          sizes="36px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-500">
                          <UserIcon className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-neutral-900 text-sm leading-tight">
                        {res.guest_name}
                      </p>
                      <span className="text-[11px] text-neutral-400">
                        Booking #{res.id}
                      </span>
                    </div>
                  </div>
                </td>

                {/* Listing */}
                <td className="py-4 px-6">
                  <Link
                    href={`/listings/${res.listing_id}`}
                    className="font-semibold text-neutral-900 hover:underline line-clamp-1 block max-w-xs"
                  >
                    {res.listing_title}
                  </Link>
                  <span className="text-xs text-neutral-500 block">
                    {res.listing_city}
                  </span>
                </td>

                {/* Dates */}
                <td className="py-4 px-6 whitespace-nowrap text-neutral-700 text-xs sm:text-sm">
                  <span className="font-medium text-neutral-900">
                    {formatDateRange(res.check_in_date, res.check_out_date)}
                  </span>
                </td>

                {/* Guests */}
                <td className="py-4 px-6 whitespace-nowrap text-xs sm:text-sm text-neutral-600">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-neutral-400" />
                    <span>
                      {res.total_guests} guest{res.total_guests > 1 ? "s" : ""}
                    </span>
                  </div>
                </td>

                {/* Payout */}
                <td className="py-4 px-6 whitespace-nowrap">
                  <span className="font-bold text-neutral-900">
                    {formatCurrency(res.total_price)}
                  </span>
                </td>

                {/* Status */}
                <td className="py-4 px-6 whitespace-nowrap text-right">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Confirmed</span>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
