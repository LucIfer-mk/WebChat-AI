from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from schemas import EmailSubmitRequest, OTPVerifyRequest, BaseResponse, VerifyResponse
from services.otp_service import create_otp, verify_otp
from services.email_service import send_otp_email
from services.user_service import get_or_create_user

router = APIRouter(prefix="/api/auth", tags=["authentication"])

@router.post("/submit-email", response_model=BaseResponse)
async def submit_email(request: EmailSubmitRequest, db: Session = Depends(get_db)):
    """
    Submit email and send OTP code
    """
    try:
        # Create OTP record
        otp_record = create_otp(db, request.email)
        
        # Send OTP via email
        email_sent = await send_otp_email(request.email, otp_record.code)
        
        if not email_sent:
            raise HTTPException(status_code=500, detail="Failed to send email. Please check SMTP configuration.")
        
        return BaseResponse(
            success=True,
            message="OTP sent successfully to your email",
            data={"email": request.email}
        )
    
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Error in submit_email: {str(e)}")
        raise HTTPException(status_code=500, detail="An error occurred while processing your request")


@router.post("/verify-otp", response_model=VerifyResponse)
def verify_otp_endpoint(request: OTPVerifyRequest, db: Session = Depends(get_db)):
    """
    Verify OTP code and create/get user
    """
    try:
        # Verify OTP
        success, message = verify_otp(db, request.email, request.code)
        
        if not success:
            raise HTTPException(status_code=400, detail=message)
        
        # Create or get user
        user = get_or_create_user(db, request.email)
        
        # In a real application, you would generate a JWT token here
        # For now, we'll just return a success response
        session_token = f"session_{user.id}_{user.email}"  # Placeholder token
        
        return VerifyResponse(
            success=True,
            message="Email verified successfully",
            email=user.email,
            session_token=session_token
        )
    
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Error in verify_otp: {str(e)}")
        raise HTTPException(status_code=500, detail="An error occurred while verifying OTP")


@router.post("/resend-otp", response_model=BaseResponse)
async def resend_otp(request: EmailSubmitRequest, db: Session = Depends(get_db)):
    """
    Resend OTP code to email
    """
    try:
        # Create new OTP (this will invalidate previous ones)
        otp_record = create_otp(db, request.email)
        
        # Send OTP via email
        email_sent = await send_otp_email(request.email, otp_record.code)
        
        if not email_sent:
            raise HTTPException(status_code=500, detail="Failed to send email")
        
        return BaseResponse(
            success=True,
            message="New OTP sent successfully",
            data={"email": request.email}
        )
    
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Error in resend_otp: {str(e)}")
        raise HTTPException(status_code=500, detail="An error occurred while resending OTP")
