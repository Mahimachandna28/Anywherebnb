from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models import Wishlist, Listing, User
from app.schemas.wishlist import WishlistToggleRequest, WishlistToggleResponse, WishlistResponse
from app.schemas.listing import ListingResponse

router = APIRouter(prefix="/wishlists", tags=["Wishlists"])

def get_current_user(db: Session = Depends(get_db)) -> User:
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
