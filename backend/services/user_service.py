from sqlalchemy.orm import Session
from models import User

def get_or_create_user(db: Session, email: str) -> User:
    """Get existing user or create new one"""
    user = db.query(User).filter(User.email == email).first()
    
    if not user:
        user = User(email=email)
        db.add(user)
        db.commit()
        db.refresh(user)
    
    return user

def user_exists(db: Session, email: str) -> bool:
    """Check if user with given email exists"""
    return db.query(User).filter(User.email == email).first() is not None
