from datetime import date, timedelta
from app.core.database import SessionLocal
from app.models import Listing, Booking, User
from app.services.pricing_service import calculate_stay_price
from app.services.availability_service import has_date_conflict, get_booked_dates_for_listing
from app.services.listing_service import search_listings

def test_pricing_calculation():
    """Verify exact formula for nights, base price, cleaning fee, 14% service fee and total."""
    db = SessionLocal()
    try:
        listing = db.query(Listing).first()
        check_in = date(2026, 11, 1)
        check_out = date(2026, 11, 6)  # 5 nights

        calc = calculate_stay_price(listing, check_in, check_out)

        assert calc.total_nights == 5
        assert calc.base_price == 5 * listing.price_per_night
        assert calc.cleaning_fee == listing.cleaning_fee
        expected_service_fee = int(calc.base_price * 0.14)
        assert calc.service_fee == expected_service_fee
        assert calc.total_price == calc.base_price + calc.cleaning_fee + expected_service_fee
        assert calc.is_available is True
    finally:
        db.close()

def test_invalid_dates_pricing():
    """Verify that checkout before or on check-in returns invalid calculation."""
    db = SessionLocal()
    try:
        listing = db.query(Listing).first()
        calc = calculate_stay_price(listing, date(2026, 11, 5), date(2026, 11, 5))
        assert calc.is_available is False
        assert calc.total_nights == 0
    finally:
        db.close()

def test_date_conflict_detection():
    """Verify collision algorithm detects overlapping bookings correctly."""
    db = SessionLocal()
    try:
        listing = db.query(Listing).first()
        guest = db.query(User).filter(User.role == "guest").first()

        # Existing booking: Nov 10 to Nov 15
        start = date(2026, 11, 10)
        end = date(2026, 11, 15)

        test_booking = Booking(
            listing_id=listing.id,
            guest_id=guest.id,
            check_in_date=start,
            check_out_date=end,
            total_guests=2,
            nightly_rate=listing.price_per_night,
            total_nights=5,
            cleaning_fee=listing.cleaning_fee,
            service_fee=100,
            total_price=1000,
            status="confirmed",
        )
        db.add(test_booking)
        db.commit()

        # Case 1: Exact same dates -> Conflict
        assert has_date_conflict(db, listing.id, start, end) is True

        # Case 2: Overlapping start (Nov 8 to Nov 12) -> Conflict
        assert has_date_conflict(db, listing.id, date(2026, 11, 8), date(2026, 11, 12)) is True

        # Case 3: Overlapping end (Nov 12 to Nov 18) -> Conflict
        assert has_date_conflict(db, listing.id, date(2026, 11, 12), date(2026, 11, 18)) is True

        # Case 4: Completely inside (Nov 11 to Nov 13) -> Conflict
        assert has_date_conflict(db, listing.id, date(2026, 11, 11), date(2026, 11, 13)) is True

        # Case 5: Before (Nov 1 to Nov 10) -> NO Conflict (Nov 10 morning is checkout)
        assert has_date_conflict(db, listing.id, date(2026, 11, 1), date(2026, 11, 10)) is False

        # Case 6: After (Nov 15 to Nov 20) -> NO Conflict (Nov 15 afternoon is check-in)
        assert has_date_conflict(db, listing.id, date(2026, 11, 15), date(2026, 11, 20)) is False

        # Clean up test booking
        db.delete(test_booking)
        db.commit()
    finally:
        db.close()

def test_search_listings_filters():
    """Verify search service filters by category, destination, and price."""
    db = SessionLocal()
    try:
        # Search Beachfront
        beach_listings, total = search_listings(db, category="Beachfront")
        assert total > 0
        for l in beach_listings:
            assert l.category == "Beachfront"

        # Search destination: "Jaipur"
        jaipur_listings, total_jaipur = search_listings(db, destination="Jaipur")
        assert total_jaipur >= 1
        assert any("Jaipur" in l.city for l in jaipur_listings)

        # Search price cap: max ₹8,000
        budget_listings, _ = search_listings(db, max_price=8000)
        for l in budget_listings:
            assert l.price_per_night <= 8000
    finally:
        db.close()
