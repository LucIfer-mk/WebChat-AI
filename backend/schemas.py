from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class EmailSubmitRequest(BaseModel):
    email: EmailStr

class OTPVerifyRequest(BaseModel):
    email: EmailStr
    code: str = Field(..., min_length=6, max_length=6, pattern=r'^\d{6}$')

class BaseResponse(BaseModel):
    success: bool
    message: str
    data: Optional[dict] = None

class VerifyResponse(BaseModel):
    success: bool
    message: str
    email: str
    session_token: Optional[str] = None
