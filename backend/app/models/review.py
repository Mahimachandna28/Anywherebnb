from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

def utc_now():
    return datetime.now(timezone.utc)

class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(Integer, ForeignKey("listings.id", ondelete="CASCADE"), nullable=False, index=True)
    guest_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Overall score & 6 Airbnb category sub-ratings (1 to 5)
    rating = Column(Float, nullable=False)
    cleanliness = Column(Integer, default=5)
    accuracy = Column(Integer, default=5)
    communication = Column(Integer, default=5)
    location = Column(Integer, default=5)
    check_in = Column(Integer, default=5)
    value = Column(Integer, default=5)
    
    comment = Column(Text, nullable=False)
    created_at = Column(DateTime, default=utc_now)

    # Relationships
    listing = relationship("Listing", back_populates="reviews")
    guest = relationship("User", back_populates="reviews")

    def __repr__(self):
        return f"<Review id={self.id} listing_id={self.listing_id} rating={self.rating}>"
