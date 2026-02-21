from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


# ─── User Schemas ──────────────────────────────────────────

class UserRegister(BaseModel):
    name: Optional[str] = None
    email: str
    password: str


class UserLogin(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    id: str
    name: Optional[str]
    email: str
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


# ─── Chatbot Schemas ─────────────────────────────────────────

class ChatbotCreate(BaseModel):
    name: str
    user_id: Optional[str] = None # Will be passed from frontend for now
    welcome_message: str = "Hi! How can I help you today?"
    primary_color: str = "#4361EE"
    header_color: str = "#0A1929"
    bubble_color: str = "#4361EE"
    text_color: str = "#FFFFFF"
    position: str = "bottom-right"


class ChatbotUpdate(BaseModel):
    name: Optional[str] = None
    welcome_message: Optional[str] = None
    primary_color: Optional[str] = None
    header_color: Optional[str] = None
    bubble_color: Optional[str] = None
    text_color: Optional[str] = None
    position: Optional[str] = None


class ChatbotResponse(BaseModel):
    id: str
    name: str
    user_id: Optional[str] = None
    welcome_message: str
    primary_color: str
    header_color: str
    bubble_color: str
    text_color: str
    icon_url: Optional[str] = None
    position: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


# ─── Knowledge Entry Schemas ─────────────────────────────────

class KnowledgeEntryCreate(BaseModel):
    trigger: str
    response: str
    is_exact_match: bool = False


class KnowledgeEntryUpdate(BaseModel):
    trigger: Optional[str] = None
    response: Optional[str] = None
    is_exact_match: Optional[bool] = None


class KnowledgeEntryResponse(BaseModel):
    id: str
    chatbot_id: str
    trigger: str
    response: str
    is_exact_match: bool
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


# ─── Knowledge Document Schemas ──────────────────────────────

class KnowledgeDocumentResponse(BaseModel):
    id: str
    chatbot_id: str
    filename: str
    file_type: str
    file_size: int
    chunk_count: int
    status: str
    error_message: Optional[str] = None
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


# ─── Conversation & Message Schemas ──────────────────────────

class MessageResponse(BaseModel):
    id: str
    sender: str
    content: str
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class ConversationResponse(BaseModel):
    id: str
    chatbot_id: str
    session_id: str
    visitor_name: str
    status: str
    started_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    message_count: int = 0
    last_message: Optional[str] = None
    bot_name: Optional[str] = None

    model_config = {"from_attributes": True}


class ConversationDetailResponse(BaseModel):
    id: str
    chatbot_id: str
    session_id: str
    visitor_name: str
    status: str
    started_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    messages: List[MessageResponse] = []

    model_config = {"from_attributes": True}


# ─── Analytics Schemas ───────────────────────────────────────

class DashboardStats(BaseModel):
    total_bots: int
    total_conversations: int
    total_messages: int
    total_usage: int
    messages_today: int
    active_conversations: int


class BotStats(BaseModel):
    bot_id: str
    bot_name: str
    conversation_count: int
    message_count: int


class ChartDataPoint(BaseModel):
    label: str
    usage: int
    messages: int
    visits: int


# ─── Review Schemas ──────────────────────────────────────────

class ReviewCreate(BaseModel):
    rating: int  # 1-5
    comment: Optional[str] = None
    session_id: Optional[str] = None


class ReviewResponse(BaseModel):
    id: str
    chatbot_id: str
    chatbot_name: Optional[str] = None
    rating: int
    comment: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}
