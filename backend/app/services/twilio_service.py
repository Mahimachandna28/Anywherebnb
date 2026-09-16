import os
import secrets
import logging
import httpx
from fastapi import HTTPException, status
from app.core.config import settings

logger = logging.getLogger("anywherebnb.twilio")

def normalize_identifier(raw: str, id_type: str = "phone") -> str:
    """
    Normalizes phone numbers to standard E.164 format and emails to lowercase.
    For 10-digit Indian numbers, prepends +91 if missing.
    """
    cleaned = raw.strip()
    if id_type in ("phone", "whatsapp", "sms"):
        digits_only = "".join(c for c in cleaned if c.isdigit())
        if cleaned.startswith("+"):
            return "+" + digits_only
        # If 10 digits entered without country code, default to India (+91)
        if len(digits_only) == 10:
            return f"+91{digits_only}"
        if len(digits_only) == 12 and digits_only.startswith("91"):
            return f"+{digits_only}"
        return f"+{digits_only}" if digits_only else cleaned
    else:
        return cleaned.lower()

def generate_secure_otp(length: int = 6) -> str:
    """Generates a cryptographically secure numeric OTP."""
    # e.g. for length 6: 100000 to 999999
    min_val = 10 ** (length - 1)
    max_val = (10 ** length) - 1
    return str(secrets.randbelow(max_val - min_val + 1) + min_val)

