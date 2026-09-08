from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.models import Listing, Booking, User
from app.schemas.listing import ListingResponse

router = APIRouter(prefix="/host", tags=["Host"])

def get_current_host(
    host_id: int | None = Query(None),
    db: Session = Depends(get_db),
) -> User:
    """
    Resolves active host:
    1. If explicit host_id is provided, lookup that user.
    2. Default to primary host Rahul Sharma (rahul.sharma@example.com).
    3. Fallback to Rohan Mehta or any host user.
    """
    if host_id is not None:
        host = db.query(User).filter(User.id == host_id).first()
        if host:
            return host

    host = db.query(User).filter(User.email == "rahul.sharma@example.com").first()
    if not host:
        host = db.query(User).filter(User.email == "rohan.mehta@example.com").first()
    if not host:
        host = db.query(User).filter(User.role.in_(["host", "both"])).first()
    if not host:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No active host found.")
    return host

@router.get("/dashboard")
def get_host_dashboard(
    db: Session = Depends(get_db),
    current_host: User = Depends(get_current_host),
):
    """
    Returns analytics metrics and recent guest bookings for the host dashboard.
    """
    # 1. Host listings
    host_listings = db.query(Listing).filter(Listing.host_id == current_host.id).all()
    host_listing_ids = [l.id for l in host_listings]
    active_count = len(host_listings)

    # 2. Average rating
    if host_listings:
        avg_rating = round(sum(l.rating for l in host_listings) / active_count, 2)
    else:
        avg_rating = 5.0

    # 3. Confirmed bookings on host's properties
    confirmed_bookings = (
        db.query(Booking)
        .filter(
            Booking.listing_id.in_(host_listing_ids),
            Booking.status == "confirmed",
        )
        .all()
    ) if host_listing_ids else []

    total_revenue = sum(b.total_price for b in confirmed_bookings)
    total_reservations = len(confirmed_bookings)

    # 4. Recent reservations formatting
    recent_reservations = []
    for b in sorted(confirmed_bookings, key=lambda x: x.created_at, reverse=True)[:10]:
        recent_reservations.append({
            "id": b.id,
            "listing_id": b.listing_id,
            "listing_title": b.listing.title if b.listing else "Listing",
            "listing_city": b.listing.city if b.listing else "",
            "guest_name": b.guest.name if b.guest else "Guest",
            "guest_avatar": b.guest.avatar_url if b.guest else None,
            "check_in_date": b.check_in_date.isoformat(),
            "check_out_date": b.check_out_date.isoformat(),
            "total_guests": b.total_guests,
            "total_price": b.total_price,
            "status": b.status,
            "created_at": b.created_at.isoformat(),
        })

    return {
        "host": {
            "id": current_host.id,
            "name": current_host.name,
            "email": current_host.email,
            "avatar_url": current_host.avatar_url,
            "is_superhost": current_host.is_superhost,
        },
        "metrics": {
            "total_revenue": total_revenue,
            "active_listings_count": active_count,
            "total_reservations_count": total_reservations,
            "average_rating": avg_rating,
        },
        "recent_reservations": recent_reservations,
    }

@router.get("/listings", response_model=list[ListingResponse])
def get_host_listings(
    db: Session = Depends(get_db),
    current_host: User = Depends(get_current_host),
):
    """
    Returns all listings owned by the active host, including live bookings count per property.
    """
    listings = (
        db.query(Listing)
        .filter(Listing.host_id == current_host.id)
        .order_by(Listing.created_at.desc())
        .all()
    )

    result = []
    for l in listings:
        b_count = (
            db.query(Booking)
            .filter(Booking.listing_id == l.id, Booking.status == "confirmed")
            .count()
        )
        item = ListingResponse.model_validate(l)
        item.bookings_count = b_count
        result.append(item)

    return result
