from pydantic import BaseModel

class CategoryItem(BaseModel):
    id: str
    label: str
    icon: str
    description: str | None = None
