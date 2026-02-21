"""
AI Knowledge Base Service
- Extracts text from PDF / DOCX files
- Chunks text into manageable pieces
- Generates embeddings via OpenAI text-embedding-3-small
- Answers questions using RAG with strict guardrails
"""

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

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
EMBEDDING_MODEL = "text-embedding-3-small"     # 1536 dimensions
CHAT_MODEL = "gpt-4o-mini"                     # cost-effective, great for RAG
CHUNK_SIZE = 500       # ~500 words per chunk
CHUNK_OVERLAP = 50     # overlap for context continuity
TOP_K = 5              # number of chunks to retrieve


def _get_client() -> OpenAI:
    if not OPENAI_API_KEY or OPENAI_API_KEY == "your-openai-api-key-here":
        raise ValueError("OPENAI_API_KEY is not set. Please update your .env file.")
    
    # Use a custom httpx client with trust_env=False to avoid "proxies" error in some environments
    # This prevents the client from trying to use system proxies that might conflict with the library.
    http_client = httpx.Client(trust_env=False, timeout=60.0)
    return OpenAI(api_key=OPENAI_API_KEY, http_client=http_client)


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
    batch_size = 100
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
        full_text = extract_text(file_bytes, filename)
        if not full_text.strip():
            doc.status = "error"
            db.commit()
            return

        # Step 2: Chunk the text
        chunks = chunk_text(full_text)
        if not chunks:
            doc.status = "error"
            db.commit()
            return

        # Step 3: Generate embeddings
        embeddings = generate_embeddings(chunks)

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
        error_msg = str(e)
        logger.error(f"Error processing document {filename}: {error_msg}")
        doc.status = "error"
        doc.error_message = error_msg
        db.commit()


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
    results = db.execute(
        text("""
            SELECT id, content, chunk_index, document_id,
                   1 - (embedding <=> :query_embedding::vector) AS similarity
            FROM document_chunks
            WHERE chatbot_id = :chatbot_id
            ORDER BY embedding <=> :query_embedding::vector
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

SYSTEM_PROMPT = """You are a helpful AI assistant for a specific business/website. You MUST follow these rules STRICTLY:

1. ONLY answer questions using the provided context below. Do NOT use any external knowledge other than basic greetings.
2. If the answer cannot be found in the provided context, respond with: "I'm sorry, I don't have information about that in my knowledge base. Is there something else I can help you with?"
3. Do NOT make up, infer, or hallucinate any information that is not explicitly in the context.
4. Be conversational, friendly, and helpful within the bounds of the provided information.
5. If the user greets you (hello, hi, etc.), respond warmly and ask how you can help.
6. Keep your answers concise and relevant.
7. If a question is partially answerable from the context, answer only what you can and note that you don't have more information on the rest.

CONTEXT FROM KNOWLEDGE BASE:
{context}

CUSTOM Q&A RESPONSES (exact matches take priority):
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
            logger.error(f"Error searching chunks: {e}")

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
        logger.error(f"OpenAI API error: {e}")
        return None
