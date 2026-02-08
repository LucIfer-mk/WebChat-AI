from pydantic import BaseModel, EmailStr, Field
from typing import Optional
import uuid

class EmailSubmitRequest(BaseModel):
    email: EmailStr

class OTPVerifyRequest(BaseModel):
    email: EmailStr
    code: str = Field(..., min_length=6, max_length=6, pattern=r'^\d{6}$')

class BaseResponse(BaseModel):
    success: bool
    message: str
    data: Optional[dict] = None

class UserRegisterRequest(BaseModel):
    name: str = Field(..., min_length=2)
    email: EmailStr
    password: str = Field(..., min_length=8)

class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: uuid.UUID
    name: Optional[str]
    email: str

    class Config:
        from_attributes = True

class VerifyResponse(BaseModel):
    success: bool
    message: str
    user: Optional[UserResponse] = None
    session_token: Optional[str] = None
