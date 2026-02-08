import uuid
from sqlalchemy import Column, Integer, String, DateTime, Boolean, Index, ForeignKey, Text, Float, Enum, ARRAY
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import enum

# Try to import pgvector, fail gracefully if not available during initialization
try:
    from pgvector.sqlalchemy import Vector
except ImportError:
    Vector = None

class SenderType(enum.Enum):
    USER = "user"
    BOT = "bot"

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=True)  # Nullable for OTP-only users
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    websites = relationship("Website", back_populates="owner")
    subscriptions = relationship("Subscription", back_populates="user")

    def __repr__(self):
        return f"<User(id={self.id}, email={self.email})>"


class OTPCode(Base):
    __tablename__ = "otp_codes"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, index=True, nullable=False)
    code = Column(String(6), nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    verified = Column(Boolean, default=False)
    pending_user_data = Column(JSONB, nullable=True) # For registration data before verification
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Create composite index for faster lookups
    __table_args__ = (
        Index('idx_email_code', 'email', 'code'),
    )

    def __repr__(self):
        return f"<OTPCode(id={self.id}, email={self.email}, verified={self.verified})>"


class Website(Base):
    __tablename__ = "websites"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    website_url = Column(String, nullable=False)
    chatbot_name = Column(String, default="AI Assistant")
    theme = Column(String, default="light")
    primary_color = Column(String, default="#3b82f6")
    position = Column(String, default="right")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    owner = relationship("User", back_populates="websites")
    api_keys = relationship("APIKey", back_populates="website")
    sessions = relationship("ChatSession", back_populates="website")
    knowledge_base = relationship("KnowledgeBase", back_populates="website")
    analytics = relationship("AnalyticsEvent", back_populates="website")


class APIKey(Base):
    __tablename__ = "api_keys"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    website_id = Column(UUID(as_uuid=True), ForeignKey("websites.id"), nullable=False)
    api_key = Column(String, unique=True, index=True, nullable=False)
    domain_whitelist = Column(ARRAY(String), default=[])
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    website = relationship("Website", back_populates="api_keys")


class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    stripe_customer_id = Column(String, index=True)
    stripe_subscription_id = Column(String, unique=True, index=True)
    plan = Column(String, nullable=False)
    status = Column(String, nullable=False)
    current_period_end = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="subscriptions")


class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    website_id = Column(UUID(as_uuid=True), ForeignKey("websites.id"), nullable=False)
    visitor_id = Column(String, index=True)
    page_url = Column(Text)
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    ended_at = Column(DateTime(timezone=True))

    # Relationships
    website = relationship("Website", back_populates="sessions")
    messages = relationship("ChatMessage", back_populates="session")
    rating = relationship("RatingFeedback", back_populates="session", uselist=False)


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(UUID(as_uuid=True), ForeignKey("chat_sessions.id"), nullable=False)
    sender = Column(Enum(SenderType), nullable=False)
    message = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    session = relationship("ChatSession", back_populates="messages")


class KnowledgeBase(Base):
    __tablename__ = "knowledge_base"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    website_id = Column(UUID(as_uuid=True), ForeignKey("websites.id"), nullable=False)
    source_type = Column(String, nullable=False) # 'crawl' or 'manual'
    question = Column(Text, nullable=True)
    answer = Column(Text, nullable=True)
    content = Column(Text, nullable=False)
    if Vector:
        embedding = Column(Vector(1536)) # Assuming OpenAI embeddings dimensionality
    else:
        embedding = Column(ARRAY(Float)) # Fallback if pgvector not installed

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    website = relationship("Website", back_populates="knowledge_base")


class AnalyticsEvent(Base):
    __tablename__ = "analytics_events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    website_id = Column(UUID(as_uuid=True), ForeignKey("websites.id"), nullable=False)
    event_type = Column(String, index=True, nullable=False)
    metadata_json = Column(JSONB, default={}) # Renamed from 'metadata' to avoid conflict with SQLAlchemy MetaData
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    website = relationship("Website", back_populates="analytics")


class RatingFeedback(Base):
    __tablename__ = "ratings_feedback"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(UUID(as_uuid=True), ForeignKey("chat_sessions.id"), nullable=False)
    rating = Column(Integer, nullable=False)
    feedback = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    session = relationship("ChatSession", back_populates="rating")
