from datetime import date
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models import Listing, Amenity
from app.schemas.listing import ListingResponse, ListingDetailResponse
from app.schemas.amenity import AmenityResponse
from app.schemas.category import CategoryItem
from app.services.listing_service import search_listings
from app.services.availability_service import get_booked_dates_for_listing

router = APIRouter(tags=["Listings"])

# Static metadata for Airbnb categories
CATEGORIES_LIST: list[CategoryItem] = [
    CategoryItem(id="all", label="All Homes", icon="Home", description="Explore all vacation stays"),
    CategoryItem(id="Beachfront", label="Beachfront", icon="Waves", description="Properties steps away from the ocean"),
    CategoryItem(id="Cabins", label="Cabins", icon="Trees", description="Cozy rustic escapes in the woods"),
    CategoryItem(id="Amazing pools", label="Amazing pools", icon="Sparkles", description="Stunning private and infinity pools"),
    CategoryItem(id="Mansions", label="Mansions", icon="Castle", description="Ultra-luxurious historic estates and penthouses"),
    CategoryItem(id="Lakefront", label="Lakefront", icon="Anchor", description="Serene waterfront stays on world-famous lakes"),
    CategoryItem(id="Tiny homes", label="Tiny homes", icon="Warehouse", description="Unique micro-architectural gems"),
    CategoryItem(id="Countryside", label="Countryside", icon="Sun", description="Rolling hills, vineyards, and farm estates"),
    CategoryItem(id="Skiing", label="Skiing", icon="Snowflake", description="Ski-in and ski-out mountain access"),
    CategoryItem(id="Tropical", label="Tropical", icon="Palmtree", description="Lush jungle sanctuaries and bamboo villas"),
    CategoryItem(id="Trending", label="Trending", icon="Flame", description="Most popular architectural masterpieces"),
]

@router.get("/categories", response_model=list[CategoryItem])
def get_categories():
    """Returns the list of curated Airbnb categories."""
    return CATEGORIES_LIST

@router.get("/amenities", response_model=list[AmenityResponse])
def get_amenities(db: Session = Depends(get_db)):
    """Returns all available listing amenities."""
    return db.query(Amenity).order_by(Amenity.category, Amenity.name).all()

@router.get("/listings", response_model=dict)
def get_listings(
    destination: str | None = Query(None, description="City, country, or keyword search"),
    category: str | None = Query(None, description="Listing category filter"),
    property_type: str | None = Query(None, description="House, Apartment, Villa, etc."),
    min_price: int | None = Query(None, ge=0, description="Minimum price per night (USD)"),
    max_price: int | None = Query(None, ge=0, description="Maximum price per night (USD)"),
    guests: int | None = Query(None, ge=1, description="Minimum guest capacity"),
    bedrooms: int | None = Query(None, ge=0, description="Minimum bedrooms"),
    bathrooms: float | None = Query(None, ge=0, description="Minimum bathrooms"),
    amenities: list[int] | None = Query(None, description="Amenity ID filters"),
    check_in: date | None = Query(None, description="Desired check-in date"),
    check_out: date | None = Query(None, description="Desired check-out date"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """
    Search and filter listings across multiple criteria with pagination.
    """
    listings, total_count = search_listings(
        db=db,
        destination=destination,
        category=category,
        property_type=property_type,
        min_price=min_price,
        max_price=max_price,
        guests=guests,
        bedrooms=bedrooms,
        bathrooms=bathrooms,
        amenity_ids=amenities,
        check_in=check_in,
        check_out=check_out,
        skip=skip,
        limit=limit,
    )

    items = [ListingResponse.model_validate(l) for l in listings]

    return {
        "items": items,
        "total": total_count,
        "skip": skip,
        "limit": limit,
    }

@router.get("/listings/{listing_id}", response_model=ListingDetailResponse)
def get_listing_detail(listing_id: int, db: Session = Depends(get_db)):
    """
    Retrieve full listing details including photos, amenities, host, reviews,
    and a list of all already-booked dates for calendar disabling.
    """
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Listing with id {listing_id} not found.",
        )

    # Calculate booked dates for the calendar
    booked_dates = get_booked_dates_for_listing(db, listing_id)

    # Validate into detailed Pydantic response
    detail_data = ListingDetailResponse.model_validate(listing)
    detail_data.booked_dates = booked_dates

    return detail_data
