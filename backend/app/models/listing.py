from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.amenity import listing_amenities

def utc_now():
    return datetime.now(timezone.utc)

class Listing(Base):
    __tablename__ = "listings"

    id = Column(Integer, primary_key=True, index=True)
    host_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Overview
    title = Column(String(200), nullable=False, index=True)
    description = Column(Text, nullable=False)
    property_type = Column(String(50), nullable=False)  # "House", "Apartment", "Villa", "Cabin", "Guesthouse", "Loft"
    category = Column(String(50), nullable=False, index=True)  # "Beachfront", "Cabins", "Amazing pools", "Mansions", "Lakefront", "Tiny homes", "Countryside", "Skiing", "Tropical", "Trending"
    room_type = Column(String(50), default="Entire place")  # "Entire place", "Private room", "Shared room"
    
    # Location
    address = Column(String(255), nullable=False)
    city = Column(String(100), nullable=False, index=True)
    state = Column(String(100), nullable=True)
    country = Column(String(100), nullable=False, index=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    
    # Pricing & Capacity
    price_per_night = Column(Integer, nullable=False, index=True)  # USD
    cleaning_fee = Column(Integer, default=50)  # USD
    service_fee_rate = Column(Float, default=0.14)  # 14% platform service fee
    max_guests = Column(Integer, default=2)
    bedrooms = Column(Integer, default=1)
    beds = Column(Integer, default=1)
    bathrooms = Column(Float, default=1.0)
    
    # Aggregated Stats
    rating = Column(Float, default=4.95)
    review_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=utc_now)

    # Relationships
    host = relationship("User", back_populates="listings")
    images = relationship("ListingImage", back_populates="listing", cascade="all, delete-orphan", order_by="ListingImage.display_order")
    amenities = relationship("Amenity", secondary=listing_amenities, back_populates="listings")
    bookings = relationship("Booking", back_populates="listing", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="listing", cascade="all, delete-orphan")
    wishlists = relationship("Wishlist", back_populates="listing", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Listing id={self.id} title='{self.title}' city='{self.city}' price={self.price_per_night}>"
