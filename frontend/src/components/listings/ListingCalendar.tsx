"use client";

import React, { useState, useMemo } from "react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  isAfter,
  isBefore,
  startOfToday,
  differenceInDays,
  parseISO,
  getDay,
  isWithinInterval,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ListingCalendarProps {
  bookedDates?: string[];
  checkIn: string | null;
  checkOut: string | null;
  onChange: (checkIn: string | null, checkOut: string | null) => void;
  city: string;
}

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export function ListingCalendar({
  bookedDates = [],
  checkIn,
  checkOut,
  onChange,
  city,
}: ListingCalendarProps) {
  const today = useMemo(() => startOfToday(), []);
  const [currentMonth, setCurrentMonth] = useState<Date>(today);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);

  // Set of booked dates formatted as 'yyyy-MM-dd' for O(1) lookup
  const bookedSet = useMemo(() => new Set(bookedDates), [bookedDates]);

  const nextMonth = useMemo(() => addMonths(currentMonth, 1), [currentMonth]);

  const parsedCheckIn = checkIn ? parseISO(checkIn) : null;
  const parsedCheckOut = checkOut ? parseISO(checkOut) : null;

  const totalNights =
    parsedCheckIn && parsedCheckOut
      ? differenceInDays(parsedCheckOut, parsedCheckIn)
      : 0;

  const handlePrevMonth = () => {
    if (!isSameMonth(currentMonth, today)) {
      setCurrentMonth((prev) => subMonths(prev, 1));
    }
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => addMonths(prev, 1));
  };

  const isDateBooked = (date: Date): boolean => {
    const formatted = format(date, "yyyy-MM-dd");
    return bookedSet.has(formatted);
  };

  const isDatePast = (date: Date): boolean => {
    return isBefore(date, today);
  };

  const isRangeBlocked = (start: Date, end: Date): boolean => {
    const days = eachDayOfInterval({ start, end });
    return days.some((day) => isDateBooked(day));
  };

  const handleDateClick = (day: Date) => {
    if (isDatePast(day) || isDateBooked(day)) return;

    const dayStr = format(day, "yyyy-MM-dd");

    // If no checkIn selected, or both checkIn & checkOut are already selected:
    if (!parsedCheckIn || (parsedCheckIn && parsedCheckOut)) {
      onChange(dayStr, null);
      return;
    }

    // If checkIn is selected and clicking the same or earlier day: reset checkIn
    if (isBefore(day, parsedCheckIn) || isSameDay(day, parsedCheckIn)) {
      onChange(dayStr, null);
      return;
    }

    // If checkIn is selected and clicking after checkIn:
    if (isAfter(day, parsedCheckIn)) {
      // Validate that no booked dates exist within the selected range
      if (isRangeBlocked(parsedCheckIn, day)) {
        // Range contains booked dates: start fresh with this date as checkIn
        onChange(dayStr, null);
      } else {
        onChange(checkIn, dayStr);
      }
    }
  };

  const renderMonthCalendar = (monthDate: Date) => {
    const start = startOfMonth(monthDate);
    const end = endOfMonth(monthDate);
    const days = eachDayOfInterval({ start, end });
    const startDayOfWeek = getDay(start); // 0 = Sunday

    return (
      <div className="flex-1 min-w-[280px]">
        {/* Month Header */}
        <div className="text-center font-bold text-base text-neutral-900 mb-4">
          {format(monthDate, "MMMM yyyy")}
        </div>

        {/* Weekdays Row */}
        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {WEEKDAYS.map((wd) => (
            <div
              key={wd}
              className="text-xs font-semibold text-neutral-500 py-1"
            >
              {wd}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-y-1">
          {/* Empty spacer cells before 1st day of month */}
          {Array.from({ length: startDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="w-10 h-10" />
          ))}

          {days.map((day) => {
            const isPast = isDatePast(day);
            const isBooked = isDateBooked(day);
            const isStart = parsedCheckIn && isSameDay(day, parsedCheckIn);
            const isEnd = parsedCheckOut && isSameDay(day, parsedCheckOut);

            // In range between checkIn and checkOut
            const isInRange =
              parsedCheckIn &&
              parsedCheckOut &&
              isWithinInterval(day, {
                start: parsedCheckIn,
                end: parsedCheckOut,
              });

            // In range between checkIn and hovered date (preview)
            const isHoverRange =
              parsedCheckIn &&
              !parsedCheckOut &&
              hoverDate &&
              isAfter(hoverDate, parsedCheckIn) &&
              isWithinInterval(day, {
                start: parsedCheckIn,
                end: hoverDate,
              }) &&
              !isRangeBlocked(parsedCheckIn, hoverDate);

            const isDisabled = isPast || isBooked;

            return (
              <div
                key={day.toISOString()}
                className={cn(
                  "relative flex items-center justify-center p-0.5",
                  (isInRange || isHoverRange) && !isStart && !isEnd && "bg-neutral-100",
                  isStart && parsedCheckOut && "bg-gradient-to-r from-transparent to-neutral-100",
                  isEnd && "bg-gradient-to-l from-transparent to-neutral-100"
                )}
              >
                <button
                  type="button"
                  disabled={isDisabled}
                  onClick={() => handleDateClick(day)}
                  onMouseEnter={() => !isDisabled && setHoverDate(day)}
                  onMouseLeave={() => setHoverDate(null)}
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all select-none",
                    // Available default
                    !isDisabled && !isStart && !isEnd && "text-neutral-900 hover:border hover:border-neutral-900 hover:bg-neutral-50",
                    // Selected Start or End
                    (isStart || isEnd) && "bg-neutral-900 text-white font-bold shadow-md hover:bg-neutral-900",
                    // Between range
                    (isInRange || isHoverRange) && !isStart && !isEnd && "text-neutral-900 font-semibold",
                    // Booked or past
                    isBooked && "text-neutral-300 line-through cursor-not-allowed hover:bg-transparent",
                    isPast && !isBooked && "text-neutral-300 cursor-not-allowed hover:bg-transparent"
                  )}
                >
                  {format(day, "d")}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="py-6 border-b border-neutral-200">
      {/* Calendar Header with Title & Date Summary */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-6">
        <div>
          <h3 className="text-xl sm:text-2xl font-semibold text-neutral-900">
            {totalNights > 0
              ? `${totalNights} night${totalNights > 1 ? "s" : ""} in ${city}`
              : "Select check-in date"}
          </h3>
          <p className="text-sm text-neutral-500 mt-1">
            {parsedCheckIn && parsedCheckOut
              ? `${format(parsedCheckIn, "MMM d, yyyy")} – ${format(parsedCheckOut, "MMM d, yyyy")}`
              : "Add your travel dates for exact pricing"}
          </p>
        </div>

        {/* Month Chevrons */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={handlePrevMonth}
            disabled={isSameMonth(currentMonth, today)}
            className="p-2 rounded-full border border-neutral-300 hover:border-neutral-900 disabled:opacity-20 disabled:cursor-not-allowed transition"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-4 h-4 text-neutral-800" />
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-2 rounded-full border border-neutral-300 hover:border-neutral-900 transition"
            aria-label="Next month"
          >
            <ChevronRight className="w-4 h-4 text-neutral-800" />
          </button>
        </div>
      </div>

      {/* 2-Month Calendar Container */}
      <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
        {renderMonthCalendar(currentMonth)}
        <div className="hidden md:block flex-1">
          {renderMonthCalendar(nextMonth)}
        </div>
      </div>

      {/* Calendar Footer: Clear dates */}
      <div className="flex items-center justify-between pt-4 mt-2">
        <div className="flex items-center gap-4 text-xs text-neutral-500">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-neutral-900 inline-block" />
            <span>Selected</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-neutral-200 line-through inline-block text-neutral-400" />
            <span>Unavailable / Booked</span>
          </div>
        </div>

        {(checkIn || checkOut) && (
          <button
            type="button"
            onClick={() => onChange(null, null)}
            className="text-sm font-semibold text-neutral-900 underline hover:text-neutral-600 transition"
          >
            Clear dates
          </button>
        )}
      </div>
    </div>
  );
}
