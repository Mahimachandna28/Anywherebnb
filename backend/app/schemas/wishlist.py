from datetime import datetime
from pydantic import BaseModel, ConfigDict
from app.schemas.listing import ListingResponse

class WishlistToggleRequest(BaseModel):
    listing_id: int

class WishlistToggleResponse(BaseModel):
    listing_id: int
    is_favorited: bool
    message: str

class WishlistResponse(BaseModel):
    id: int
    user_id: int
    listing_id: int
    listing: ListingResponse | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
