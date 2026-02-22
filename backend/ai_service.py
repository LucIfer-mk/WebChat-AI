"""
AI Knowledge Base Service
- Extracts text from PDF / DOCX files
- Chunks text into manageable pieces
- Generates embeddings via OpenAI text-embedding-3-small
- Answers questions using RAG with strict guardrails
"""

from dotenv import load_dotenv
load_dotenv()

import os
import uuid
import io
import logging
import httpx
from typing import List, Optional

from openai import OpenAI
from PyPDF2 import PdfReader
from docx import Document as DocxDocument
from sqlalchemy.orm import Session
from sqlalchemy import text

from models import KnowledgeEntry, KnowledgeDocument, DocumentChunk

logger = logging.getLogger(__name__)

AI_PROVIDER = os.getenv("AI_PROVIDER", "openai").lower()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434/v1")

# Models selection based on provider
if AI_PROVIDER == "ollama":
    CHAT_MODEL = os.getenv("OLLAMA_CHAT_MODEL", "llama3")
    EMBEDDING_MODEL = os.getenv("OLLAMA_EMBEDDING_MODEL", "nomic-embed-text")
else:
    CHAT_MODEL = "gpt-4o-mini"
    EMBEDDING_MODEL = "text-embedding-3-small"

CHUNK_SIZE = 500       # ~500 words per chunk
CHUNK_OVERLAP = 50     # overlap for context continuity
TOP_K = 5              # number of chunks to retrieve
EMBEDDING_DIM = int(os.getenv("EMBEDDING_DIM", "1536"))


