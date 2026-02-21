import os
import uuid
import logging
from typing import List, Optional
from datetime import datetime, timezone, timedelta

from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy import func, cast, Date, text
from sqlalchemy.orm import Session
from dotenv import load_dotenv

from database import engine, get_db, Base, init_pgvector, SessionLocal
from models import (
    User, Chatbot, KnowledgeEntry, KnowledgeDocument, DocumentChunk,
    Conversation, Message, Review, Visit, Usage
)
from schemas import (
    UserRegister, UserLogin, UserResponse,
    ChatbotCreate, ChatbotUpdate, ChatbotResponse,
    KnowledgeEntryCreate, KnowledgeEntryUpdate, KnowledgeEntryResponse,
    KnowledgeDocumentResponse,
    ConversationResponse, ConversationDetailResponse,
    DashboardStats, BotStats, ChartDataPoint,
    ReviewCreate, ReviewResponse,
)
from ai_service import process_document, generate_ai_response
import bcrypt

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")

# Initialize pgvector extension and create tables
init_pgvector()
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


def process_document_task(bot_id: str, doc_id: str, file_bytes: bytes, filename: str):
    """Background task to process document with its own DB session."""
    with SessionLocal() as db:
        try:
            process_document(db, bot_id, doc_id, file_bytes, filename)
        except Exception as e:
            error_msg = str(e)
            logger.error(f"Background processing error: {error_msg}")
            doc = db.query(KnowledgeDocument).filter(KnowledgeDocument.id == doc_id).first()
            if doc:
                doc.status = "error"
                doc.error_message = error_msg
                db.commit()


# ─── Schema Migration (Simple) ───────────────────────────
def run_migrations():
    """Ensure all required columns exist."""
    # Check for error_message column
    with engine.connect() as conn:
        try:
            conn.execute(text("SELECT error_message FROM knowledge_documents LIMIT 1"))
        except Exception:
            # Need to rollback the failed transaction before trying ALTER
            conn.rollback()
            logger.info("Adding error_message column to knowledge_documents...")
            try:
                conn.execute(text("ALTER TABLE knowledge_documents ADD COLUMN error_message TEXT"))
                conn.commit()
            except Exception as e:
                logger.error(f"Migration error: {e}")
                conn.rollback()

run_migrations()


# ─── Auth Logic ──────────────────────────────────────────
def get_password_hash(password: str):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str):
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))


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
#  KNOWLEDGE DOCUMENTS (PDF / DOCX uploads)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@app.get("/api/chatbots/{bot_id}/documents", response_model=List[KnowledgeDocumentResponse])
def list_documents(bot_id: str, db: Session = Depends(get_db)):
    bot = db.query(Chatbot).filter(Chatbot.id == bot_id).first()
    if not bot:
        raise HTTPException(status_code=404, detail="Chatbot not found")
    return db.query(KnowledgeDocument).filter(
        KnowledgeDocument.chatbot_id == bot_id
    ).order_by(KnowledgeDocument.created_at.desc()).all()


