from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class ListingImage(Base):
    __tablename__ = "listing_images"

    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(Integer, ForeignKey("listings.id", ondelete="CASCADE"), nullable=False, index=True)
    image_url = Column(String(1000), nullable=False)
    caption = Column(String(200), nullable=True)
    display_order = Column(Integer, default=0)
    is_cover = Column(Boolean, default=False)

    # Relationships
    listing = relationship("Listing", back_populates="images")

    def __repr__(self):
        return f"<ListingImage id={self.id} listing_id={self.listing_id} is_cover={self.is_cover}>"
