from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from app.core.database import Base

def utc_now():
    return datetime.now(timezone.utc)

class OTPVerification(Base):
    __tablename__ = "otp_verifications"

    id = Column(Integer, primary_key=True, index=True)
    identifier = Column(String(120), index=True, nullable=False)
    channel = Column(String(20), default="sms")
    otp_code = Column(String(10), nullable=False)
    purpose = Column(String(20), default="login")
    expires_at = Column(DateTime, nullable=False)
    attempts = Column(Integer, default=0)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utc_now)

    def __repr__(self):
        return f"<OTPVerification id={self.id} identifier='{self.identifier}' purpose='{self.purpose}' verified={self.is_verified}>"