def _get_client() -> OpenAI:
    # Use a custom httpx client with trust_env=False to avoid "proxies" error in some environments
    http_client = httpx.Client(trust_env=False, timeout=60.0)

    if AI_PROVIDER == "openai":
        if not OPENAI_API_KEY or OPENAI_API_KEY == "your-openai-api-key-here":
            raise ValueError("OPENAI_API_KEY is not set. Please update your .env file.")
        return OpenAI(api_key=OPENAI_API_KEY, http_client=http_client)
    else:
        # Ollama / Local provider
        # Ollama often doesn't need an API key, so we use a dummy one
        return OpenAI(
            base_url=OLLAMA_BASE_URL,
            api_key="ollama", # dummy key
            http_client=http_client
        )


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  TEXT EXTRACTION
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract all text from a PDF file."""
    reader = PdfReader(io.BytesIO(file_bytes))
    text_parts = []
    for page in reader.pages:
        page_text = page.extract_text()
        if page_text:
            text_parts.append(page_text)
    return "\n\n".join(text_parts)


def extract_text_from_docx(file_bytes: bytes) -> str:
    """Extract all text from a Word (.docx) file."""
    doc = DocxDocument(io.BytesIO(file_bytes))
    text_parts = []
    for para in doc.paragraphs:
        if para.text.strip():
            text_parts.append(para.text)
    return "\n\n".join(text_parts)


def extract_text(file_bytes: bytes, filename: str) -> str:
    """Route to the correct extractor based on file extension."""
    ext = filename.lower().rsplit(".", 1)[-1] if "." in filename else ""
    if ext == "pdf":
        return extract_text_from_pdf(file_bytes)
    elif ext in ("docx", "doc"):
        return extract_text_from_docx(file_bytes)
    else:
        raise ValueError(f"Unsupported file type: .{ext}")


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  CHUNKING
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def chunk_text(full_text: str, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> List[str]:
    """Split text into overlapping chunks by word count."""
    words = full_text.split()
    if not words:
        return []

    chunks = []
    start = 0
    while start < len(words):
        end = start + chunk_size
        chunk = " ".join(words[start:end])
        if chunk.strip():
            chunks.append(chunk.strip())
        start = end - overlap

    return chunks


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  EMBEDDINGS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def generate_embeddings(texts: List[str]) -> List[List[float]]:
    """Generate embeddings for a list of texts using OpenAI."""
    client = _get_client()
    # Process in batches of 100 (OpenAI limit is 2048)
    all_embeddings = []
    batch_size = 10 if AI_PROVIDER == "ollama" else 100
    for i in range(0, len(texts), batch_size):
        batch = texts[i:i + batch_size]
        response = client.embeddings.create(
            model=EMBEDDING_MODEL,
            input=batch
        )
        for item in response.data:
            all_embeddings.append(item.embedding)
    return all_embeddings


def generate_single_embedding(text_input: str) -> List[float]:
    """Generate embedding for a single text."""
    client = _get_client()
    response = client.embeddings.create(
        model=EMBEDDING_MODEL,
        input=text_input
    )
    return response.data[0].embedding


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  DOCUMENT PROCESSING PIPELINE
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def process_document(
    db: Session,
    chatbot_id: str,
    document_id: str,
    file_bytes: bytes,
    filename: str
):
    """
    Full pipeline: extract text → chunk → embed → store in DB.
    Updates the document status throughout the process.
    """
    doc = db.query(KnowledgeDocument).filter(KnowledgeDocument.id == document_id).first()
    if not doc:
        return

    try:
        # Step 1: Extract text
        print(f"Extracting text from {filename}...")
        full_text = extract_text(file_bytes, filename)
        if not full_text.strip():
            print("Error: Extracted text is empty.")
            doc.status = "error"
            db.commit()
            return

        # Step 2: Chunk the text
        print(f"Chunking text... ({len(full_text)} characters)")
        chunks = chunk_text(full_text)
        if not chunks:
            print("Error: No chunks created.")
            doc.status = "error"
            db.commit()
            return

        # Step 3: Generate embeddings
        print(f"Generating embeddings for {len(chunks)} chunks using {EMBEDDING_MODEL}...")
        embeddings = generate_embeddings(chunks)
        print(f"Generated {len(embeddings)} embeddings successfully.")

        # Step 4: Store chunks with embeddings
        for idx, (chunk_text_content, embedding) in enumerate(zip(chunks, embeddings)):
            chunk = DocumentChunk(
                id=str(uuid.uuid4()),
                document_id=document_id,
                chatbot_id=chatbot_id,
                content=chunk_text_content,
                chunk_index=idx,
                embedding=embedding
            )
            db.add(chunk)

        doc.chunk_count = len(chunks)
        doc.status = "ready"
        db.commit()
        logger.info(f"Document {filename} processed: {len(chunks)} chunks created")

    except Exception as e:
        import traceback
        db.rollback()
        error_msg = str(e)
        logger.error(f"Error processing document {filename}: {error_msg}")
        traceback.print_exc()
        print(f"Error processing document: {error_msg}")
        try:
            # Re-fetch the document within a fresh transaction if possible
            doc = db.query(KnowledgeDocument).filter(KnowledgeDocument.id == document_id).first()
            if doc:
                doc.status = "error"
                doc.error_message = error_msg
                db.commit()
        except:
            db.rollback()


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  SEMANTIC SEARCH (VECTOR SIMILARITY)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def search_similar_chunks(
    db: Session,
    chatbot_id: str,
    query: str,
    top_k: int = TOP_K
) -> List[dict]:
    """
    Search for the most similar document chunks using cosine similarity.
    Returns the top_k most relevant chunks.
    """
    query_embedding = generate_single_embedding(query)

    # Use pgvector's cosine distance operator <=>
    # NOTE: Use CAST(...AS vector) instead of ::vector to avoid psycopg2
    # misinterpreting :: after the named parameter colon.
    results = db.execute(
        text(f"""
            SELECT id, content, chunk_index, document_id,
                   1 - (embedding <=> CAST(:query_embedding AS vector({EMBEDDING_DIM}))) AS similarity
            FROM document_chunks
            WHERE chatbot_id = :chatbot_id
            ORDER BY embedding <=> CAST(:query_embedding AS vector({EMBEDDING_DIM}))
            LIMIT :top_k
        """),
        {
            "query_embedding": str(query_embedding),
            "chatbot_id": chatbot_id,
            "top_k": top_k
        }
    ).fetchall()

    return [
        {
            "id": row[0],
            "content": row[1],
            "chunk_index": row[2],
            "document_id": row[3],
            "similarity": float(row[4]) if row[4] else 0.0,
        }
        for row in results
    ]


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  AI CHAT (RAG with strict guardrails)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SYSTEM_PROMPT = """You are a friendly and helpful AI assistant representing a specific business or website.
Please follow these guidelines carefully:
1. Only answer questions using the information provided in the context below. Do not rely on outside knowledge (except for basic greetings and polite conversation).
2. If the answer is not available in the context, respond with:
"I'm sorry, I don't have information about that in my knowledge base. Is there something else I can help you with?"
3. Never guess, assume, or create information that is not clearly stated in the context.
4. Keep your tone warm, conversational, and professional—like a helpful staff member assisting a customer.
5. If the user greets you (e.g., "hi", "hello"), respond politely and ask how you can assist them.
6. Keep responses clear, concise, and relevant. Avoid unnecessary details.
7. If a question can only be partially answered using the context, provide the available information and politely mention that you don’t have further details.
8. Prioritize accuracy over completeness. It’s better to say you don’t know than to provide incorrect information.
---
CONTEXT FROM KNOWLEDGE BASE:
{context}
---
CUSTOM Q&A RESPONSES (these take priority if matched exactly):
{custom_responses}
"""


def generate_ai_response(
    db: Session,
    chatbot_id: str,
    user_message: str,
    bot_name: str
) -> Optional[str]:
    """
    Generate an AI response using RAG:
    1. First check custom Q&A entries (exact/contains match)
    2. If no match, search vector DB for relevant chunks
    3. Use OpenAI to generate a response strictly based on context
    """

    # ── Step 1: Check custom Q&A entries (highest priority) ──
    lower_msg = user_message.lower().strip()

    # Check exact matches
    exact_entries = db.query(KnowledgeEntry).filter(
        KnowledgeEntry.chatbot_id == chatbot_id,
        KnowledgeEntry.is_exact_match == True,
    ).all()
    for entry in exact_entries:
        if entry.trigger.lower().strip() == lower_msg:
            return entry.response

    # Check contains matches
    contains_entries = db.query(KnowledgeEntry).filter(
        KnowledgeEntry.chatbot_id == chatbot_id,
        KnowledgeEntry.is_exact_match == False,
    ).all()
    for entry in contains_entries:
        if entry.trigger.lower().strip() in lower_msg:
            return entry.response

    # ── Step 2: Check if we have any vector knowledge ──
    chunk_count = db.execute(
        text("SELECT COUNT(*) FROM document_chunks WHERE chatbot_id = :cid"),
        {"cid": chatbot_id}
    ).scalar()

    # Also gather custom Q&A for context
    all_entries = db.query(KnowledgeEntry).filter(
        KnowledgeEntry.chatbot_id == chatbot_id
    ).all()

    custom_responses_text = ""
    if all_entries:
        custom_responses_text = "\n".join([
            f"Q: {e.trigger}\nA: {e.response}"
            for e in all_entries
        ])

    if chunk_count == 0 and not all_entries:
        # No knowledge at all — fallback
        return None

    # ── Step 3: Semantic search for relevant document chunks ──
    context_text = ""
    if chunk_count > 0:
        try:
            similar_chunks = search_similar_chunks(db, chatbot_id, user_message)
            if similar_chunks:
                context_parts = []
                for i, chunk in enumerate(similar_chunks, 1):
                    if chunk["similarity"] > 0.3:  # Only include reasonably similar chunks
                        context_parts.append(f"[Source {i}]: {chunk['content']}")
                context_text = "\n\n".join(context_parts)
        except Exception as e:
            import traceback
            db.rollback()
            logger.error(f"Error searching chunks: {e}")
            traceback.print_exc()
            print(f"Vector search error: {e}")

    if not context_text and not custom_responses_text:
        return None

    # ── Step 4: Generate response with OpenAI ──
    try:
        client = _get_client()

        system_message = SYSTEM_PROMPT.format(
            context=context_text if context_text else "No document context available.",
            custom_responses=custom_responses_text if custom_responses_text else "No custom Q&A responses configured."
        )

        response = client.chat.completions.create(
            model=CHAT_MODEL,
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": user_message}
            ],
            temperature=0.3,       # Low temperature for factual answers
            max_tokens=500,
            top_p=0.9,
        )

        return response.choices[0].message.content.strip()

    except Exception as e:
        import traceback
        logger.error(f"OpenAI API error: {e}")
        traceback.print_exc()
        return None
