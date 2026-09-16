from pydantic import BaseModel, Field
from app.schemas.user import UserResponse

class SendOtpRequest(BaseModel):
    identifier: str = Field(..., description="Phone number (e.g. +919876543210 or 10-digit) or email address")
    type: str = Field("whatsapp", description="'whatsapp', 'phone', or 'email'")
    purpose: str = Field("login", description="'login' or 'signup'")

class SendOtpResponse(BaseModel):
    success: bool
    message: str
    identifier: str
    expires_in_seconds: int = 600
    whatsapp_url: str | None = None
    otp_code: str | None = None


class VerifyOtpRequest(BaseModel):
    identifier: str = Field(..., description="Phone number or email address that received the OTP")
    code: str = Field(..., min_length=4, max_length=10, description="The OTP verification code received via Twilio")
    purpose: str = Field("login", description="'login' or 'signup'")
    name: str | None = Field(None, description="Full name (required for signup)")
    password: str | None = Field(None, description="Password (optional for signup)")

class PasswordLoginRequest(BaseModel):
    identifier: str = Field(..., description="Phone number or email address")
    password: str = Field(..., min_length=1, description="Account password")

class DirectSignupRequest(BaseModel):
    name: str = Field(..., min_length=1, description="Full name")
    identifier: str = Field(..., description="Phone number or email address")
    password: str = Field(..., min_length=6, description="Account password (min. 6 characters)")

class AuthResponse(BaseModel):
    success: bool
    message: str
    user: UserResponse

