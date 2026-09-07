from datetime import datetime
from pydantic import BaseModel, EmailStr, ConfigDict

class UserBase(BaseModel):
    name: str
    email: EmailStr
    avatar_url: str | None = None
    is_superhost: bool = False
    role: str = "guest"

class UserCreate(UserBase):
    pass

class UserResponse(UserBase):
    id: int
    joined_date: datetime

    model_config = ConfigDict(from_attributes=True)
