from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models import User
from app.schemas.user import UserResponse

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("", response_model=list[UserResponse])
def get_all_users(db: Session = Depends(get_db)):
    """
    Returns available demo users (hosts and guests).
    """
    return db.query(User).all()

@router.get("/me", response_model=UserResponse)
def get_current_user(email: str | None = None, db: Session = Depends(get_db)):
    """
    Returns the currently active user profile by email or defaults to Aman Gupta (Guest).
    """
    target_email = email or "aman.gupta@example.com"
    user = db.query(User).filter(User.email == target_email).first()
    if not user:
        user = db.query(User).filter(User.email == "aarav.patel@example.com").first()
    if not user:
        user = db.query(User).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
    return user
