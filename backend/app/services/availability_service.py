from datetime import date, timedelta
from sqlalchemy.orm import Session
from app.models import Booking

def has_date_conflict(
    db: Session,
    listing_id: int,
    check_in: date,
    check_out: date,
    exclude_booking_id: int | None = None,
) -> bool:
    """
    Checks if there is an overlapping confirmed booking for the given listing.
    Standard collision condition:
      (existing.check_in_date < check_out) AND (existing.check_out_date > check_in)
    """
    if check_in >= check_out:
        return True

    query = db.query(Booking).filter(
        Booking.listing_id == listing_id,
        Booking.status == "confirmed",
        Booking.check_in_date < check_out,
        Booking.check_out_date > check_in,
    )

    if exclude_booking_id is not None:
        query = query.filter(Booking.id != exclude_booking_id)

    return query.first() is not None

def get_booked_dates_for_listing(db: Session, listing_id: int) -> list[str]:
    """
    Returns an ISO date list ('YYYY-MM-DD') of all days that are unavailable
    for booking on this listing. This is consumed by the frontend calendar
    to disable those dates.
    """
    today = date.today()
    active_bookings = (
        db.query(Booking)
        .filter(
            Booking.listing_id == listing_id,
            Booking.status == "confirmed",
            Booking.check_out_date >= today,
        )
        .all()
    )

    unavailable_dates = set()
    for booking in active_bookings:
        current = booking.check_in_date
        # Block dates from check_in up to (but not including) check_out date
        # (check_out date is checkout morning, so another guest could theoretically check in that afternoon)
        while current < booking.check_out_date:
            unavailable_dates.add(current.isoformat())
            current += timedelta(days=1)

    return sorted(list(unavailable_dates))
