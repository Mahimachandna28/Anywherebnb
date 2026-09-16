import sys
from datetime import datetime, timezone
from fastapi.testclient import TestClient

# Add backend directory to path
sys.path.insert(0, r"C:\Users\HP\.gemini\antigravity\scratch\Anywherebnb\backend")

from app.main import app
from app.core.database import SessionLocal
from app.models import User, OTPVerification

client = TestClient(app)
db = SessionLocal()

print("=" * 70)
print("RUNNING END-TO-END VERIFICATION FOR REAL TWILIO OTP AUTHENTICATION")
print("=" * 70)

# ----------------------------------------------------------------------
# FLOW 1: SIGNUP FLOW
# Name + Phone/Email -> Send OTP -> Verify OTP -> Save User -> Logged In
# ----------------------------------------------------------------------
print("\n[TEST 1] Testing SIGNUP FLOW (Phone Number)...")
signup_phone = "+919998887766"
signup_name = "Kabir Mehta"
signup_pass = "KabirSecret123"

# Clear any previous test data
db.query(User).filter(User.phone == signup_phone).delete()
db.query(OTPVerification).filter(OTPVerification.identifier == signup_phone).delete()
db.commit()

# 1. Send OTP
send_res = client.post(
    "/api/auth/send-otp",
    json={"identifier": signup_phone, "type": "phone", "purpose": "signup"},
)
assert send_res.status_code == 200, f"Failed to send OTP: {send_res.text}"
print(f"  [OK] 1. Sent real OTP to {signup_phone}: {send_res.json()['message']}")

# 2. Retrieve real OTP code generated and dispatched
otp_record = (
    db.query(OTPVerification)
    .filter(OTPVerification.identifier == signup_phone, OTPVerification.purpose == "signup")
    .order_by(OTPVerification.created_at.desc())
    .first()
)
assert otp_record is not None
otp_code = otp_record.otp_code
print(f"  [OK] 2. Retrieved secure OTP code: {otp_code} (Valid until: {otp_record.expires_at})")

# 3. Invalid code rejection test
bad_res = client.post(
    "/api/auth/verify-otp",
    json={
        "identifier": signup_phone,
        "code": "111111",
        "purpose": "signup",
        "name": signup_name,
        "password": signup_pass,
    },
)
assert bad_res.status_code == 400
print(f"  [OK] 3. Invalid OTP rejected properly: {bad_res.json()['detail']}")

# 4. Verify valid OTP & Create Account
verify_res = client.post(
    "/api/auth/verify-otp",
    json={
        "identifier": signup_phone,
        "code": otp_code,
        "purpose": "signup",
        "name": signup_name,
        "password": signup_pass,
    },
)
assert verify_res.status_code == 200, f"Verification failed: {verify_res.text}"
user_data = verify_res.json()["user"]
print(f"  [OK] 4. OTP verified successfully! Account created: id={user_data['id']}, name='{user_data['name']}', phone='{user_data['phone']}'")

# 5. Confirm user is in database
saved_user = db.query(User).filter(User.id == user_data["id"]).first()
assert saved_user is not None
assert saved_user.phone == signup_phone
assert saved_user.name == signup_name
print(f"  [OK] 5. Verified user saved in database with auto-incremented ID #{saved_user.id}")

# 6. Duplicate account check: Signup again with same phone
dup_res = client.post(
    "/api/auth/send-otp",
    json={"identifier": signup_phone, "type": "phone", "purpose": "signup"},
)
assert dup_res.status_code == 400
print(f"  [OK] 6. Duplicate registration correctly blocked: {dup_res.json()['detail']}")


# ----------------------------------------------------------------------
# FLOW 2: LOGIN FLOW
# Phone/Email -> Send OTP -> Verify OTP -> Fetch User -> Logged In
# ----------------------------------------------------------------------
print("\n[TEST 2] Testing LOGIN FLOW (Existing User: Kabir Mehta)...")

# Clear cooldown for test
db.query(OTPVerification).filter(OTPVerification.identifier == signup_phone).delete()
db.commit()

# 1. Send Login OTP
login_send_res = client.post(
    "/api/auth/send-otp",
    json={"identifier": signup_phone, "type": "phone", "purpose": "login"},
)
assert login_send_res.status_code == 200
print(f"  [OK] 1. Sent Login OTP to registered number {signup_phone}")

# 2. Retrieve Login OTP code
login_otp_rec = (
    db.query(OTPVerification)
    .filter(OTPVerification.identifier == signup_phone, OTPVerification.purpose == "login")
    .order_by(OTPVerification.created_at.desc())
    .first()
)
assert login_otp_rec is not None
login_code = login_otp_rec.otp_code
print(f"  [OK] 2. Dispatched OTP code: {login_code}")

# 3. Verify OTP and authenticate existing user
login_verify_res = client.post(
    "/api/auth/verify-otp",
    json={"identifier": signup_phone, "code": login_code, "purpose": "login"},
)
assert login_verify_res.status_code == 200
logged_in_user = login_verify_res.json()["user"]
assert logged_in_user["id"] == saved_user.id
assert logged_in_user["name"] == signup_name
print(f"  [OK] 3. Verified OTP! Authenticated existing user: {logged_in_user['name']} (ID: {logged_in_user['id']})")

# ----------------------------------------------------------------------
# FLOW 3: SEEDED HOST LOGIN FLOW (Email + Phone)
# ----------------------------------------------------------------------
print("\n[TEST 3] Testing LOGIN FLOW for Seeded Host (Rahul Sharma: rahul.sharma@example.com)...")
host_email = "rahul.sharma@example.com"
db.query(OTPVerification).filter(OTPVerification.identifier == host_email).delete()
db.commit()

# Send OTP
host_send_res = client.post(
    "/api/auth/send-otp",
    json={"identifier": host_email, "type": "email", "purpose": "login"},
)
assert host_send_res.status_code == 200
print(f"  [OK] 1. Sent Login OTP to host email {host_email}")

# Retrieve OTP
host_otp = (
    db.query(OTPVerification)
    .filter(OTPVerification.identifier == host_email, OTPVerification.purpose == "login")
    .order_by(OTPVerification.created_at.desc())
    .first()
)
assert host_otp is not None

# Verify OTP
host_v_res = client.post(
    "/api/auth/verify-otp",
    json={"identifier": host_email, "code": host_otp.otp_code, "purpose": "login"},
)
assert host_v_res.status_code == 200
host_user = host_v_res.json()["user"]
assert host_user["name"] == "Rahul Sharma"
assert host_user["role"] == "both"
print(f"  [OK] 2. Verified Host OTP! Logged in as: {host_user['name']} (Role: {host_user['role']})")

# Clean up test user
db.delete(saved_user)
db.query(OTPVerification).filter(OTPVerification.identifier.in_([signup_phone, host_email])).delete()
db.commit()
db.close()

print("\n" + "=" * 70)
print("ALL E2E AUTHENTICATION FLOWS PASSED WITH 100% SUCCESS!")
print("=" * 70)
