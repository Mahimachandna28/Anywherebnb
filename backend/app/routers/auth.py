import secrets
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models import User, OTPVerification
from app.schemas.auth import (
    SendOtpRequest,
    SendOtpResponse,
    VerifyOtpRequest,
    AuthResponse,
)
from app.schemas.user import UserResponse
from app.services.twilio_service import (
    normalize_identifier,
    generate_secure_otp,
    send_twilio_otp,
    verify_twilio_verify_service,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])

def get_utc_now():
    return datetime.now(timezone.utc)

@router.post("/send-otp", response_model=SendOtpResponse)
async def send_otp(payload: SendOtpRequest, db: Session = Depends(get_db)):
    """
    Dispatches a real OTP code via Twilio to the recipient phone number or email address.
    Enforces duplicate account checks for signup and account existence for login.
    """
    clean_id = normalize_identifier(payload.identifier, payload.type)

    # 1. Signup duplicate account check
    if payload.purpose == "signup":
        existing_user = (
            db.query(User)
            .filter((User.email == clean_id) | (User.phone == clean_id))
            .first()
        )
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"An account with this {payload.type} is already registered. Please log in.",
            )

    # 2. Login user existence check
    elif payload.purpose == "login":
        existing_user = (
            db.query(User)
            .filter((User.email == clean_id) | (User.phone == clean_id))
            .first()
        )
        if not existing_user:
            # Also check if it matches demo accounts by numeric part
            if payload.type == "phone":
                num_part = clean_id[-10:]
                existing_user = (
                    db.query(User)
                    .filter(User.phone.like(f"%{num_part}%"))
                    .first()
                )
            if not existing_user:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"No account found registered with this {payload.type}. Please sign up first.",
                )

    # 3. Resend rate limiting: prevent spamming (30 seconds cooldown)
    now = get_utc_now()
    last_otp = (
        db.query(OTPVerification)
        .filter(
            OTPVerification.identifier == clean_id,
            OTPVerification.is_verified == False,
        )
        .order_by(OTPVerification.created_at.desc())
        .first()
    )
    if last_otp and last_otp.created_at:
        created_at_aware = (
            last_otp.created_at.replace(tzinfo=timezone.utc)
            if last_otp.created_at.tzinfo is None
            else last_otp.created_at
        )
        elapsed = (now - created_at_aware).total_seconds()
        if elapsed < 30:
            remaining = int(30 - elapsed)
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Please wait {remaining} seconds before requesting a new verification code.",
            )

    # 4. Generate cryptographically random 6-digit OTP (NO demo codes!)
    otp_code = generate_secure_otp(6)
    expires_at = now + timedelta(minutes=10)

    # 5. Persist OTP in database with expiry and attempt tracker
    otp_record = OTPVerification(
        identifier=clean_id,
        channel=payload.type,
        otp_code=otp_code,
        purpose=payload.purpose,
        expires_at=expires_at,
        attempts=0,
        is_verified=False,
    )
    db.add(otp_record)
    db.commit()

    # 6. Dispatch via Twilio API
    await send_twilio_otp(identifier=clean_id, channel=payload.type, code=otp_code)

    return SendOtpResponse(
        success=True,
        message=f"Verification code successfully sent to {clean_id}.",
        identifier=clean_id,
        expires_in_seconds=600,
    )

@router.post("/verify-otp", response_model=AuthResponse)
async def verify_otp(payload: VerifyOtpRequest, db: Session = Depends(get_db)):
    """
    Verifies the OTP code sent via Twilio.
    On successful verification:
      - For Signup: Creates the new user in the database.
      - For Login: Retrieves and authenticates the existing user.
    """
    is_phone = payload.identifier.startswith("+") or (
        payload.identifier.replace(" ", "").replace("-", "").isdigit()
    )
    clean_id = normalize_identifier(payload.identifier, "phone" if is_phone else "email")

    now = get_utc_now()

    # 1. First check if Twilio Verify Service was used and approves
    twilio_verify_approved = await verify_twilio_verify_service(clean_id, payload.code.strip())

    if not twilio_verify_approved:
        # 2. Verify against database OTP records
        otp_record = (
            db.query(OTPVerification)
            .filter(
                OTPVerification.identifier == clean_id,
                OTPVerification.purpose == payload.purpose,
                OTPVerification.is_verified == False,
            )
            .order_by(OTPVerification.created_at.desc())
            .first()
        )

        if not otp_record:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No pending verification code found for this recipient. Please request a new code.",
            )

        # Check attempt limits (max 5)
        if otp_record.attempts >= 5:
            db.delete(otp_record)
            db.commit()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Too many invalid attempts. This verification code has been revoked. Please request a new code.",
            )

        # Check expiry (10 minutes)
        expires_at_aware = (
            otp_record.expires_at.replace(tzinfo=timezone.utc)
            if otp_record.expires_at.tzinfo is None
            else otp_record.expires_at
        )
        if now > expires_at_aware:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This verification code has expired. Please request a new one.",
            )

        # Increment attempts count
        otp_record.attempts += 1
        db.commit()

        # Constant-time comparison to prevent timing attacks
        if not secrets.compare_digest(otp_record.otp_code.strip(), payload.code.strip()):
            attempts_left = max(0, 5 - otp_record.attempts)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid verification code. {attempts_left} attempt(s) remaining.",
            )

        # Mark OTP as successfully verified
        otp_record.is_verified = True
        db.commit()

    # 3. Handle Login
    if payload.purpose == "login":
        user = (
            db.query(User)
            .filter((User.email == clean_id) | (User.phone == clean_id))
            .first()
        )
        if not user and is_phone:
            num_part = clean_id[-10:]
            user = (
                db.query(User)
                .filter(User.phone.like(f"%{num_part}%"))
                .first()
            )

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User account not found in database.",
            )

        return AuthResponse(
            success=True,
            message=f"Welcome back, {user.name}!",
            user=UserResponse.model_validate(user),
        )

    # 4. Handle Signup
    elif payload.purpose == "signup":
        # Final duplicate check before inserting
        existing = (
            db.query(User)
            .filter((User.email == clean_id) | (User.phone == clean_id))
            .first()
        )
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An account with this email or phone number already exists.",
            )

        # Resolve email and phone
        if "@" in clean_id:
            assigned_email = clean_id
            assigned_phone = None
            default_name = clean_id.split("@")[0].replace(".", " ").title()
        else:
            digits = "".join(c for c in clean_id if c.isdigit())
            assigned_email = f"{digits}@phone.anywherebnb.in"
            assigned_phone = clean_id
            default_name = f"User {digits[-4:]}"

        user_name = payload.name.strip() if payload.name and payload.name.strip() else default_name

        new_user = User(
            name=user_name,
            email=assigned_email,
            phone=assigned_phone,
            hashed_password=payload.password if payload.password else None,
            avatar_url="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80",
            is_superhost=False,
            role="guest",
            joined_date=now,
        )

        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        return AuthResponse(
            success=True,
            message=f"Account created successfully. Welcome to AnywhereBnB, {new_user.name}!",
            user=UserResponse.model_validate(new_user),
        )

    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Invalid auth purpose specified.",
    )
