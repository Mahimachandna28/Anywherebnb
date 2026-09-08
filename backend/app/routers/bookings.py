from datetime import date
from fastapi import APIRouter, Depends, Header, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models import Booking, Listing, User
from app.schemas.booking import (
    BookingCreate,
    BookingResponse,
    PriceCalculationRequest,
    PriceCalculationResponse,
)
from app.services.availability_service import has_date_conflict
from app.services.pricing_service import calculate_stay_price

router = APIRouter(prefix="/bookings", tags=["Bookings"])

def get_current_guest(
    x_user_id: int | None = Header(None, alias="X-User-Id"),
    x_user_email: str | None = Header(None, alias="X-User-Email"),
    authorization: str | None = Header(None),
    db: Session = Depends(get_db),
) -> User:
    """
    Enforces authentication on booking endpoints.
    Requires a valid user session via X-User-Id, X-User-Email, or Authorization header.
    Rejects unauthenticated requests with HTTP 401 Unauthorized.
    """
    if x_user_id is not None:
        user = db.query(User).filter(User.id == x_user_id).first()
        if user:
            return user
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user session. Please log in again.",
        )

    if x_user_email is not None and x_user_email.strip():
        user = db.query(User).filter(User.email == x_user_email.strip().lower()).first()
        if user:
            return user
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user session. Please log in again.",
        )

    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ", 1)[1].strip()
        if token.isdigit():
            user = db.query(User).filter(User.id == int(token)).first()
            if user:
                return user
        elif "@" in token:
            user = db.query(User).filter(User.email == token.lower()).first()
            if user:
                return user
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization token. Please log in again.",
        )

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Authentication required. Please log in to complete your reservation.",
    )

@router.post("/calculate-price", response_model=PriceCalculationResponse)
def calculate_price(
    payload: PriceCalculationRequest,
    db: Session = Depends(get_db),
):
    """
    Calculates live itemized price breakdown (nights, base, cleaning, service fee, total)
    and checks if the listing is available for the requested dates.
    """
    listing = db.query(Listing).filter(Listing.id == payload.listing_id).first()
    if not listing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found.")

    if payload.check_in_date >= payload.check_out_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Check-out date must be after check-in date.",
        )

    # Check for overlapping reservation
    is_conflict = has_date_conflict(db, payload.listing_id, payload.check_in_date, payload.check_out_date)
    conflict_msg = "Selected dates are already booked. Please choose different dates." if is_conflict else None

    return calculate_stay_price(
        listing=listing,
        check_in=payload.check_in_date,
        check_out=payload.check_out_date,
        is_available=not is_conflict,
        conflict_message=conflict_msg,
    )

@router.post("", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
def create_booking(
    payload: BookingCreate,
    db: Session = Depends(get_db),
    current_guest: User = Depends(get_current_guest),
):
    """
    Creates a new confirmed booking with strict double-booking prevention.
    Rejects overlapping reservations with HTTP 400 Bad Request.
    """
    listing = db.query(Listing).filter(Listing.id == payload.listing_id).first()
    if not listing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found.")

    # Validation: date range
    if payload.check_in_date >= payload.check_out_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Check-out date must be strictly after check-in date.",
        )

    if payload.check_in_date < date(2024, 1, 1):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot book dates before 2024.",
        )

    # Validation: capacity
    if payload.total_guests > listing.max_guests:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"This property accommodates a maximum of {listing.max_guests} guests.",
        )

    # Validation: STRICT collision check
    if has_date_conflict(db, payload.listing_id, payload.check_in_date, payload.check_out_date):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="These dates are no longer available. Another guest has already reserved them.",
        )

    # Resolve target guest strictly from authenticated user session
    guest_id = current_guest.id

    # Calculate itemized fees
    calc = calculate_stay_price(listing, payload.check_in_date, payload.check_out_date)

    booking = Booking(
        listing_id=listing.id,
        guest_id=guest_id,
        check_in_date=payload.check_in_date,
        check_out_date=payload.check_out_date,
        total_guests=payload.total_guests,
        adults=payload.adults,
        children=payload.children,
        infants=payload.infants,
        nightly_rate=listing.price_per_night,
        total_nights=calc.total_nights,
        cleaning_fee=calc.cleaning_fee,
        service_fee=calc.service_fee,
        total_price=calc.total_price,
        payment_method=payload.payment_method or "Credit Card (Mock)",
        payment_status="paid",
        status="confirmed",
    )

    db.add(booking)
    db.commit()
    db.refresh(booking)

    return booking

@router.get("/my-trips", response_model=list[BookingResponse])
def get_my_trips(
    guest_id: int | None = Query(None, description="Optional guest id for account-isolated trips"),
    status_filter: str | None = Query(None, description="Filter by status: confirmed, completed, cancelled"),
    x_user_id: int | None = Header(None, alias="X-User-Id"),
    db: Session = Depends(get_db),
):
    """
    Retrieves all reservations booked by the current user.
    """
    target_id = guest_id or x_user_id
    if not target_id:
        demo = db.query(User).filter(User.email == "aarav.patel@example.com").first()
        target_id = demo.id if demo else None

    if not target_id:
        return []

    query = db.query(Booking).filter(Booking.guest_id == target_id)

    if status_filter and status_filter.lower() != "all":
        query = query.filter(Booking.status == status_filter.lower())

    bookings = query.order_by(Booking.check_in_date.desc()).all()
    return bookings

@router.post("/{booking_id}/cancel", response_model=BookingResponse)
def cancel_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_guest: User = Depends(get_current_guest),
):
    """
    Cancels a confirmed reservation and immediately releases the calendar dates.
    """
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found.")

    if booking.guest_id != current_guest.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to cancel this booking.",
        )

    if booking.status == "cancelled":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This reservation is already cancelled.",
        )

    booking.status = "cancelled"
    db.commit()
    db.refresh(booking)

    return booking
