import random
import string
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from models import OTPCode
import os
from dotenv import load_dotenv

load_dotenv()

OTP_EXPIRATION_MINUTES = int(os.getenv("OTP_EXPIRATION_MINUTES", "10"))

def generate_otp() -> str:
    """Generate a random 6-digit OTP"""
    return ''.join(random.choices(string.digits, k=6))

def create_otp(db: Session, email: str) -> OTPCode:
    """Create a new OTP for the given email"""
    # Invalidate any previous OTPs for this email
    db.query(OTPCode).filter(
        OTPCode.email == email,
        OTPCode.verified == False
    ).delete()
    db.commit()
    
    # Generate new OTP
    code = generate_otp()
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=OTP_EXPIRATION_MINUTES)
    
    otp_record = OTPCode(
        email=email,
        code=code,
        expires_at=expires_at,
        verified=False
    )
    
    db.add(otp_record)
    db.commit()
    db.refresh(otp_record)
    
    return otp_record

def verify_otp(db: Session, email: str, code: str) -> tuple[bool, str]:
    """
    Verify OTP code for the given email
    Returns (success: bool, message: str)
    """
    otp_record = db.query(OTPCode).filter(
        OTPCode.email == email,
        OTPCode.code == code,
        OTPCode.verified == False
    ).first()
    
    if not otp_record:
        return False, "Invalid OTP code"
    
    # Check if expired (using timezone-aware comparison)
    if datetime.now(timezone.utc) > otp_record.expires_at:
        return False, "OTP has expired"
    
    # Mark as verified
    otp_record.verified = True
    db.commit()
    
    return True, "OTP verified successfully"
