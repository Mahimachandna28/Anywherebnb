from app.core.database import SessionLocal
from app.models import User, Listing, Amenity, Booking, Review, Wishlist

def test_database_has_seeded_data():
    """Verify that the database has been properly populated with seed data."""
    db = SessionLocal()
    try:
        users = db.query(User).all()
        assert len(users) >= 4, "Expected at least 4 users in seeded database"

        listings = db.query(Listing).all()
        assert len(listings) >= 16, "Expected at least 16 listings in seeded database"

        amenities = db.query(Amenity).all()
        assert len(amenities) >= 20, "Expected at least 20 amenities in seeded database"

        bookings = db.query(Booking).all()
        assert len(bookings) >= 3, "Expected pre-existing test bookings"

        reviews = db.query(Review).all()
        assert len(reviews) >= 4, "Expected sample reviews"

        # Verify a listing has photos and amenities associated
        first_listing = listings[0]
        assert len(first_listing.images) >= 5, "Expected at least 5 photos for 5-photo collage"
        assert len(first_listing.amenities) >= 1, "Expected amenities linked to listing"
        assert first_listing.host is not None, "Expected host associated with listing"
    finally:
        db.close()
