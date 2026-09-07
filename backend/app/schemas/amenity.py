from pydantic import BaseModel, ConfigDict

class AmenityBase(BaseModel):
    name: str
    icon: str
    category: str = "Essentials"

class AmenityCreate(AmenityBase):
    pass

class AmenityResponse(AmenityBase):
    id: int

    model_config = ConfigDict(from_attributes=True)
