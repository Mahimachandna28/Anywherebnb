from sqlalchemy import Column, Integer, String, ForeignKey, Table
from sqlalchemy.orm import relationship
from app.core.database import Base

# Many-to-Many association table between listings and amenities
listing_amenities = Table(
    "listing_amenities",
    Base.metadata,
    Column("listing_id", Integer, ForeignKey("listings.id", ondelete="CASCADE"), primary_key=True),
    Column("amenity_id", Integer, ForeignKey("amenities.id", ondelete="CASCADE"), primary_key=True),
)

class Amenity(Base):
    __tablename__ = "amenities"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    icon = Column(String(50), nullable=False)  # Lucide icon identifier (e.g. "wifi", "tv", "pool")
    category = Column(String(50), default="Essentials")  # "Essentials", "Features", "Safety", "Location"

    # Relationships
    listings = relationship("Listing", secondary=listing_amenities, back_populates="amenities")

    def __repr__(self):
        return f"<Amenity id={self.id} name='{self.name}'>"
