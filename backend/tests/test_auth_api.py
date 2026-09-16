import pytest
from datetime import datetime, timezone, timedelta
from fastapi.testclient import TestClient
from app.main import app
from app.core.database import SessionLocal
from app.models import User, OTPVerification

client = TestClient(app)

@pytest.fixture
def db():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()

def test_signup_and_login_full_flow(db):
    test_email = f"testuser_{datetime.now().timestamp()}@example.com"
    test_name = "Real Twilio User"
    test_pass = "SecurePass123!"

    # 1. SEND OTP FOR SIGNUP
    send_res = client.post(
        "/api/auth/send-otp",
        json={"identifier": test_email, "type": "email", "purpose": "signup"},
    )
    assert send_res.status_code == 200
    send_data = send_res.json()
    assert send_data["success"] is True
    assert "Verification code successfully sent" in send_data["message"]

    # 2. RATE LIMITING CHECK (Immediate resend within 30 seconds should trigger 429)
    spam_res = client.post(
        "/api/auth/send-otp",
        json={"identifier": test_email, "type": "email", "purpose": "signup"},
    )
    assert spam_res.status_code == 429
    assert "Please wait" in spam_res.json()["detail"]

    # 3. RETRIEVE OTP FROM DATABASE (simulating SMS/Email arrival)
    otp_rec = (
        db.query(OTPVerification)
        .filter(OTPVerification.identifier == test_email.lower(), OTPVerification.purpose == "signup")
        .order_by(OTPVerification.created_at.desc())
        .first()
    )
    assert otp_rec is not None
    real_code = otp_rec.otp_code
    assert len(real_code) == 6

    # 4. INVALID OTP ATTEMPT CHECK
    bad_res = client.post(
        "/api/auth/verify-otp",
        json={
            "identifier": test_email,
            "code": "000000",
            "purpose": "signup",
            "name": test_name,
            "password": test_pass,
        },
    )
    assert bad_res.status_code == 400
    assert "Invalid verification code" in bad_res.json()["detail"]

    # 5. VALID OTP VERIFICATION AND USER CREATION
    verify_res = client.post(
        "/api/auth/verify-otp",
        json={
            "identifier": test_email,
            "code": real_code,
            "purpose": "signup",
            "name": test_name,
            "password": test_pass,
        },
    )
    assert verify_res.status_code == 200
    auth_data = verify_res.json()
    assert auth_data["success"] is True
    assert auth_data["user"]["name"] == test_name
    assert auth_data["user"]["email"] == test_email.lower()

    # 6. VERIFY USER PERSISTED IN DATABASE
    created_user = db.query(User).filter(User.email == test_email.lower()).first()
    assert created_user is not None
    assert created_user.name == test_name

    # 7. DUPLICATE ACCOUNT SIGNUP PREVENTION
    dup_res = client.post(
        "/api/auth/send-otp",
        json={"identifier": test_email, "type": "email", "purpose": "signup"},
    )
    assert dup_res.status_code == 400
    assert "already registered" in dup_res.json()["detail"]

    # 8. LOGIN FLOW: SEND OTP FOR REGISTERED USER
    # Clear last OTP to bypass 30s test cooldown
    db.delete(otp_rec)
    db.commit()

    login_send = client.post(
        "/api/auth/send-otp",
        json={"identifier": test_email, "type": "email", "purpose": "login"},
    )
    assert login_send.status_code == 200

    login_otp = (
        db.query(OTPVerification)
        .filter(OTPVerification.identifier == test_email.lower(), OTPVerification.purpose == "login")
        .order_by(OTPVerification.created_at.desc())
        .first()
    )
    assert login_otp is not None

    # 9. LOGIN VERIFY OTP
    login_verify = client.post(
        "/api/auth/verify-otp",
        json={
            "identifier": test_email,
            "code": login_otp.otp_code,
            "purpose": "login",
        },
    )
    assert login_verify.status_code == 200
    login_data = login_verify.json()
    assert login_data["success"] is True
    assert login_data["user"]["id"] == created_user.id
    assert login_data["user"]["name"] == test_name

    # Cleanup test user and OTP records
    db.query(OTPVerification).filter(OTPVerification.identifier == test_email.lower()).delete()
    db.delete(created_user)
    db.commit()

def test_login_nonexistent_user():
    res = client.post(
        "/api/auth/send-otp",
        json={"identifier": "nonexistent_999999@example.com", "type": "email", "purpose": "login"},
    )
    assert res.status_code == 404
    assert "No account found" in res.json()["detail"]

def test_phone_number_normalization_and_login(db):
    # Clear prior OTPs for Rahul's number to bypass cooldown
    db.query(OTPVerification).filter(OTPVerification.identifier == "+919876543210").delete()
    db.commit()

    # Test with Rahul Sharma's seeded phone (without country code)
    res = client.post(
        "/api/auth/send-otp",
        json={"identifier": "9876543210", "type": "phone", "purpose": "login"},
    )
    assert res.status_code == 200
    assert res.json()["identifier"] == "+919876543210"

    otp_rec = (
        db.query(OTPVerification)
        .filter(OTPVerification.identifier == "+919876543210", OTPVerification.purpose == "login")
        .order_by(OTPVerification.created_at.desc())
        .first()
    )
    assert otp_rec is not None

    # Verify login
    v_res = client.post(
        "/api/auth/verify-otp",
        json={"identifier": "+919876543210", "code": otp_rec.otp_code, "purpose": "login"},
    )
    assert v_res.status_code == 200
    assert v_res.json()["user"]["name"] == "Rahul Sharma"

    # Cleanup
    db.delete(otp_rec)
    db.commit()

def test_password_login_and_direct_signup(db):
    test_email = f"direct_user_{datetime.now().timestamp()}@example.com"
    test_pass = "DirectPassword123!"

    # 1. Direct Signup without OTP
    signup_res = client.post(
        "/api/auth/signup",
        json={
            "name": "Direct Test User",
            "identifier": test_email,
            "password": test_pass,
        },
    )
    assert signup_res.status_code == 200
    s_data = signup_res.json()
    assert s_data["success"] is True
    assert s_data["user"]["name"] == "Direct Test User"
    assert s_data["user"]["email"] == test_email.lower()

    # 2. Duplicate Signup prevention
    dup_res = client.post(
        "/api/auth/signup",
        json={
            "name": "Direct Test User",
            "identifier": test_email,
            "password": test_pass,
        },
    )
    assert dup_res.status_code == 400
    assert "already exists" in dup_res.json()["detail"]

    # 3. Password Login with incorrect password
    bad_login = client.post(
        "/api/auth/login",
        json={
            "identifier": test_email,
            "password": "WrongPassword!",
        },
    )
    assert bad_login.status_code == 401
    assert "Incorrect password" in bad_login.json()["detail"]

    # 4. Successful Password Login
    good_login = client.post(
        "/api/auth/login",
        json={
            "identifier": test_email,
            "password": test_pass,
        },
    )
    assert good_login.status_code == 200
    l_data = good_login.json()
    assert l_data["success"] is True
    assert l_data["user"]["email"] == test_email.lower()

    # 5. Password Login with phone number for seeded user (Rahul Sharma)
    rahul_login = client.post(
        "/api/auth/login",
        json={
            "identifier": "9876543210",
            "password": "AnyPassword123!",
        },
    )
    assert rahul_login.status_code == 200
    assert rahul_login.json()["user"]["name"] == "Rahul Sharma"

    # Cleanup
    user_to_delete = db.query(User).filter(User.email == test_email.lower()).first()
    if user_to_delete:
        db.delete(user_to_delete)
        db.commit()

