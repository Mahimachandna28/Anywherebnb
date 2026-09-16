from pydantic import BaseModel, Field
from app.schemas.user import UserResponse

class SendOtpRequest(BaseModel):
    identifier: str = Field(..., description="Phone number (e.g. +919876543210 or 10-digit) or email address")
    type: str = Field("phone", description="'phone' or 'email'")
    purpose: str = Field("login", description="'login' or 'signup'")

class SendOtpResponse(BaseModel):
    success: bool
    message: str
    identifier: str
    expires_in_seconds: int = 600

class VerifyOtpRequest(BaseModel):
    identifier: str = Field(..., description="Phone number or email address that received the OTP")
    code: str = Field(..., min_length=4, max_length=10, description="The OTP verification code received via Twilio")
    purpose: str = Field("login", description="'login' or 'signup'")
    name: str | None = Field(None, description="Full name (required for signup)")
    password: str | None = Field(None, description="Password (optional for signup)")

class AuthResponse(BaseModel):
    success: bool
    message: str
    user: UserResponse
