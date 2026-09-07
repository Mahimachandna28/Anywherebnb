import pytest
from datetime import date, datetime
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.database import Base
from app.models import User, Listing, ListingImage, Amenity, Booking, Review, Wishlist

# Use an in-memory SQLite database for testing models
TEST_DATABASE_URL = "sqlite:///:memory:"

@pytest.fixture(scope="function")
def db_session():
    engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)

def test_models_creation_and_relationships(db_session):
    # 1. Create Host and Guest Users
    host = User(name="Sarah Superhost", email="sarah@example.com", is_superhost=True, role="host")
    guest = User(name="Alex Explorer", email="alex@example.com", is_superhost=False, role="guest")
    db_session.add_all([host, guest])
    db_session.commit()

    assert host.id is not None
    assert guest.id is not None

    # 2. Create Amenities
    wifi = Amenity(name="Fast Wifi", icon="wifi", category="Essentials")
    pool = Amenity(name="Infinity Pool", icon="waves", category="Features")
    db_session.add_all([wifi, pool])
    db_session.commit()

    # 3. Create Listing
    listing = Listing(
        host_id=host.id,
        title="Amalfi Coast Cliffside Villa",
        description="Panoramic ocean views with private pool.",
        property_type="Villa",
        category="Beachfront",
        room_type="Entire place",
        address="Via Panoramica 12",
        city="Positano",
        state="Salerno",
        country="Italy",
        latitude=40.6281,
        longitude=14.4850,
        price_per_night=450,
        cleaning_fee=120,
        service_fee_rate=0.14,
        max_guests=6,
        bedrooms=3,
        beds=4,
        bathrooms=2.5,
        rating=4.98,
        review_count=1,
    )
    listing.amenities.extend([wifi, pool])
    db_session.add(listing)
    db_session.commit()

    assert listing.id is not None
    assert len(listing.amenities) == 2

    # 4. Add Listing Images
    img1 = ListingImage(listing_id=listing.id, image_url="https://images.unsplash.com/photo-1", is_cover=True, display_order=1)
    img2 = ListingImage(listing_id=listing.id, image_url="https://images.unsplash.com/photo-2", is_cover=False, display_order=2)
    db_session.add_all([img1, img2])
    db_session.commit()

    assert len(listing.images) == 2

    # 5. Create Booking
    booking = Booking(
        listing_id=listing.id,
        guest_id=guest.id,
        check_in_date=date(2026, 10, 15),
        check_out_date=date(2026, 10, 20),
        total_guests=2,
        adults=2,
        children=0,
        nightly_rate=450,
        total_nights=5,
        cleaning_fee=120,
        service_fee=315,
        total_price=2685,
        status="confirmed",
        payment_method="Credit Card",
        payment_status="paid",
    )
    db_session.add(booking)
    db_session.commit()

    assert booking.id is not None
    assert booking.total_nights == 5
    assert booking.total_price == 2685

    # 6. Create Review
    review = Review(
        listing_id=listing.id,
        guest_id=guest.id,
        rating=5.0,
        cleanliness=5,
        accuracy=5,
        communication=5,
        location=5,
        check_in=5,
        value=5,
        comment="Absolutely breathtaking property! We will definitely come back.",
    )
    db_session.add(review)
    db_session.commit()

    assert review.id is not None
    assert len(listing.reviews) == 1

    # 7. Create Wishlist item
    wishlist = Wishlist(user_id=guest.id, listing_id=listing.id)
    db_session.add(wishlist)
    db_session.commit()

    assert wishlist.id is not None
    assert len(guest.wishlists) == 1
