from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict
from app.schemas.user import UserResponse

class ReviewBase(BaseModel):
    rating: float = Field(..., ge=1.0, le=5.0)
    cleanliness: int = Field(5, ge=1, le=5)
    accuracy: int = Field(5, ge=1, le=5)
    communication: int = Field(5, ge=1, le=5)
    location: int = Field(5, ge=1, le=5)
    check_in: int = Field(5, ge=1, le=5)
    value: int = Field(5, ge=1, le=5)
    comment: str = Field(..., min_length=5)

class ReviewCreate(ReviewBase):
    listing_id: int

class ReviewResponse(ReviewBase):
    id: int
    listing_id: int
    guest_id: int
    guest: UserResponse | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