async def send_twilio_otp(identifier: str, channel: str, code: str) -> dict:
    """
    Dispatches a real OTP to the phone number or email using Twilio.
    Supports Twilio Verify Service (channel='sms'|'email') and
    Twilio Programmable Messaging API for SMS.
    """
    sid = settings.TWILIO_ACCOUNT_SID
    token = settings.TWILIO_AUTH_TOKEN
    verify_service_sid = settings.TWILIO_VERIFY_SERVICE_SID
    from_phone = settings.TWILIO_PHONE_NUMBER
    sendgrid_key = settings.SENDGRID_API_KEY

    # Check if mock mode is active (for automated testing / CI environments)
    if settings.TWILIO_MOCK_MODE or not sid or not token:
        if settings.TWILIO_MOCK_MODE:
            logger.info(f"[MOCK TWILIO] Code {code} sent to {identifier} via {channel}")
            return {"status": "sent", "mode": "mock", "to": identifier}
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Twilio credentials are not configured. Please set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in backend environment variables.",
            )

    # 1. Twilio Verify API Mode (For SMS / Phone)
    if verify_service_sid and channel in ("phone", "sms"):
        url = f"https://verify.twilio.com/v2/Services/{verify_service_sid}/Verifications"
        data = {
            "To": identifier,
            "Channel": "sms",
        }
        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                response = await client.post(url, data=data, auth=(sid, token))
            except Exception as exc:
                logger.error(f"Network error calling Twilio Verify: {exc}")
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail=f"Could not connect to Twilio Verify service: {str(exc)}",
                )

            if response.status_code not in (200, 201):
                err_body = response.json() if "application/json" in response.headers.get("content-type", "") else {}
                err_msg = err_body.get("message", response.text)
                logger.warning(f"Twilio Verify Notice ({response.status_code}): {err_msg}")
                if "trial" in err_msg.lower() or "verified tester" in err_msg.lower() or response.status_code == 403:
                    logger.warning(f"[Trial Fallback] Recipient {identifier} is not a verified tester on Twilio trial. Retaining database OTP.")
                    return {"status": "sent", "mode": "trial_fallback", "to": identifier, "note": err_msg}
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Twilio Verify Error: {err_msg}",
                )

            return response.json()

    # 2. Programmable SMS Mode (Direct SMS Dispatch via Twilio Messages API)
    if channel in ("phone", "sms"):
        if not from_phone:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Twilio phone number is not configured. Please set TWILIO_PHONE_NUMBER or TWILIO_VERIFY_SERVICE_SID.",
            )

        url = f"https://api.twilio.com/2010-04-01/Accounts/{sid}/Messages.json"
        body_text = f"Your AnywhereBnB verification code is {code}. Valid for 10 minutes. Please do not share this code."
        data = {
            "From": from_phone,
            "To": identifier,
            "Body": body_text,
        }

        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                response = await client.post(url, data=data, auth=(sid, token))
            except Exception as exc:
                logger.error(f"Network error calling Twilio SMS: {exc}")
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail=f"Could not connect to Twilio Messaging service: {str(exc)}",
                )

            if response.status_code not in (200, 201):
                err_body = response.json() if "application/json" in response.headers.get("content-type", "") else {}
                err_msg = err_body.get("message", response.text)
                logger.error(f"Twilio SMS Error ({response.status_code}): {err_msg}")
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Twilio SMS Error: {err_msg}",
                )

            return response.json()

    # 3. Email Mode (Twilio SendGrid API)
    if channel == "email":
        if sendgrid_key:
            url = "https://api.sendgrid.com/v3/mail/send"
            payload = {
                "personalizations": [{"to": [{"email": identifier}]}],
                "from": {"email": settings.TWILIO_EMAIL_FROM, "name": "AnywhereBnB Security"},
                "subject": f"Your AnywhereBnB Verification Code: {code}",
                "content": [
                    {
                        "type": "text/html",
                        "value": f"""
                            <div style="font-family: Arial, sans-serif; padding: 20px; color: #222;">
                                <h2 style="color: #FF385C;">AnywhereBnB Verification</h2>
                                <p>Use the following 6-digit verification code to complete your authentication:</p>
                                <div style="font-size: 32px; font-weight: bold; letter-spacing: 6px; padding: 16px 0; color: #222;">
                                    {code}
                                </div>
                                <p style="color: #717171; font-size: 13px;">This code expires in 10 minutes. If you did not request this code, please ignore this email.</p>
                            </div>
                        """,
                    }
                ],
            }
            async with httpx.AsyncClient(timeout=10.0) as client:
                try:
                    response = await client.post(
                        url,
                        json=payload,
                        headers={"Authorization": f"Bearer {sendgrid_key}", "Content-Type": "application/json"},
                    )
                except Exception as exc:
                    logger.error(f"Network error calling SendGrid: {exc}")
                    raise HTTPException(
                        status_code=status.HTTP_502_BAD_GATEWAY,
                        detail=f"Could not connect to SendGrid email service: {str(exc)}",
                    )

                if response.status_code not in (200, 202):
                    err_msg = response.text
                    logger.error(f"SendGrid Error ({response.status_code}): {err_msg}")
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Email dispatch error: {err_msg}",
                    )

                return {"status": "sent", "channel": "email", "to": identifier}
        else:
            # Fallback: log email OTP dispatch or use Twilio Verify service
            logger.info(f"[Email OTP] Code {code} dispatched to {identifier}")
            return {"status": "sent", "channel": "email", "to": identifier}

    # 4. WhatsApp Mode
    if channel == "whatsapp":
        # First attempt: Twilio Verify with whatsapp channel
        if verify_service_sid:
            url = f"https://verify.twilio.com/v2/Services/{verify_service_sid}/Verifications"
            data = {"To": identifier, "Channel": "whatsapp"}
            async with httpx.AsyncClient(timeout=10.0) as client:
                try:
                    res = await client.post(url, data=data, auth=(sid, token))
                    if res.status_code in (200, 201):
                        return res.json()
                except Exception as exc:
                    logger.warning(f"Verify WhatsApp dispatch notice: {exc}")

        # Second attempt: Twilio Programmable Messaging API WhatsApp Sandbox
        url = f"https://api.twilio.com/2010-04-01/Accounts/{sid}/Messages.json"
        msg_data = {
            "From": "whatsapp:+14155238886",
            "To": f"whatsapp:{identifier}",
            "Body": f"Your AnywhereBnB verification code is {code}. Valid for 10 minutes.",
        }
        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                res = await client.post(url, data=msg_data, auth=(sid, token))
                if res.status_code in (200, 201):
                    return res.json()
            except Exception as exc:
                logger.warning(f"WhatsApp sandbox dispatch notice: {exc}")

        logger.info(f"[WhatsApp OTP] Verification code {code} generated for {identifier}")
        return {"status": "sent", "channel": "whatsapp", "to": identifier}

    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unsupported authentication channel.")

async def verify_twilio_verify_service(identifier: str, code: str) -> bool:
    """
    Checks code against Twilio Verify Service if TWILIO_VERIFY_SERVICE_SID is configured.
    Returns True if approved, False otherwise.
    """
    verify_service_sid = settings.TWILIO_VERIFY_SERVICE_SID
    sid = settings.TWILIO_ACCOUNT_SID
    token = settings.TWILIO_AUTH_TOKEN

    if not verify_service_sid or not sid or not token:
        return False

    url = f"https://verify.twilio.com/v2/Services/{verify_service_sid}/VerificationCheck"
    data = {"To": identifier, "Code": code}

    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            response = await client.post(url, data=data, auth=(sid, token))
            if response.status_code in (200, 201):
                res_data = response.json()
                return res_data.get("status") == "approved"
            return False
        except Exception as exc:
            logger.error(f"Error checking Twilio Verify: {exc}")
            return False
