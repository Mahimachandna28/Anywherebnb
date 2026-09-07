import { format, parseISO, differenceInDays } from "date-fns";

/**
 * Formats a number as Indian Rupee (INR) currency (e.g. ₹1,250 or ₹1,25,000).
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Formats a date range into Airbnb style (e.g. Oct 12 – 17, 2026 or Oct 28 – Nov 2, 2026).
 */
export function formatDateRange(startDateStr: string, endDateStr: string): string {
  try {
    const start = typeof startDateStr === "string" ? parseISO(startDateStr) : startDateStr;
    const end = typeof endDateStr === "string" ? parseISO(endDateStr) : endDateStr;

    const startMonth = format(start, "MMM");
    const endMonth = format(end, "MMM");

    if (startMonth === endMonth) {
      return `${format(start, "MMM d")} – ${format(end, "d")}`;
    }
    return `${format(start, "MMM d")} – ${format(end, "MMM d")}`;
  } catch {
    return `${startDateStr} – ${endDateStr}`;
  }
}

/**
 * Calculates number of nights between two date strings.
 */
export function calculateNights(startDateStr: string, endDateStr: string): number {
  try {
    const start = parseISO(startDateStr);
    const end = parseISO(endDateStr);
    const nights = differenceInDays(end, start);
    return nights > 0 ? nights : 0;
  } catch {
    return 0;
  }
}

/**
 * Formats rating to 1 or 2 decimal places (e.g. 4.95).
 */
export function formatRating(rating: number): string {
  if (!rating) return "New";
  return rating.toFixed(2);
}
