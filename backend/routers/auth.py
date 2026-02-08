from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import User
from schemas import (
    EmailSubmitRequest,
    OTPVerifyRequest,
    BaseResponse,
    VerifyResponse,
    UserRegisterRequest,
    UserLoginRequest,
    UserResponse
)
from services.otp_service import create_otp, verify_otp
from services.email_service import send_otp_email
from services.user_service import create_user, get_user_by_email, user_exists, get_or_create_user
from services.security import verify_password

router = APIRouter(prefix="/api/auth", tags=["authentication"])

@router.post("/register", response_model=BaseResponse)
async def register(request: UserRegisterRequest, db: Session = Depends(get_db)):
    """
    Register a new user: Send OTP first, save data in pending state
    """
    try:
        if user_exists(db, request.email):
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Store pending data
        pending_data = {
            "name": request.name,
            "password": request.password # We will hash it when creating the user for real, or we can hash it now
        }
        
        # Create OTP with pending data
        otp_record = create_otp(db, request.email, pending_user_data=pending_data)
        
        # Send OTP via email
        email_sent = await send_otp_email(request.email, otp_record.code)
        
        if not email_sent:
            raise HTTPException(status_code=500, detail="Failed to send OTP email")
        
        return BaseResponse(
            success=True,
            message="Verification code sent to your email",
            data={"email": request.email}
        )
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Error in register: {str(e)}")
        raise HTTPException(status_code=500, detail="An error occurred during registration")

@router.post("/login", response_model=BaseResponse)
async def login(request: UserLoginRequest, db: Session = Depends(get_db)):
    """
    Login with email and password: If correct, send OTP
    """
    try:
        user = get_user_by_email(db, request.email)
        if not user or not user.password_hash:
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        if not verify_password(request.password, user.password_hash):
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        # Password correct, now send OTP for multi-step verification
        otp_record = create_otp(db, request.email)
        
        # Send OTP via email
        email_sent = await send_otp_email(request.email, otp_record.code)
        
        if not email_sent:
            raise HTTPException(status_code=500, detail="Failed to send verification code")
        
        return BaseResponse(
            success=True,
            message="Verification code sent to your email",
            data={"email": request.email}
        )
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Error in login: {str(e)}")
        raise HTTPException(status_code=500, detail="An error occurred during login")


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
        success, message, otp_record = verify_otp(db, request.email, request.code)
        
        if not success:
            raise HTTPException(status_code=400, detail=message)
        
        # check if this was a registration flow with pending data
        user = None
        if otp_record.pending_user_data:
            pending = otp_record.pending_user_data
            user = create_user(
                db, 
                name=pending.get("name"), 
                email=request.email, 
                password=pending.get("password")
            )
        else:
            # Fallback/Legacy flow
            user = get_or_create_user(db, request.email)
        
        # Generator session token
        session_token = f"session_{user.id}_{user.email}"
        
        return VerifyResponse(
            success=True,
            message="Email verified successfully",
            user=UserResponse.model_validate(user),
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
