import os
import uuid
import shutil
from typing import List, Optional
from datetime import datetime, timezone, timedelta

from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy import func, cast, Date
from sqlalchemy.orm import Session
from dotenv import load_dotenv

from database import engine, get_db, Base
from models import User, Chatbot, KnowledgeEntry, Conversation, Message
from schemas import (
    UserRegister, UserLogin, UserResponse,
    ChatbotCreate, ChatbotUpdate, ChatbotResponse,
    KnowledgeEntryCreate, KnowledgeEntryUpdate, KnowledgeEntryResponse,
    ConversationResponse, ConversationDetailResponse,
    DashboardStats, BotStats, ChartDataPoint,
)
from passlib.context import CryptContext

load_dotenv()

BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="WebChat AI API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")


# ─── Auth Logic ──────────────────────────────────────────
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  HEALTH CHECK
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@app.get("/")
def health():
    return {"status": "ok", "message": "WebChat AI API is running"}


@app.post("/api/auth/register", response_model=UserResponse)
def register(payload: UserRegister, db: Session = Depends(get_db)):
    # Check if user exists
    existing_user = db.query(User).filter(User.email == payload.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user = User(
        name=payload.name,
        email=payload.email,
        password_hash=get_password_hash(payload.password)
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@app.post("/api/auth/login", response_model=UserResponse)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    return user


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  CHATBOT CRUD
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@app.post("/api/chatbots", response_model=ChatbotResponse)
def create_chatbot(payload: ChatbotCreate, db: Session = Depends(get_db)):
    bot = Chatbot(
        name=payload.name,
        user_id=payload.user_id,
        welcome_message=payload.welcome_message,
        primary_color=payload.primary_color,
        header_color=payload.header_color,
        bubble_color=payload.bubble_color,
        text_color=payload.text_color,
        position=payload.position,
    )
    db.add(bot)
    db.commit()
    db.refresh(bot)
    return bot


@app.post("/api/chatbots/{bot_id}/icon", response_model=ChatbotResponse)
def upload_icon(bot_id: str, icon: UploadFile = File(...), db: Session = Depends(get_db)):
    bot = db.query(Chatbot).filter(Chatbot.id == bot_id).first()
    if not bot:
        raise HTTPException(status_code=404, detail="Chatbot not found")
    ext = os.path.splitext(icon.filename)[1] if icon.filename else ".png"
    filename = f"{bot_id}_{uuid.uuid4().hex[:8]}{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)
    with open(filepath, "wb") as f:
        shutil.copyfileobj(icon.file, f)
    bot.icon_url = f"{BACKEND_URL}/uploads/{filename}"
    db.commit()
    db.refresh(bot)
    return bot


@app.get("/api/chatbots", response_model=List[ChatbotResponse])
def list_chatbots(user_id: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Chatbot)
    if user_id:
        query = query.filter(Chatbot.user_id == user_id)
    return query.order_by(Chatbot.created_at.desc()).all()


@app.get("/api/chatbots/{bot_id}", response_model=ChatbotResponse)
def get_chatbot(bot_id: str, db: Session = Depends(get_db)):
    bot = db.query(Chatbot).filter(Chatbot.id == bot_id).first()
    if not bot:
        raise HTTPException(status_code=404, detail="Chatbot not found")
    return bot


@app.put("/api/chatbots/{bot_id}", response_model=ChatbotResponse)
def update_chatbot(bot_id: str, payload: ChatbotUpdate, db: Session = Depends(get_db)):
    bot = db.query(Chatbot).filter(Chatbot.id == bot_id).first()
    if not bot:
        raise HTTPException(status_code=404, detail="Chatbot not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(bot, field, value)
    db.commit()
    db.refresh(bot)
    return bot


@app.delete("/api/chatbots/{bot_id}")
def delete_chatbot(bot_id: str, db: Session = Depends(get_db)):
    bot = db.query(Chatbot).filter(Chatbot.id == bot_id).first()
    if not bot:
        raise HTTPException(status_code=404, detail="Chatbot not found")
    db.delete(bot)
    db.commit()
    return {"detail": "Chatbot deleted"}


@app.get("/api/chatbots/{bot_id}/embed")
def get_embed_code(bot_id: str, db: Session = Depends(get_db)):
    bot = db.query(Chatbot).filter(Chatbot.id == bot_id).first()
    if not bot:
        raise HTTPException(status_code=404, detail="Chatbot not found")
    script_tag = f'<script src="{BACKEND_URL}/widget.js" data-chatbot-id="{bot.id}"></script>'
    return {"script_tag": script_tag, "chatbot_id": bot.id}


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  KNOWLEDGE BASE CRUD
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@app.get("/api/chatbots/{bot_id}/knowledge", response_model=List[KnowledgeEntryResponse])
def list_knowledge(bot_id: str, db: Session = Depends(get_db)):
    bot = db.query(Chatbot).filter(Chatbot.id == bot_id).first()
    if not bot:
        raise HTTPException(status_code=404, detail="Chatbot not found")
    return db.query(KnowledgeEntry).filter(KnowledgeEntry.chatbot_id == bot_id) \
             .order_by(KnowledgeEntry.created_at.desc()).all()


@app.post("/api/chatbots/{bot_id}/knowledge", response_model=KnowledgeEntryResponse)
def create_knowledge(bot_id: str, payload: KnowledgeEntryCreate, db: Session = Depends(get_db)):
    bot = db.query(Chatbot).filter(Chatbot.id == bot_id).first()
    if not bot:
        raise HTTPException(status_code=404, detail="Chatbot not found")
    entry = KnowledgeEntry(
        chatbot_id=bot_id,
        trigger=payload.trigger,
        response=payload.response,
        is_exact_match=payload.is_exact_match,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@app.put("/api/chatbots/{bot_id}/knowledge/{entry_id}", response_model=KnowledgeEntryResponse)
def update_knowledge(bot_id: str, entry_id: str, payload: KnowledgeEntryUpdate,
                     db: Session = Depends(get_db)):
    entry = db.query(KnowledgeEntry).filter(
        KnowledgeEntry.id == entry_id, KnowledgeEntry.chatbot_id == bot_id
    ).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Knowledge entry not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(entry, field, value)
    db.commit()
    db.refresh(entry)
    return entry


@app.delete("/api/chatbots/{bot_id}/knowledge/{entry_id}")
def delete_knowledge(bot_id: str, entry_id: str, db: Session = Depends(get_db)):
    entry = db.query(KnowledgeEntry).filter(
        KnowledgeEntry.id == entry_id, KnowledgeEntry.chatbot_id == bot_id
    ).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Knowledge entry not found")
    db.delete(entry)
    db.commit()
    return {"detail": "Knowledge entry deleted"}


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  WIDGET ENDPOINTS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@app.get("/widget.js")
def serve_widget():
    widget_path = os.path.join(os.path.dirname(__file__), "widget.js")
    if not os.path.exists(widget_path):
        raise HTTPException(status_code=404, detail="Widget not found")
    return FileResponse(widget_path, media_type="application/javascript")


@app.get("/api/widget/config/{bot_id}")
def widget_config(bot_id: str, db: Session = Depends(get_db)):
    bot = db.query(Chatbot).filter(Chatbot.id == bot_id).first()
    if not bot:
        raise HTTPException(status_code=404, detail="Chatbot not found")
    return bot.to_dict()


@app.post("/api/widget/chat/{bot_id}")
def widget_chat(bot_id: str, body: dict, db: Session = Depends(get_db)):
    bot = db.query(Chatbot).filter(Chatbot.id == bot_id).first()
    if not bot:
        raise HTTPException(status_code=404, detail="Chatbot not found")

    user_message = body.get("message", "")
    session_id = body.get("session_id", str(uuid.uuid4()))

    # ── Find or create conversation ──
    conversation = db.query(Conversation).filter(
        Conversation.chatbot_id == bot_id,
        Conversation.session_id == session_id,
        Conversation.status == "active",
    ).first()

    if not conversation:
        conversation = Conversation(
            chatbot_id=bot_id,
            session_id=session_id,
            visitor_name=body.get("visitor_name", "Visitor"),
        )
        db.add(conversation)
        db.commit()
        db.refresh(conversation)

    # ── Save user message ──
    user_msg = Message(
        conversation_id=conversation.id,
        sender="user",
        content=user_message,
    )
    db.add(user_msg)
    db.commit()

    # ── Search knowledge base for a matching response ──
    reply = None
    lower_msg = user_message.lower().strip()

    # 1. Check exact matches first
    exact_entries = db.query(KnowledgeEntry).filter(
        KnowledgeEntry.chatbot_id == bot_id,
        KnowledgeEntry.is_exact_match == True,
    ).all()
    for entry in exact_entries:
        if entry.trigger.lower().strip() == lower_msg:
            reply = entry.response
            break

    # 2. Check contains matches
    if not reply:
        contains_entries = db.query(KnowledgeEntry).filter(
            KnowledgeEntry.chatbot_id == bot_id,
            KnowledgeEntry.is_exact_match == False,
        ).all()
        for entry in contains_entries:
            if entry.trigger.lower().strip() in lower_msg:
                reply = entry.response
                break

    # 3. Fallback
    if not reply:
        reply = f"Thanks for your message! I'm {bot.name}. I don't have a specific answer for that yet, but feel free to ask me anything else!"

    # ── Save bot response ──
    bot_msg = Message(
        conversation_id=conversation.id,
        sender="bot",
        content=reply,
    )
    db.add(bot_msg)

    # Update conversation timestamp
    conversation.updated_at = datetime.now(timezone.utc)
    db.commit()

    return {"reply": reply, "session_id": session_id, "conversation_id": conversation.id}


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  CONVERSATIONS & ANALYTICS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@app.get("/api/conversations", response_model=List[ConversationResponse])
def list_conversations(bot_id: str = None, user_id: str = None, limit: int = 20, db: Session = Depends(get_db)):
    query = db.query(Conversation)
    if bot_id:
        query = query.filter(Conversation.chatbot_id == bot_id)
    if user_id:
        query = query.join(Chatbot).filter(Chatbot.user_id == user_id)
    
    conversations = query.order_by(Conversation.updated_at.desc()).limit(limit).all()

    result = []
    for conv in conversations:
        msg_count = db.query(func.count(Message.id)).filter(
            Message.conversation_id == conv.id
        ).scalar()
        last_msg = db.query(Message).filter(
            Message.conversation_id == conv.id
        ).order_by(Message.created_at.desc()).first()
        bot = db.query(Chatbot).filter(Chatbot.id == conv.chatbot_id).first()

        result.append(ConversationResponse(
            id=conv.id,
            chatbot_id=conv.chatbot_id,
            session_id=conv.session_id,
            visitor_name=conv.visitor_name,
            status=conv.status,
            started_at=conv.started_at,
            updated_at=conv.updated_at,
            message_count=msg_count or 0,
            last_message=last_msg.content if last_msg else None,
            bot_name=bot.name if bot else None,
        ))
    return result


@app.get("/api/conversations/{conv_id}", response_model=ConversationDetailResponse)
def get_conversation(conv_id: str, db: Session = Depends(get_db)):
    conv = db.query(Conversation).filter(Conversation.id == conv_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conv


@app.get("/api/analytics/dashboard", response_model=DashboardStats)
def dashboard_stats(user_id: Optional[str] = None, db: Session = Depends(get_db)):
    bot_query = db.query(Chatbot)
    conv_query = db.query(Conversation)
    msg_query = db.query(Message)
    
    if user_id:
        bot_query = bot_query.filter(Chatbot.user_id == user_id)
        conv_query = conv_query.join(Chatbot).filter(Chatbot.user_id == user_id)
        msg_query = msg_query.join(Conversation).join(Chatbot).filter(Chatbot.user_id == user_id)

    total_bots = bot_query.with_entities(func.count(Chatbot.id)).scalar() or 0
    total_conversations = conv_query.with_entities(func.count(Conversation.id)).scalar() or 0
    total_messages = msg_query.with_entities(func.count(Message.id)).scalar() or 0
    
    active_conversations = conv_query.filter(Conversation.status == "active") \
                                     .with_entities(func.count(Conversation.id)).scalar() or 0

    # Messages today
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    messages_today = msg_query.filter(Message.created_at >= today_start) \
                              .with_entities(func.count(Message.id)).scalar() or 0

    return DashboardStats(
        total_bots=total_bots,
        total_conversations=total_conversations,
        total_messages=total_messages,
        messages_today=messages_today,
        active_conversations=active_conversations,
    )


@app.get("/api/analytics/chart", response_model=List[ChartDataPoint])
def chart_data(days: int = 30, db: Session = Depends(get_db)):
    """Return daily conversation & message counts for the last N days."""
    result = []
    now = datetime.now(timezone.utc)

    for i in range(days - 1, -1, -1):
        day = now - timedelta(days=i)
        day_start = day.replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + timedelta(days=1)

        conv_count = db.query(func.count(Conversation.id)).filter(
            Conversation.started_at >= day_start,
            Conversation.started_at < day_end,
        ).scalar() or 0

        msg_count = db.query(func.count(Message.id)).filter(
            Message.created_at >= day_start,
            Message.created_at < day_end,
        ).scalar() or 0

        result.append(ChartDataPoint(
            label=day_start.strftime("%b %d"),
            conversations=conv_count,
            messages=msg_count,
        ))
    return result


@app.get("/api/analytics/bots", response_model=List[BotStats])
def bot_stats(db: Session = Depends(get_db)):
    """Per-bot conversation & message stats."""
    bots = db.query(Chatbot).all()
    result = []
    for bot in bots:
        conv_count = db.query(func.count(Conversation.id)).filter(
            Conversation.chatbot_id == bot.id
        ).scalar() or 0
        msg_count = db.query(func.count(Message.id)).join(Conversation).filter(
            Conversation.chatbot_id == bot.id
        ).scalar() or 0
        result.append(BotStats(
            bot_id=bot.id,
            bot_name=bot.name,
            conversation_count=conv_count,
            message_count=msg_count,
        ))
    return result
