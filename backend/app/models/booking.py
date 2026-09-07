from datetime import datetime, timezone, date
from sqlalchemy import Column, Integer, String, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

def utc_now():
    return datetime.now(timezone.utc)

class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(Integer, ForeignKey("listings.id", ondelete="CASCADE"), nullable=False, index=True)
    guest_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Stay Dates
    check_in_date = Column(Date, nullable=False, index=True)
    check_out_date = Column(Date, nullable=False, index=True)
    
    # Guests breakdown
    total_guests = Column(Integer, default=1)
    adults = Column(Integer, default=1)
    children = Column(Integer, default=0)
    infants = Column(Integer, default=0)
    
    # Financial breakdown
    nightly_rate = Column(Integer, nullable=False)
    total_nights = Column(Integer, nullable=False)
    cleaning_fee = Column(Integer, default=50)
    service_fee = Column(Integer, default=0)
    total_price = Column(Integer, nullable=False)
    
    # Status & Payment
    status = Column(String(30), default="confirmed", index=True)  # "confirmed", "cancelled", "completed"
    payment_method = Column(String(50), default="Credit Card (Mock)")
    payment_status = Column(String(30), default="paid")
    created_at = Column(DateTime, default=utc_now)

    # Relationships
    listing = relationship("Listing", back_populates="bookings")
    guest = relationship("User", back_populates="bookings")

    def __repr__(self):
        return f"<Booking id={self.id} listing_id={self.listing_id} check_in={self.check_in_date} check_out={self.check_out_date} status='{self.status}'>"
