from datetime import date
from app.models import Listing
from app.schemas.booking import PriceCalculationResponse

def calculate_stay_price(
    listing: Listing,
    check_in: date,
    check_out: date,
    is_available: bool = True,
    conflict_message: str | None = None,
) -> PriceCalculationResponse:
    """
    Computes Airbnb itemized price breakdown:
    - Base price (nights * nightly_rate)
    - Cleaning fee
    - Airbnb service fee (14% of base price)
    - Total before taxes
    """
    if check_in >= check_out:
        return PriceCalculationResponse(
            listing_id=listing.id,
            nightly_rate=listing.price_per_night,
            total_nights=0,
            base_price=0,
            cleaning_fee=listing.cleaning_fee,
            service_fee=0,
            total_price=0,
            is_available=False,
            message="Check-out date must be after check-in date.",
        )

    nights = (check_out - check_in).days
    base_price = nights * listing.price_per_night
    cleaning_fee = listing.cleaning_fee
    service_fee = int(base_price * (listing.service_fee_rate or 0.14))
    total_price = base_price + cleaning_fee + service_fee

    return PriceCalculationResponse(
        listing_id=listing.id,
        nightly_rate=listing.price_per_night,
        total_nights=nights,
        base_price=base_price,
        cleaning_fee=cleaning_fee,
        service_fee=service_fee,
        total_price=total_price,
        is_available=is_available,
        message=conflict_message,
    )
