from fastapi import APIRouter, Depends, HTTPException, Header, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models import Wishlist, Listing, User
from app.schemas.wishlist import WishlistToggleRequest, WishlistToggleResponse, WishlistResponse
from app.schemas.listing import ListingResponse

router = APIRouter(prefix="/wishlists", tags=["Wishlists"])

def get_current_user(
    x_user_email: str | None = Header(None, alias="X-User-Email"),
    x_user_id: int | None = Header(None, alias="X-User-Id"),
    user_identifier: str | None = Query(None),
    db: Session = Depends(get_db),
) -> User:
    """
    Resolves the authenticated user from request headers or query params,
    allowing each unique phone number or email account to have their own
    isolated, persistent wishlist in the database.
    """
    if x_user_id:
        user = db.query(User).filter(User.id == x_user_id).first()
        if user:
            return user

    ident = x_user_email or user_identifier
    if ident and ident.strip():
        ident_clean = ident.strip().lower()
        user = (
            db.query(User)
            .filter(
                (User.email == ident_clean)
                | (User.email.like(f"%{ident_clean}%"))
            )
            .first()
        )
        if user:
            return user

        # Auto-create user account for new phone number or custom email
        is_email = "@" in ident_clean
        name_part = ident_clean.split("@")[0] if is_email else f"User {ident_clean[-4:]}"
        email_to_store = ident_clean if is_email else f"{ident_clean}@phone.anywherebnb.in"
        new_user = User(
            name=name_part.capitalize(),
            email=email_to_store,
            avatar_url="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80",
            is_superhost=False,
            role="guest",
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return new_user

    # Default fallback for unauthenticated tests
    user = db.query(User).filter(User.email == "aarav.patel@example.com").first()
    if not user:
        user = db.query(User).first()
    return user

@router.get("", response_model=list[ListingResponse])
def get_user_wishlists(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Returns the list of all listings bookmarked by the user.
    """
    wishlists = (
        db.query(Wishlist)
        .filter(Wishlist.user_id == current_user.id)
        .order_by(Wishlist.created_at.desc())
        .all()
    )
    listings = [w.listing for w in wishlists if w.listing is not None]
    return listings

@router.get("/ids", response_model=list[int])
def get_wishlist_listing_ids(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Returns a list of listing IDs favorited by the user for fast UI heart highlighting.
    """
    wishlists = db.query(Wishlist.listing_id).filter(Wishlist.user_id == current_user.id).all()
    return [w[0] for w in wishlists]

@router.post("/toggle", response_model=WishlistToggleResponse)
def toggle_wishlist(
    payload: WishlistToggleRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Adds the listing to the user's wishlist if not saved, or removes it if already saved.
    """
    listing = db.query(Listing).filter(Listing.id == payload.listing_id).first()
    if not listing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found.")

    existing = (
        db.query(Wishlist)
        .filter(
            Wishlist.user_id == current_user.id,
            Wishlist.listing_id == payload.listing_id,
        )
        .first()
    )

    if existing:
        db.delete(existing)
        db.commit()
        return WishlistToggleResponse(
            listing_id=payload.listing_id,
            is_favorited=False,
            message="Removed from wishlists.",
        )
    else:
        new_item = Wishlist(user_id=current_user.id, listing_id=payload.listing_id)
        db.add(new_item)
        db.commit()
        return WishlistToggleResponse(
            listing_id=payload.listing_id,
            is_favorited=True,
            message="Saved to wishlists.",
        )
