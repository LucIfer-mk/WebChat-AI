import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Text, Integer, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), nullable=True)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc),
                        onupdate=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class Chatbot(Base):
    __tablename__ = "chatbots"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), nullable=False)
    welcome_message = Column(Text, default="Hi! How can I help you today?")
    primary_color = Column(String(7), default="#4361EE")
    header_color = Column(String(7), default="#0A1929")
    bubble_color = Column(String(7), default="#4361EE")
    text_color = Column(String(7), default="#FFFFFF")
    icon_url = Column(Text, nullable=True)
    position = Column(String(20), default="bottom-right")
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=True) # Nullable for migration, but will be required
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc),
                        onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    knowledge_entries = relationship("KnowledgeEntry", back_populates="chatbot",
                                     cascade="all, delete-orphan")
    conversations = relationship("Conversation", back_populates="chatbot",
                                  cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "welcome_message": self.welcome_message,
            "primary_color": self.primary_color,
            "header_color": self.header_color,
            "bubble_color": self.bubble_color,
            "text_color": self.text_color,
            "icon_url": self.icon_url,
            "position": self.position,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class KnowledgeEntry(Base):
    """Custom Q&A knowledge entries for a chatbot."""
    __tablename__ = "knowledge_entries"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    chatbot_id = Column(String, ForeignKey("chatbots.id", ondelete="CASCADE"), nullable=False)
    trigger = Column(Text, nullable=False)           # keyword/phrase that triggers the response
    response = Column(Text, nullable=False)           # the bot's custom response
    is_exact_match = Column(Boolean, default=False)   # True = exact match, False = contains match
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    chatbot = relationship("Chatbot", back_populates="knowledge_entries")


class Conversation(Base):
    """Tracks individual chat sessions on the widget."""
    __tablename__ = "conversations"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    chatbot_id = Column(String, ForeignKey("chatbots.id", ondelete="CASCADE"), nullable=False)
    session_id = Column(String, nullable=False)        # unique per browser visitor session
    visitor_name = Column(String(100), default="Visitor")
    status = Column(String(20), default="active")      # active, closed
    started_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc),
                        onupdate=lambda: datetime.now(timezone.utc))

    chatbot = relationship("Chatbot", back_populates="conversations")
    messages = relationship("Message", back_populates="conversation",
                             cascade="all, delete-orphan",
                             order_by="Message.created_at")


class Message(Base):
    """Individual messages within a conversation."""
    __tablename__ = "messages"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    conversation_id = Column(String, ForeignKey("conversations.id", ondelete="CASCADE"),
                             nullable=False)
    sender = Column(String(10), nullable=False)        # "user" or "bot"
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    conversation = relationship("Conversation", back_populates="messages")
