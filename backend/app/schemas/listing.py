from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict
from app.schemas.user import UserResponse
from app.schemas.amenity import AmenityResponse
from app.schemas.review import ReviewResponse

class ListingImageBase(BaseModel):
    image_url: str
    caption: str | None = None
    display_order: int = 0
    is_cover: bool = False

class ListingImageCreate(ListingImageBase):
    pass

class ListingImageResponse(ListingImageBase):
    id: int
    listing_id: int

    model_config = ConfigDict(from_attributes=True)

class ListingBase(BaseModel):
    title: str = Field(..., min_length=3, max_length=200)
    description: str = Field(..., min_length=10)
    property_type: str = "House"
    category: str = "Beachfront"
    room_type: str = "Entire place"
    address: str
    city: str
    state: str | None = None
    country: str
    latitude: float | None = None
    longitude: float | None = None
    price_per_night: int = Field(..., gt=0)
    cleaning_fee: int = 50
    max_guests: int = Field(2, gt=0)
    bedrooms: int = Field(1, ge=0)
    beds: int = Field(1, gt=0)
    bathrooms: float = Field(1.0, gt=0)

class ListingCreate(ListingBase):
    amenity_ids: list[int] = []
    image_urls: list[str] = []

class ListingUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    property_type: str | None = None
    category: str | None = None
    room_type: str | None = None
    address: str | None = None
    city: str | None = None
    state: str | None = None
    country: str | None = None
    price_per_night: int | None = None
    cleaning_fee: int | None = None
    max_guests: int | None = None
    bedrooms: int | None = None
    beds: int | None = None
    bathrooms: float | None = None
    amenity_ids: list[int] | None = None
    image_urls: list[str] | None = None

# Compact representation for Explore Grid Cards
class ListingResponse(BaseModel):
    id: int
    host_id: int
    title: str
    property_type: str
    category: str
    room_type: str
    city: str
    country: str
    price_per_night: int
    cleaning_fee: int
    max_guests: int
    bedrooms: int
    beds: int
    bathrooms: float
    rating: float
    review_count: int
    bookings_count: int = 0
    images: list[ListingImageResponse] = []
    amenities: list[AmenityResponse] = []

    model_config = ConfigDict(from_attributes=True)

# Full detailed representation for Listing Details Page
class ListingDetailResponse(ListingResponse):
    description: str
    address: str
    state: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    service_fee_rate: float
    created_at: datetime
    host: UserResponse | None = None
    reviews: list[ReviewResponse] = []
    booked_dates: list[str] = []  # ISO date strings of unavailable dates

    model_config = ConfigDict(from_attributes=True)
