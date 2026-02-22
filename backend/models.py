from dotenv import load_dotenv
load_dotenv()

import os
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Text, Integer, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from pgvector.sqlalchemy import Vector
from database import Base

EMBEDDING_DIM = int(os.getenv("EMBEDDING_DIM", "1536"))


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
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc),
                        onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    knowledge_entries = relationship("KnowledgeEntry", back_populates="chatbot",
                                     cascade="all, delete-orphan")
    knowledge_documents = relationship("KnowledgeDocument", back_populates="chatbot",
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


class KnowledgeDocument(Base):
    """Uploaded documents (PDF, Word) for a chatbot's knowledge base."""
    __tablename__ = "knowledge_documents"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    chatbot_id = Column(String, ForeignKey("chatbots.id", ondelete="CASCADE"), nullable=False)
    filename = Column(String(500), nullable=False)
    file_type = Column(String(50), nullable=False)     # "pdf", "docx"
    file_size = Column(Integer, default=0)
    chunk_count = Column(Integer, default=0)
    status = Column(String(20), default="processing")  # processing, ready, error
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    chatbot = relationship("Chatbot", back_populates="knowledge_documents")
    chunks = relationship("DocumentChunk", back_populates="document",
                          cascade="all, delete-orphan")


class DocumentChunk(Base):
    """Chunks of text from uploaded documents with vector embeddings."""
    __tablename__ = "document_chunks"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    document_id = Column(String, ForeignKey("knowledge_documents.id", ondelete="CASCADE"), nullable=False)
    chatbot_id = Column(String, ForeignKey("chatbots.id", ondelete="CASCADE"), nullable=False)
    content = Column(Text, nullable=False)
    chunk_index = Column(Integer, default=0)
    embedding = Column(Vector(EMBEDDING_DIM))  # Configurable dimension

    document = relationship("KnowledgeDocument", back_populates="chunks")


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


class Review(Base):
    """User reviews/ratings for a chatbot."""
    __tablename__ = "reviews"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    chatbot_id = Column(String, ForeignKey("chatbots.id", ondelete="CASCADE"), nullable=False)
    rating = Column(Integer, nullable=False)           # 1-5 stars
    comment = Column(Text, nullable=True)
    session_id = Column(String, nullable=True)        # to link with a session if available
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    chatbot = relationship("Chatbot")


class Visit(Base):
    """Tracks when the chatbot widget is loaded on a website."""
    __tablename__ = "visits"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    chatbot_id = Column(String, ForeignKey("chatbots.id", ondelete="CASCADE"), nullable=False)
    session_id = Column(String, nullable=True)        # unique per browser visitor session
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    chatbot = relationship("Chatbot")


class Usage(Base):
    """Tracks when a user has a conversation and closes the bot."""
    __tablename__ = "usage_stats"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    chatbot_id = Column(String, ForeignKey("chatbots.id", ondelete="CASCADE"), nullable=False)
    session_id = Column(String, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    chatbot = relationship("Chatbot")
