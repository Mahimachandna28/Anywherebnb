from datetime import date, datetime
from pydantic import BaseModel, Field, ConfigDict
from app.schemas.listing import ListingResponse
from app.schemas.user import UserResponse

class BookingCreate(BaseModel):
    listing_id: int
    guest_id: int | None = None
    check_in_date: date
    check_out_date: date
    total_guests: int = Field(1, gt=0)
    adults: int = Field(1, gt=0)
    children: int = Field(0, ge=0)
    infants: int = Field(0, ge=0)
    payment_method: str = "Credit Card (Mock)"

class PriceCalculationRequest(BaseModel):
    listing_id: int
    check_in_date: date
    check_out_date: date
    total_guests: int = 1

class PriceCalculationResponse(BaseModel):
    listing_id: int
    nightly_rate: int
    total_nights: int
    base_price: int
    cleaning_fee: int
    service_fee: int
    total_price: int
    is_available: bool = True
    message: str | None = None

class BookingResponse(BaseModel):
    id: int
    listing_id: int
    guest_id: int
    check_in_date: date
    check_out_date: date
    total_guests: int
    adults: int
    children: int
    infants: int
    nightly_rate: int
    total_nights: int
    cleaning_fee: int
    service_fee: int
    total_price: int
    status: str
    payment_method: str
    payment_status: str
    created_at: datetime
    listing: ListingResponse | None = None
    guest: UserResponse | None = None

    model_config = ConfigDict(from_attributes=True)