@app.post("/api/chatbots/{bot_id}/documents", response_model=KnowledgeDocumentResponse)
def upload_document(
    bot_id: str,
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    bot = db.query(Chatbot).filter(Chatbot.id == bot_id).first()
    if not bot:
        raise HTTPException(status_code=404, detail="Chatbot not found")

    # Validate file type
    filename = file.filename or "document"
    ext = filename.lower().rsplit(".", 1)[-1] if "." in filename else ""
    if ext not in ("pdf", "docx", "doc"):
        raise HTTPException(
            status_code=400,
            detail="Only PDF and Word (.docx) files are supported."
        )

    # Read file content
    file_bytes = file.file.read()
    file_size = len(file_bytes)

    # Create document record
    doc = KnowledgeDocument(
        chatbot_id=bot_id,
        filename=filename,
        file_type=ext,
        file_size=file_size,
        status="processing"
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    # Add processing to background tasks
    background_tasks.add_task(process_document_task, bot_id, doc.id, file_bytes, filename)

    return doc


@app.delete("/api/chatbots/{bot_id}/documents/{doc_id}")
def delete_document(bot_id: str, doc_id: str, db: Session = Depends(get_db)):
    doc = db.query(KnowledgeDocument).filter(
        KnowledgeDocument.id == doc_id,
        KnowledgeDocument.chatbot_id == bot_id
    ).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    db.delete(doc)
    db.commit()
    return {"detail": "Document and all associated chunks deleted"}


@app.get("/api/chatbots/{bot_id}/documents/{doc_id}/status")
def document_status(bot_id: str, doc_id: str, db: Session = Depends(get_db)):
    doc = db.query(KnowledgeDocument).filter(
        KnowledgeDocument.id == doc_id,
        KnowledgeDocument.chatbot_id == bot_id
    ).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return {
        "id": doc.id,
        "status": doc.status,
        "chunk_count": doc.chunk_count,
        "filename": doc.filename
    }


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
def widget_config(bot_id: str, session_id: Optional[str] = None, db: Session = Depends(get_db)):
    bot = db.query(Chatbot).filter(Chatbot.id == bot_id).first()
    if not bot:
        raise HTTPException(status_code=404, detail="Chatbot not found")
    
    # Record a visit
    visit = Visit(chatbot_id=bot_id, session_id=session_id)
    db.add(visit)
    db.commit()
    
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

    # ── Generate AI-powered response ──
    reply = None
    try:
        reply = generate_ai_response(db, bot_id, user_message, bot.name)
    except Exception as e:
        logger.error(f"AI response error: {e}")

    # Fallback if AI is not configured or fails
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


@app.post("/api/widget/review/{bot_id}")
def submit_review(bot_id: str, payload: ReviewCreate, db: Session = Depends(get_db)):
    bot = db.query(Chatbot).filter(Chatbot.id == bot_id).first()
    if not bot:
        raise HTTPException(status_code=404, detail="Chatbot not found")
    
    review = Review(
        chatbot_id=bot_id,
        rating=payload.rating,
        comment=payload.comment,
        session_id=payload.session_id,
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    return {"status": "success", "review_id": review.id}


@app.post("/api/widget/usage/{bot_id}")
def record_usage(bot_id: str, body: dict, db: Session = Depends(get_db)):
    usage = Usage(
        chatbot_id=bot_id,
        session_id=body.get("session_id")
    )
    db.add(usage)
    db.commit()
    return {"status": "success"}


@app.get("/api/reviews", response_model=List[ReviewResponse])
def list_reviews(user_id: Optional[str] = None, bot_id: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Review)
    
    if bot_id:
        query = query.filter(Review.chatbot_id == bot_id)
    elif user_id:
        query = query.join(Chatbot).filter(Chatbot.user_id == user_id)
        
    reviews = query.order_by(Review.created_at.desc()).all()
    
    result = []
    for r in reviews:
        bot = db.query(Chatbot).filter(Chatbot.id == r.chatbot_id).first()
        result.append(ReviewResponse(
            id=r.id,
            chatbot_id=r.chatbot_id,
            chatbot_name=bot.name if bot else "Unknown",
            rating=r.rating,
            comment=r.comment,
            created_at=r.created_at,
        ))
    return result


@app.get("/api/analytics/reviews/summary")
def review_summary(user_id: Optional[str] = None, bot_id: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Review)
    if bot_id:
        query = query.filter(Review.chatbot_id == bot_id)
    elif user_id:
        query = query.join(Chatbot).filter(Chatbot.user_id == user_id)
    
    total = query.count()
    
    # Labels: Excellent (5), Good (4), Average (3), Poor (2), Terrible (1)
    results = []
    labels = ["Terrible", "Poor", "Average", "Good", "Excellent"]
    for i in range(1, 6):
        count = query.filter(Review.rating == i).count()
        percentage = (count / total) * 100 if total > 0 else 0
        results.append({"label": labels[i-1], "value": round(percentage)})
    
    return list(reversed(results))


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
def dashboard_stats(user_id: Optional[str] = None, bot_id: Optional[str] = None, db: Session = Depends(get_db)):
    bot_query = db.query(Chatbot)
    conv_query = db.query(Conversation)
    msg_query = db.query(Message)
    usage_query = db.query(Usage)
    
    if bot_id:
        bot_query = bot_query.filter(Chatbot.id == bot_id)
        conv_query = conv_query.filter(Conversation.chatbot_id == bot_id)
        msg_query = msg_query.join(Conversation).filter(Conversation.chatbot_id == bot_id)
        usage_query = usage_query.filter(Usage.chatbot_id == bot_id)
    elif user_id:
        bot_query = bot_query.filter(Chatbot.user_id == user_id)
        conv_query = conv_query.join(Chatbot).filter(Chatbot.user_id == user_id)
        msg_query = msg_query.join(Conversation).join(Chatbot).filter(Chatbot.user_id == user_id)
        usage_query = usage_query.join(Chatbot).filter(Chatbot.user_id == user_id)

    total_bots = bot_query.with_entities(func.count(Chatbot.id)).scalar() or 0
    total_conversations = conv_query.with_entities(func.count(Conversation.id)).scalar() or 0
    total_messages = msg_query.with_entities(func.count(Message.id)).scalar() or 0
    total_usage = usage_query.with_entities(func.count(Usage.id)).scalar() or 0
    
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
        total_usage=total_usage,
        messages_today=messages_today,
        active_conversations=active_conversations,
    )


@app.get("/api/analytics/chart", response_model=List[ChartDataPoint])
def chart_data(days: int = 30, user_id: Optional[str] = None, bot_id: Optional[str] = None, db: Session = Depends(get_db)):
    """Return daily conversation, message & visit counts for the last N days."""
    result = []
    now = datetime.now(timezone.utc)

    for i in range(days - 1, -1, -1):
        day = now - timedelta(days=i)
        day_start = day.replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + timedelta(days=1)

        usage_query = db.query(func.count(Usage.id)).filter(
            Usage.created_at >= day_start,
            Usage.created_at < day_end,
        )
        msg_query = db.query(func.count(Message.id)).filter(
            Message.created_at >= day_start,
            Message.created_at < day_end,
        )
        visit_query = db.query(func.count(Visit.id)).filter(
            Visit.created_at >= day_start,
            Visit.created_at < day_end,
        )

        if bot_id:
            usage_query = usage_query.filter(Usage.chatbot_id == bot_id)
            msg_query = msg_query.join(Conversation).filter(Conversation.chatbot_id == bot_id)
            visit_query = visit_query.filter(Visit.chatbot_id == bot_id)
        elif user_id:
            usage_query = usage_query.join(Chatbot).filter(Chatbot.user_id == user_id)
            msg_query = msg_query.join(Conversation).join(Chatbot).filter(Chatbot.user_id == user_id)
            visit_query = visit_query.join(Chatbot).filter(Chatbot.user_id == user_id)

        usage_count = usage_query.scalar() or 0
        msg_count = msg_query.scalar() or 0
        visit_count = visit_query.scalar() or 0

        result.append(ChartDataPoint(
            label=day_start.strftime("%b %d"),
            usage=usage_count,
            messages=msg_count,
            visits=visit_count,
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
