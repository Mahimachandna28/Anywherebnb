from datetime import date
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from app.models import Listing, Booking, Amenity

def search_listings(
    db: Session,
    destination: str | None = None,
    category: str | None = None,
    property_type: str | None = None,
    min_price: int | None = None,
    max_price: int | None = None,
    guests: int | None = None,
    bedrooms: int | None = None,
    bathrooms: float | None = None,
    amenity_ids: list[int] | None = None,
    check_in: date | None = None,
    check_out: date | None = None,
    skip: int = 0,
    limit: int = 50,
) -> tuple[list[Listing], int]:
    """
    Builds a flexible SQLAlchemy query filtering listings by destination,
    category, price range, guest/bed counts, amenities, and date availability.
    Returns (listings, total_count).
    """
    query = db.query(Listing)

    # 1. Text search across city, state, country, or title
    if destination and destination.strip():
        term = f"%{destination.strip()}%"
        query = query.filter(
            or_(
                Listing.city.ilike(term),
                Listing.state.ilike(term),
                Listing.country.ilike(term),
                Listing.title.ilike(term),
                Listing.address.ilike(term),
            )
        )

    # 2. Category filter
    if category and category.strip() and category.lower() != "all":
        query = query.filter(Listing.category.ilike(category.strip()))

    # 3. Property type filter
    if property_type and property_type.strip() and property_type.lower() != "any":
        query = query.filter(Listing.property_type.ilike(property_type.strip()))

    # 4. Price range
    if min_price is not None:
        query = query.filter(Listing.price_per_night >= min_price)
    if max_price is not None:
        query = query.filter(Listing.price_per_night <= max_price)

    # 5. Capacities
    if guests is not None and guests > 0:
        query = query.filter(Listing.max_guests >= guests)
    if bedrooms is not None and bedrooms > 0:
        query = query.filter(Listing.bedrooms >= bedrooms)
    if bathrooms is not None and bathrooms > 0:
        query = query.filter(Listing.bathrooms >= bathrooms)

    # 6. Specific Amenities filter
    if amenity_ids:
        for a_id in amenity_ids:
            query = query.filter(Listing.amenities.any(Amenity.id == a_id))

    # 7. Date availability filter
    # Exclude listings that have a confirmed booking overlapping [check_in, check_out]
    if check_in and check_out and check_in < check_out:
        conflict_subquery = (
            db.query(Booking.listing_id)
            .filter(
                Booking.status == "confirmed",
                Booking.check_in_date < check_out,
                Booking.check_out_date > check_in,
            )
            .subquery()
        )
        query = query.filter(Listing.id.not_in(conflict_subquery))

    total_count = query.count()
    listings = query.order_by(Listing.rating.desc(), Listing.id.asc()).offset(skip).limit(limit).all()

    return listings, total_count
