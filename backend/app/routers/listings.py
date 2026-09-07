from datetime import date
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models import Listing, ListingImage, Amenity, User
from app.schemas.listing import (
    ListingResponse,
    ListingDetailResponse,
    ListingCreate,
    ListingUpdate,
)
from app.schemas.amenity import AmenityResponse
from app.schemas.category import CategoryItem
from app.services.listing_service import search_listings
from app.services.availability_service import get_booked_dates_for_listing

router = APIRouter(tags=["Listings"])

def get_current_host(db: Session = Depends(get_db)) -> User:
    """
    Returns the active demo host user (Rohan Mehta).
    In production, this would be derived from JWT token claims.
    """
    host = db.query(User).filter(User.email == "rohan.mehta@example.com").first()
    if not host:
        host = db.query(User).filter(User.role.in_(["host", "both"])).first()
    if not host:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No active host user found.")
    return host

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
    min_price: int | None = Query(None, ge=0, description="Minimum price per night (INR)"),
    max_price: int | None = Query(None, ge=0, description="Maximum price per night (INR)"),
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
    listings, total_count, is_nearby, search_location, message = search_listings(
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
        "is_nearby": is_nearby,
        "search_location": search_location,
        "message": message,
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

    booked_dates = get_booked_dates_for_listing(db, listing_id)
    detail_data = ListingDetailResponse.model_validate(listing)
    detail_data.booked_dates = booked_dates

    return detail_data

# --- HOST CRUD OPERATIONS ---

@router.post("/listings", response_model=ListingDetailResponse, status_code=status.HTTP_201_CREATED)
def create_listing(
    payload: ListingCreate,
    db: Session = Depends(get_db),
    current_host: User = Depends(get_current_host),
):
    """
    Create a new listing as a host (Full Host CRUD).
    """
    new_listing = Listing(
        host_id=current_host.id,
        title=payload.title,
        description=payload.description,
        property_type=payload.property_type,
        category=payload.category,
        room_type=payload.room_type,
        address=payload.address,
        city=payload.city,
        state=payload.state,
        country=payload.country,
        latitude=payload.latitude,
        longitude=payload.longitude,
        price_per_night=payload.price_per_night,
        cleaning_fee=payload.cleaning_fee,
        max_guests=payload.max_guests,
        bedrooms=payload.bedrooms,
        beds=payload.beds,
        bathrooms=payload.bathrooms,
        rating=5.0,  # New listing default
        review_count=0,
    )

    # Attach amenities
    if payload.amenity_ids:
        amenities = db.query(Amenity).filter(Amenity.id.in_(payload.amenity_ids)).all()
        new_listing.amenities = amenities

    db.add(new_listing)
    db.flush()

    # Add images
    if payload.image_urls:
        for idx, url in enumerate(payload.image_urls):
            img = ListingImage(
                listing_id=new_listing.id,
                image_url=url,
                display_order=idx + 1,
                is_cover=(idx == 0),
            )
            db.add(img)

    db.commit()
    db.refresh(new_listing)

    detail_data = ListingDetailResponse.model_validate(new_listing)
    detail_data.booked_dates = []
    return detail_data

@router.put("/listings/{listing_id}", response_model=ListingDetailResponse)
def update_listing(
    listing_id: int,
    payload: ListingUpdate,
    db: Session = Depends(get_db),
    current_host: User = Depends(get_current_host),
):
    """
    Update an existing listing (Full Host CRUD).
    """
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found.")

    if listing.host_id != current_host.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to modify this listing.",
        )

    # Update simple fields
    update_data = payload.model_dump(exclude_unset=True, exclude={"amenity_ids", "image_urls"})
    for field, val in update_data.items():
        setattr(listing, field, val)

    # Update amenities if provided
    if payload.amenity_ids is not None:
        amenities = db.query(Amenity).filter(Amenity.id.in_(payload.amenity_ids)).all()
        listing.amenities = amenities

    # Update images if provided
    if payload.image_urls is not None:
        db.query(ListingImage).filter(ListingImage.listing_id == listing.id).delete()
        for idx, url in enumerate(payload.image_urls):
            img = ListingImage(
                listing_id=listing.id,
                image_url=url,
                display_order=idx + 1,
                is_cover=(idx == 0),
            )
            db.add(img)

    db.commit()
    db.refresh(listing)

    booked_dates = get_booked_dates_for_listing(db, listing.id)
    detail_data = ListingDetailResponse.model_validate(listing)
    detail_data.booked_dates = booked_dates
    return detail_data

@router.delete("/listings/{listing_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_listing(
    listing_id: int,
    db: Session = Depends(get_db),
    current_host: User = Depends(get_current_host),
):
    """
    Delete a listing (Full Host CRUD) with cascade cleanup.
    """
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found.")

    if listing.host_id != current_host.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to delete this listing.",
        )

    db.delete(listing)
    db.commit()
    return None
