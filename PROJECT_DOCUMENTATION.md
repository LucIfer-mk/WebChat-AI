# 📘 WebChat AI — Complete Project Documentation

> **Last Updated:** February 2026  
> **Version:** 2.0.0  
> This document is a single source of truth for the entire WebChat AI project. Use it to understand the architecture, find specific code, make changes, and onboard quickly.

---

## 📑 Table of Contents

1. [Project Overview](#1-project-overview)
2. [Project Outcome / What It Does](#2-project-outcome--what-it-does)
3. [Folder & File Structure](#3-folder--file-structure)
4. [Languages & Technologies Used](#4-languages--technologies-used)
5. [Python Packages (Backend)](#5-python-packages-backend)
6. [Node / Frontend Packages](#6-node--frontend-packages)
7. [Database Structure](#7-database-structure)
8. [Backend Architecture](#8-backend-architecture)
9. [Frontend Architecture](#9-frontend-architecture)
10. [AI / RAG Pipeline](#10-ai--rag-pipeline)
11. [Widget (Embeddable Chat)](#11-widget-embeddable-chat)
12. [Environment Variables](#12-environment-variables)
13. [All API Endpoints Reference](#13-all-api-endpoints-reference)
14. [Code Location Quick Reference](#14-code-location-quick-reference)
15. [How to Run the Project](#15-how-to-run-the-project)

---

## 1. Project Overview

**WebChat AI** is a SaaS platform that lets business owners create, customize, and embed AI-powered chat widgets on their websites. It supports:

- Creating multiple chatbots per user
- Training bots with custom Q&A entries and uploaded PDF/Word documents
- RAG (Retrieval-Augmented Generation) using vector embeddings for intelligent document-based answers
- An embeddable JavaScript widget that works on any website
- A full management dashboard with analytics, conversation history, and reviews

---

## 2. Project Outcome / What It Does

| Feature                   | Description                                                                  |
| ------------------------- | ---------------------------------------------------------------------------- |
| **Chatbot Builder**       | Create & configure bots with name, colors, welcome message, icon, position   |
| **Knowledge Base**        | Add custom Q&A entries or upload PDF/DOCX documents                          |
| **AI Answering**          | Uses OpenAI GPT-4o-mini (or local Ollama) to answer questions from documents |
| **Embeddable Widget**     | One `<script>` tag embeds the chatbot on any website                         |
| **Conversation Tracking** | Every chat session is stored with full message history                       |
| **Analytics Dashboard**   | Visits, usage, messages, conversations charted over time                     |
| **Reviews System**        | Visitors rate the bot (1–5 stars) after closing the chat                     |
| **User Auth**             | Register/login with email & hashed password                                  |
| **Per-Bot Analytics**     | Filter all analytics to a specific bot                                       |

---

## 3. Folder & File Structure

```
WebChat-AI/
│
├── Backend/                        ← Python FastAPI backend
│   ├── main.py                     ← ALL API routes (single file)
│   ├── models.py                   ← SQLAlchemy ORM database models
│   ├── schemas.py                  ← Pydantic request/response schemas
│   ├── database.py                 ← DB engine, session, pgvector init
│   ├── ai_service.py               ← AI pipeline: embeddings, RAG, chat
│   ├── widget.js                   ← The embeddable chat widget (served as static file)
│   ├── requirements.txt            ← Python dependencies
│   ├── .env                        ← Environment variables (secrets, config)
│   └── uploads/                    ← Bot icon images stored here
│
├── landing/                        ← Next.js frontend (dashboard + landing)
│   ├── app/
│   │   ├── page.tsx                ← Landing page (login/signup entry point)
│   │   ├── layout.tsx              ← Root layout + font setup
│   │   ├── globals.css             ← Global CSS reset & design tokens
│   │   ├── landing.module.css      ← Landing page styles
│   │   ├── auth.module.css         ← Login/signup page styles
│   │   ├── login/
│   │   │   └── page.tsx            ← Login page
│   │   ├── signup/
│   │   │   └── page.tsx            ← Signup / register page
│   │   └── (dashboard)/            ← Dashboard route group (protected layout)
│   │       ├── layout.tsx          ← Dashboard layout (sidebar + header)
│   │       ├── layout.module.css   ← Dashboard layout styles
│   │       ├── dashboard/
│   │       │   └── page.tsx        ← Main dashboard (stats + charts + recent convos)
│   │       ├── chat-bots/
│   │       │   └── page.tsx        ← Chatbot management (create, edit, embed, delete)
│   │       ├── analytics/
│   │       │   └── page.tsx        ← Analytics page with bot filter dropdown
│   │       ├── reviews/
│   │       │   └── page.tsx        ← Reviews page (star ratings from visitors)
│   │       ├── billing/
│   │       │   └── page.tsx        ← Billing page (placeholder)
│   │       └── setting/
│   │           └── page.tsx        ← Settings page (placeholder)
│   │
│   ├── components/
│   │   ├── Sidebar.tsx             ← Navigation sidebar component
│   │   ├── Sidebar.module.css
│   │   ├── DashboardHeader.tsx     ← Top header with user info
│   │   ├── DashboardHeader.module.css
│   │   ├── StatsCard.tsx           ← Generic stat display card
│   │   ├── StatsCard.module.css
│   │   ├── VisitsChart.tsx         ← Recharts line/bar chart
│   │   ├── RecentConversations.tsx ← Recent conversations list
│   │   ├── RecentConversations.module.css
│   │   ├── PlanUsage.tsx           ← Plan usage bar component
│   │   ├── ReviewProgress.tsx      ← Star rating breakdown bars
│   │   └── ReviewProgress.module.css
│   │
│   ├── next.config.ts              ← Next.js config (API proxy to backend)
│   ├── tsconfig.json               ← TypeScript config
│   └── package.json                ← Node dependencies
│
├── seed_analytics.py               ← Dev script: seed fake analytics data
├── seed_bot_analytics.py           ← Dev script: seed bot-specific analytics
└── Next Step.md                    ← Personal development notes
```

---

## 4. Languages & Technologies Used

| Layer                  | Language / Tech           | Purpose                                                     |
| ---------------------- | ------------------------- | ----------------------------------------------------------- |
| **Backend**            | Python 3.13               | API server, AI logic, DB access                             |
| **API Framework**      | FastAPI                   | REST API with auto-generated OpenAPI docs                   |
| **ASGI Server**        | Uvicorn                   | Runs FastAPI in development and production                  |
| **Database**           | PostgreSQL                | Primary relational database                                 |
| **Vector Extension**   | pgvector                  | Stores and queries vector embeddings in PostgreSQL          |
| **ORM**                | SQLAlchemy 2.0            | Database models and queries                                 |
| **Schema Validation**  | Pydantic v2               | Request/response validation and serialization               |
| **AI Provider**        | OpenAI / Ollama           | GPT-4o-mini for chat, text-embedding-3-small for embeddings |
| **Frontend**           | TypeScript + React 19     | UI components and pages                                     |
| **Frontend Framework** | Next.js 16 (App Router)   | File-based routing, SSR, API proxy                          |
| **Charting**           | Recharts                  | Analytics charts (line, bar)                                |
| **Icons**              | Lucide React              | Icon library used across all pages                          |
| **CSS**                | CSS Modules (Vanilla CSS) | Scoped, component-level styles                              |
| **Widget**             | Plain JavaScript          | No dependencies — works on any website                      |
| **Auth (Hashing)**     | bcrypt                    | Secure password hashing                                     |

---

## 5. Python Packages (Backend)

**File:** `Backend/requirements.txt`

| Package            | Version | Purpose                                  |
| ------------------ | ------- | ---------------------------------------- |
| `fastapi`          | 0.115.0 | API framework                            |
| `uvicorn`          | 0.30.6  | ASGI server to run FastAPI               |
| `sqlalchemy`       | 2.0.35  | ORM for all database operations          |
| `psycopg2-binary`  | 2.9.9   | PostgreSQL driver for Python             |
| `python-multipart` | 0.0.9   | File upload support in FastAPI           |
| `Pillow`           | 10.4.0  | Image handling (icon uploads)            |
| `pydantic`         | 2.9.2   | Data validation and serialization        |
| `python-dotenv`    | 1.0.1   | Load `.env` file into environment        |
| `bcrypt`           | 4.2.0   | Password hashing                         |
| `openai`           | 1.58.1  | OpenAI & Ollama API client               |
| `pgvector`         | 0.3.6   | pgvector SQLAlchemy type (Vector column) |
| `python-docx`      | 1.1.2   | Extract text from Word documents         |
| `PyPDF2`           | 3.0.1   | Extract text from PDF files              |
| `tiktoken`         | 0.8.0   | Token counting (OpenAI tokenizer)        |
| `httpx`            | latest  | HTTP client used inside OpenAI client    |

---

## 6. Node / Frontend Packages

**File:** `landing/package.json`

| Package              | Version  | Purpose                           |
| -------------------- | -------- | --------------------------------- |
| `next`               | 16.1.6   | React framework with App Router   |
| `react`              | 19.2.3   | UI library                        |
| `react-dom`          | 19.2.3   | React DOM rendering               |
| `recharts`           | ^3.7.0   | Charts for analytics pages        |
| `lucide-react`       | ^0.563.0 | SVG icon library                  |
| `typescript`         | ^5       | Type safety for all frontend code |
| `@types/react`       | ^19      | React TypeScript types            |
| `eslint`             | ^9       | Linting                           |
| `eslint-config-next` | 16.1.6   | Next.js ESLint rules              |

---

## 7. Database Structure

**Database:** `webchat_db` (PostgreSQL)  
**Extension:** `pgvector` (must be installed in PostgreSQL)

### Table: `users`

**File:** `Backend/models.py` — class `User`

| Column          | Type          | Notes                       |
| --------------- | ------------- | --------------------------- |
| `id`            | String (UUID) | Primary key, auto-generated |
| `name`          | String(100)   | Optional display name       |
| `email`         | String(100)   | Unique, indexed, required   |
| `password_hash` | String(255)   | bcrypt hashed password      |
| `created_at`    | DateTime      | Auto UTC timestamp          |
| `updated_at`    | DateTime      | Auto-updates on change      |

---

### Table: `chatbots`

**File:** `Backend/models.py` — class `Chatbot`

| Column            | Type          | Notes                           |
| ----------------- | ------------- | ------------------------------- |
| `id`              | String (UUID) | Primary key                     |
| `name`            | String(100)   | Bot display name                |
| `welcome_message` | Text          | First message shown to visitors |
| `primary_color`   | String(7)     | HEX color (default `#4361EE`)   |
| `header_color`    | String(7)     | HEX color (default `#0A1929`)   |
| `bubble_color`    | String(7)     | HEX color (default `#4361EE`)   |
| `text_color`      | String(7)     | HEX color (default `#FFFFFF`)   |
| `icon_url`        | Text          | URL to uploaded icon image      |
| `position`        | String(20)    | `bottom-right` or `bottom-left` |
| `user_id`         | String (FK)   | References `users.id` (CASCADE) |
| `created_at`      | DateTime      | Auto UTC timestamp              |
| `updated_at`      | DateTime      | Auto-updates                    |

**Relationships:** `knowledge_entries`, `knowledge_documents`, `conversations`

---

### Table: `knowledge_entries`

**File:** `Backend/models.py` — class `KnowledgeEntry`  
Custom Q&A pairs added manually by the bot owner.

| Column           | Type          | Notes                                               |
| ---------------- | ------------- | --------------------------------------------------- |
| `id`             | String (UUID) | Primary key                                         |
| `chatbot_id`     | String (FK)   | References `chatbots.id` (CASCADE)                  |
| `trigger`        | Text          | Keyword/phrase that triggers this response          |
| `response`       | Text          | The bot's reply to send                             |
| `is_exact_match` | Boolean       | `True` = exact match only, `False` = contains match |
| `created_at`     | DateTime      | Auto UTC timestamp                                  |

---

### Table: `knowledge_documents`

**File:** `Backend/models.py` — class `KnowledgeDocument`  
Tracks uploaded PDF/DOCX files.

| Column          | Type          | Notes                              |
| --------------- | ------------- | ---------------------------------- |
| `id`            | String (UUID) | Primary key                        |
| `chatbot_id`    | String (FK)   | References `chatbots.id` (CASCADE) |
| `filename`      | String(500)   | Original filename                  |
| `file_type`     | String(50)    | `pdf`, `docx`, `doc`               |
| `file_size`     | Integer       | File size in bytes                 |
| `chunk_count`   | Integer       | Number of text chunks created      |
| `status`        | String(20)    | `processing` → `ready` or `error`  |
| `error_message` | Text          | Error detail if processing failed  |
| `created_at`    | DateTime      | Auto UTC timestamp                 |

---

### Table: `document_chunks`

**File:** `Backend/models.py` — class `DocumentChunk`  
Each row is a chunk of text from a document, stored with its vector embedding.

| Column        | Type          | Notes                                                 |
| ------------- | ------------- | ----------------------------------------------------- |
| `id`          | String (UUID) | Primary key                                           |
| `document_id` | String (FK)   | References `knowledge_documents.id` (CASCADE)         |
| `chatbot_id`  | String (FK)   | References `chatbots.id` (CASCADE)                    |
| `content`     | Text          | The actual text chunk (~500 words)                    |
| `chunk_index` | Integer       | Position of this chunk in the document                |
| `embedding`   | Vector(1536)  | pgvector float array — set by `EMBEDDING_DIM` env var |

> ⚠️ **Important:** The `EMBEDDING_DIM` must match the embedding model used.
>
> - OpenAI `text-embedding-3-small` → **1536 dimensions**
> - Ollama `nomic-embed-text` → **768 dimensions**  
>   Changing providers requires re-processing all documents.

---

### Table: `conversations`

**File:** `Backend/models.py` — class `Conversation`  
Each unique chat session from a visitor.

| Column         | Type          | Notes                              |
| -------------- | ------------- | ---------------------------------- |
| `id`           | String (UUID) | Primary key                        |
| `chatbot_id`   | String (FK)   | References `chatbots.id` (CASCADE) |
| `session_id`   | String        | Unique visitor session token       |
| `visitor_name` | String(100)   | Default `"Visitor"`                |
| `status`       | String(20)    | `active` or `closed`               |
| `started_at`   | DateTime      | When session started               |
| `updated_at`   | DateTime      | Last message time                  |

**Relationships:** `messages`

---

### Table: `messages`

**File:** `Backend/models.py` — class `Message`

| Column            | Type          | Notes                                   |
| ----------------- | ------------- | --------------------------------------- |
| `id`              | String (UUID) | Primary key                             |
| `conversation_id` | String (FK)   | References `conversations.id` (CASCADE) |
| `sender`          | String(10)    | `"user"` or `"bot"`                     |
| `content`         | Text          | Message text                            |
| `created_at`      | DateTime      | Auto UTC timestamp                      |

---

### Table: `reviews`

**File:** `Backend/models.py` — class `Review`

| Column       | Type          | Notes                              |
| ------------ | ------------- | ---------------------------------- |
| `id`         | String (UUID) | Primary key                        |
| `chatbot_id` | String (FK)   | References `chatbots.id` (CASCADE) |
| `rating`     | Integer       | 1–5 stars                          |
| `comment`    | Text          | Optional written feedback          |
| `session_id` | String        | Links review to a visitor session  |
| `created_at` | DateTime      | Auto UTC timestamp                 |

---

### Table: `visits`

**File:** `Backend/models.py` — class `Visit`  
Logged every time the widget loads (page visit).

| Column       | Type          | Notes                              |
| ------------ | ------------- | ---------------------------------- |
| `id`         | String (UUID) | Primary key                        |
| `chatbot_id` | String (FK)   | References `chatbots.id` (CASCADE) |
| `session_id` | String        | Visitor session ID                 |
| `created_at` | DateTime      | Auto UTC timestamp                 |

---

### Table: `usage_stats`

**File:** `Backend/models.py` — class `Usage`  
Logged when a visitor actively uses the chat (submits a message or closes with interaction).

| Column       | Type          | Notes                              |
| ------------ | ------------- | ---------------------------------- |
| `id`         | String (UUID) | Primary key                        |
| `chatbot_id` | String (FK)   | References `chatbots.id` (CASCADE) |
| `session_id` | String        | Visitor session ID                 |
| `created_at` | DateTime      | Auto UTC timestamp                 |

---

### Entity Relationship Diagram (Text)

```
users
  └── chatbots (user_id FK)
        ├── knowledge_entries (chatbot_id FK)
        ├── knowledge_documents (chatbot_id FK)
        │     └── document_chunks (document_id FK, chatbot_id FK)
        ├── conversations (chatbot_id FK)
        │     └── messages (conversation_id FK)
        ├── reviews (chatbot_id FK)
        ├── visits (chatbot_id FK)
        └── usage_stats (chatbot_id FK)
```

---

## 8. Backend Architecture

**File:** `Backend/main.py` (676 lines, single file for all routes)

### Startup Sequence (`main.py` top section)

```
Line 39: init_pgvector()           → Creates pgvector extension in PostgreSQL
Line 40: Base.metadata.create_all() → Creates all tables if not exist
Line 90: run_migrations()           → Adds missing columns (e.g. error_message)
```

### Middleware

```
Line 44–50: CORSMiddleware → allow_origins=["*"] (open for all origins)
Line 54:    /uploads → StaticFiles (serves bot icon images)
Line 364:   GET /widget.js → FileResponse (serves the embeddable widget)
```

### Auth System (`main.py` lines 94–133)

- **No JWT tokens** — simple session-less auth (returns user object on login)
- `get_password_hash()` → uses `bcrypt.hashpw()`
- `verify_password()` → uses `bcrypt.checkpw()`
- `POST /api/auth/register` → creates user with hashed password
- `POST /api/auth/login` → verifies and returns user

### Background Task Processing (`main.py` lines 57–69)

When a document is uploaded, processing happens in a background thread:

```python
background_tasks.add_task(process_document_task, bot_id, doc.id, file_bytes, filename)
```

This calls `ai_service.process_document()` with a dedicated DB session so it doesn't block the HTTP response.

### Database Session

**File:** `Backend/database.py`

- `get_db()` — FastAPI dependency injection, yields a session, auto-closes on exit
- `SessionLocal` — used directly in background tasks (not via dependency injection)

---

## 9. Frontend Architecture

**Framework:** Next.js 16 with App Router  
**Location:** `landing/`

### Routing Structure

| URL Path     | File                                 | Description                          |
| ------------ | ------------------------------------ | ------------------------------------ |
| `/`          | `app/page.tsx`                       | Landing page with login/signup entry |
| `/login`     | `app/login/page.tsx`                 | Email login form                     |
| `/signup`    | `app/signup/page.tsx`                | Registration form                    |
| `/dashboard` | `app/(dashboard)/dashboard/page.tsx` | Main stats + charts                  |
| `/chat-bots` | `app/(dashboard)/chat-bots/page.tsx` | Manage bots                          |
| `/analytics` | `app/(dashboard)/analytics/page.tsx` | Analytics with bot filter            |
| `/reviews`   | `app/(dashboard)/reviews/page.tsx`   | Visitor reviews                      |
| `/billing`   | `app/(dashboard)/billing/page.tsx`   | Billing (placeholder)                |
| `/setting`   | `app/(dashboard)/setting/page.tsx`   | Settings (placeholder)               |

### Layout Hierarchy

```
app/layout.tsx           → Root (applies font, globals.css)
  └── app/(dashboard)/layout.tsx  → Dashboard shell (Sidebar + DashboardHeader)
        └── Each dashboard page
```

### Shared Components (`landing/components/`)

| Component File            | Used In               | What It Does                             |
| ------------------------- | --------------------- | ---------------------------------------- |
| `Sidebar.tsx`             | Dashboard layout      | Left nav with all page links             |
| `DashboardHeader.tsx`     | Dashboard layout      | Top bar with page title                  |
| `StatsCard.tsx`           | Dashboard page        | Displays a single stat (number + label)  |
| `VisitsChart.tsx`         | Dashboard + Analytics | Recharts line chart of visits/messages   |
| `RecentConversations.tsx` | Dashboard page        | Lists last N conversation summaries      |
| `PlanUsage.tsx`           | Dashboard page        | Horizontal progress bar for usage limits |
| `ReviewProgress.tsx`      | Dashboard + Reviews   | Star rating breakdown bars               |

### API Communication

All frontend calls hit `http://localhost:8000` directly using `fetch()`.  
**File:** `landing/next.config.ts` — contains proxy rewrites if needed.

### User Authentication (Frontend)

- User data stored in `localStorage` as `user` JSON object after login
- `user_id` extracted from `localStorage` to filter bots and analytics per user
- No token/cookie-based auth currently

---

## 10. AI / RAG Pipeline

**File:** `Backend/ai_service.py` (403 lines)

### Pipeline Flow (Per Chat Message)

```
User sends message
    │
    ▼
Step 1: Check custom Q&A entries (KnowledgeEntry table)
    ├── Exact match? → Return that response immediately
    └── Contains match? → Return that response immediately
    │
    ▼
Step 2: Check if any document chunks exist for this bot
    │ (if none + no Q&A → return None → fallback response used)
    ▼
Step 3: Vector Similarity Search (search_similar_chunks)
    ├── Generate embedding for user query (OpenAI/Ollama)
    ├── SQL: SELECT chunks ORDER BY cosine distance to query
    └── Filter: similarity > 0.3 threshold
    │
    ▼
Step 4: Build context string from top-5 relevant chunks
    │
    ▼
Step 5: OpenAI Chat Completion with RAG system prompt
    ├── System prompt includes: context + custom Q&A
    ├── Model: gpt-4o-mini (OpenAI) or llama3.1 (Ollama)
    └── Temperature: 0.3 (low for factual accuracy)
    │
    ▼
Return AI-generated answer
```

### Key Functions in `ai_service.py`

| Function                      | Line | Description                                           |
| ----------------------------- | ---- | ----------------------------------------------------- |
| `extract_text_from_pdf()`     | ~70  | Uses PyPDF2 to extract text from PDF bytes            |
| `extract_text_from_docx()`    | ~80  | Uses python-docx to extract text                      |
| `chunk_text()`                | ~105 | Splits text into ~500-word overlapping chunks         |
| `generate_embeddings()`       | ~127 | Batch-generates embeddings (100 at a time for OpenAI) |
| `generate_single_embedding()` | ~144 | Single embedding for a query string                   |
| `process_document()`          | ~158 | Full pipeline: extract→chunk→embed→store              |
| `search_similar_chunks()`     | ~236 | pgvector cosine similarity search                     |
| `generate_ai_response()`      | ~299 | Full RAG orchestration for one chat message           |

### Vector Search SQL (lines ~248–263)

```sql
SELECT id, content, chunk_index, document_id,
       1 - (embedding <=> CAST(:query_embedding AS vector(1536))) AS similarity
FROM document_chunks
WHERE chatbot_id = :chatbot_id
ORDER BY embedding <=> CAST(:query_embedding AS vector(1536))
LIMIT :top_k
```

> Uses `CAST(... AS vector)` **not** `::vector` — psycopg2 cannot parse `::` after a named parameter.

### AI Provider Configuration

Set via `.env`:

- `AI_PROVIDER=openai` → uses OpenAI API (fast, ~1–3s)
- `AI_PROVIDER=ollama` → uses local Ollama server (slow, ~5–30s)

---

## 11. Widget (Embeddable Chat)

**File:** `Backend/widget.js` (20KB, ~600 lines)  
**Served at:** `GET /widget.js`

### How to Embed on Any Website

```html
<script
  src="http://localhost:8000/widget.js"
  data-chatbot-id="YOUR_BOT_ID"
></script>
```

The script:

1. Reads `data-chatbot-id` attribute
2. Calls `GET /api/widget/config/{bot_id}` to load bot appearance
3. Injects a floating chat bubble into the page DOM
4. Handles all chat UI, sends messages to `POST /api/widget/chat/{bot_id}`
5. Records visits via `GET /api/widget/config/{bot_id}?session_id=...`
6. Records usage via `POST /api/widget/usage/{bot_id}`
7. Shows a review popup when the chat is closed

### Widget API Calls Made

| Endpoint                           | When Called                                        |
| ---------------------------------- | -------------------------------------------------- |
| `GET /api/widget/config/{bot_id}`  | On widget load — fetches colors, name, welcome msg |
| `POST /api/widget/chat/{bot_id}`   | Every time user sends a message                    |
| `POST /api/widget/usage/{bot_id}`  | When user closes the chat                          |
| `POST /api/widget/review/{bot_id}` | When user submits star rating                      |

---

## 12. Environment Variables

**File:** `Backend/.env`

| Variable                 | Example Value                                              | Description                                      |
| ------------------------ | ---------------------------------------------------------- | ------------------------------------------------ |
| `DATABASE_URL`           | `postgresql://postgres:password@127.0.0.1:5432/webchat_db` | PostgreSQL connection string                     |
| `BACKEND_URL`            | `http://localhost:8000`                                    | Used for building icon URLs and embed script tag |
| `OPENAI_API_KEY`         | `sk-proj-...`                                              | OpenAI API key                                   |
| `AI_PROVIDER`            | `openai` or `ollama`                                       | Which AI provider to use                         |
| `OLLAMA_BASE_URL`        | `http://localhost:11434/v1`                                | Ollama local server URL                          |
| `OLLAMA_CHAT_MODEL`      | `llama3.1`                                                 | Ollama model for chat completions                |
| `OLLAMA_EMBEDDING_MODEL` | `nomic-embed-text`                                         | Ollama model for embeddings                      |
| `EMBEDDING_DIM`          | `1536` (OpenAI) or `768` (Ollama)                          | Vector dimension — must match the model          |

> ⚠️ **Critical:** `EMBEDDING_DIM` must match what was used when documents were embedded.  
> Changing from Ollama (768) to OpenAI (1536) requires deleting all `document_chunks` and re-uploading documents.

---

## 13. All API Endpoints Reference

**Base URL:** `http://localhost:8000`  
**All routes defined in:** `Backend/main.py`

### Auth

| Method | Route                | Handler Line | Description                 |
| ------ | -------------------- | ------------ | --------------------------- |
| `POST` | `/api/auth/register` | Line 109     | Register new user           |
| `POST` | `/api/auth/login`    | Line 127     | Login with email + password |

### Chatbots

| Method   | Route                          | Handler Line | Description                           |
| -------- | ------------------------------ | ------------ | ------------------------------------- |
| `GET`    | `/api/chatbots`                | Line 173     | List all bots (filter by `?user_id=`) |
| `POST`   | `/api/chatbots`                | Line 139     | Create new chatbot                    |
| `GET`    | `/api/chatbots/{bot_id}`       | Line 181     | Get single chatbot                    |
| `PUT`    | `/api/chatbots/{bot_id}`       | Line 189     | Update chatbot settings               |
| `DELETE` | `/api/chatbots/{bot_id}`       | Line 201     | Delete chatbot + all its data         |
| `POST`   | `/api/chatbots/{bot_id}/icon`  | Line 157     | Upload bot icon image                 |
| `GET`    | `/api/chatbots/{bot_id}/embed` | Line 211     | Get embed `<script>` tag              |

### Knowledge Base (Q&A Entries)

| Method   | Route                                         | Handler Line | Description          |
| -------- | --------------------------------------------- | ------------ | -------------------- |
| `GET`    | `/api/chatbots/{bot_id}/knowledge`            | Line 223     | List all Q&A entries |
| `POST`   | `/api/chatbots/{bot_id}/knowledge`            | Line 232     | Add new Q&A entry    |
| `PUT`    | `/api/chatbots/{bot_id}/knowledge/{entry_id}` | Line 249     | Update Q&A entry     |
| `DELETE` | `/api/chatbots/{bot_id}/knowledge/{entry_id}` | Line 264     | Delete Q&A entry     |

### Knowledge Documents (PDF/DOCX)

| Method   | Route                                              | Handler Line | Description                                            |
| -------- | -------------------------------------------------- | ------------ | ------------------------------------------------------ |
| `GET`    | `/api/chatbots/{bot_id}/documents`                 | Line 280     | List uploaded documents                                |
| `POST`   | `/api/chatbots/{bot_id}/documents`                 | Line 290     | Upload PDF/DOCX (triggers AI processing in background) |
| `DELETE` | `/api/chatbots/{bot_id}/documents/{doc_id}`        | Line 332     | Delete document + all its chunks                       |
| `GET`    | `/api/chatbots/{bot_id}/documents/{doc_id}/status` | Line 345     | Poll processing status                                 |

### Widget (Public — used by embedded widget)

| Method | Route                         | Handler Line | Description                       |
| ------ | ----------------------------- | ------------ | --------------------------------- |
| `GET`  | `/widget.js`                  | Line 364     | Serve the embeddable JS widget    |
| `GET`  | `/api/widget/config/{bot_id}` | Line 372     | Get bot config + record a visit   |
| `POST` | `/api/widget/chat/{bot_id}`   | Line 386     | Send a chat message, get AI reply |
| `POST` | `/api/widget/review/{bot_id}` | Line 449     | Submit a star rating review       |
| `POST` | `/api/widget/usage/{bot_id}`  | Line 467     | Record chat usage (for analytics) |

### Conversations

| Method | Route                          | Handler Line | Description                                              |
| ------ | ------------------------------ | ------------ | -------------------------------------------------------- |
| `GET`  | `/api/conversations`           | Line 527     | List conversations (filter by `?bot_id=` or `?user_id=`) |
| `GET`  | `/api/conversations/{conv_id}` | Line 562     | Get full conversation with messages                      |

### Reviews

| Method | Route                            | Handler Line | Description                                            |
| ------ | -------------------------------- | ------------ | ------------------------------------------------------ |
| `GET`  | `/api/reviews`                   | Line 478     | List all reviews (filter by `?user_id=` or `?bot_id=`) |
| `GET`  | `/api/analytics/reviews/summary` | Line 503     | Star rating breakdown percentages                      |

### Analytics

| Method | Route                      | Handler Line | Description                                       |
| ------ | -------------------------- | ------------ | ------------------------------------------------- |
| `GET`  | `/api/analytics/dashboard` | Line 570     | Stats: total bots, convos, messages, usage, today |
| `GET`  | `/api/analytics/chart`     | Line 611     | Daily data points for last N days                 |
| `GET`  | `/api/analytics/bots`      | Line 657     | Per-bot conversation + message counts             |

---

## 14. Code Location Quick Reference

> Use this table when you need to make a specific change.

| What to Change                      | File                                              | Line / Section                                    |
| ----------------------------------- | ------------------------------------------------- | ------------------------------------------------- |
| Add a new API endpoint              | `Backend/main.py`                                 | Append anywhere, follow existing patterns         |
| Add a new database table            | `Backend/models.py`                               | Add new class extending `Base`                    |
| Change a request/response shape     | `Backend/schemas.py`                              | Find the relevant Pydantic class                  |
| Change DB connection settings       | `Backend/.env`                                    | `DATABASE_URL` variable                           |
| Change AI model or provider         | `Backend/.env`                                    | `AI_PROVIDER`, `OLLAMA_CHAT_MODEL`, etc.          |
| Change embedding dimensions         | `Backend/.env`                                    | `EMBEDDING_DIM` (must re-process all docs after)  |
| Change the vector search SQL        | `Backend/ai_service.py`                           | Lines ~248–263 (`search_similar_chunks`)          |
| Change the AI system prompt         | `Backend/ai_service.py`                           | Lines ~281–296 (`SYSTEM_PROMPT`)                  |
| Change document chunking size       | `Backend/ai_service.py`                           | Line 41: `CHUNK_SIZE = 500`, `CHUNK_OVERLAP = 50` |
| Change how many results RAG returns | `Backend/ai_service.py`                           | Line 43: `TOP_K = 5`                              |
| Change widget appearance/behaviour  | `Backend/widget.js`                               | Full file (vanilla JS)                            |
| Add a new dashboard page            | `landing/app/(dashboard)/`                        | Create new folder with `page.tsx`                 |
| Add a sidebar link                  | `landing/components/Sidebar.tsx`                  | Add to nav items array                            |
| Change landing page                 | `landing/app/page.tsx`                            | Full file                                         |
| Change login/signup page            | `landing/app/login/page.tsx` or `signup/page.tsx` | Full file                                         |
| Change analytics charts             | `landing/components/VisitsChart.tsx`              | Full file                                         |
| Change stats cards                  | `landing/components/StatsCard.tsx`                | Full file                                         |
| Change review display               | `landing/components/ReviewProgress.tsx`           | Full file                                         |
| Add DB migration                    | `Backend/main.py`                                 | `run_migrations()` function, lines 73–90          |
| Change CORS settings                | `Backend/main.py`                                 | Lines 44–50                                       |
| Change password hashing             | `Backend/main.py`                                 | Lines 94–98                                       |

---

## 15. How to Run the Project

### Prerequisites

- Python 3.13+
- Node.js 18+
- PostgreSQL with `pgvector` extension installed
- OpenAI API key (or Ollama running locally)

### 1. Start the Backend

```powershell
# Navigate to backend
cd C:\Users\admin\Desktop\WebChat-AI\Backend

# Install dependencies (first time only)
pip install -r requirements.txt

# Start server
uvicorn main:app --reload --port 8000
```

Backend runs at: `http://localhost:8000`  
API docs available at: `http://localhost:8000/docs`

### 2. Start the Frontend

```powershell
# Navigate to frontend
cd C:\Users\admin\Desktop\WebChat-AI\landing

# Install dependencies (first time only)
npm install

# Start dev server
npm run dev
```

Frontend runs at: `http://localhost:3000`

### 3. Verify Everything Works

1. Open `http://localhost:3000` — see the landing/login page
2. Register a new account at `/signup`
3. Create a chatbot at `/chat-bots`
4. Add knowledge entries or upload a PDF
5. Get the embed code and paste the `<script>` tag in any HTML file
6. Chat with the bot!

### 4. Seed Fake Analytics (Development Only)

```powershell
cd C:\Users\admin\Desktop\WebChat-AI
python seed_analytics.py          # General analytics data
python seed_bot_analytics.py      # Bot-specific analytics
```

---

_This documentation was auto-generated from the project source code. Keep it updated as the project evolves._
