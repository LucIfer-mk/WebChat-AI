from sqlalchemy.orm import Session
from models import User
from services.security import get_password_hash

def get_or_create_user(db: Session, email: str) -> User:
    """Get existing user or create new one (Legacy OTP flow)"""
    user = db.query(User).filter(User.email == email).first()
    
    if not user:
        user = User(email=email)
        db.add(user)
        db.commit()
        db.refresh(user)
    
    return user

def create_user(db: Session, name: str, email: str, password: str) -> User:
    """Create a new user with password"""
    hashed_password = get_password_hash(password)
    user = User(
        name=name,
        email=email,
        password_hash=hashed_password
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def get_user_by_email(db: Session, email: str) -> User:
    """Get user by email"""
    return db.query(User).filter(User.email == email).first()

def user_exists(db: Session, email: str) -> bool:
    """Check if user with given email exists"""
    return db.query(User).filter(User.email == email).first() is not None
