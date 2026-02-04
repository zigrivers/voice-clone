# Voice Clone Tool - Tech Stack Document

**Version**: 1.0
**Created**: February 4, 2026
**Purpose**: Define a technology stack optimized for AI-assisted development and long-term maintainability

---

## Table of Contents

1. [Design Philosophy](#1-design-philosophy)
2. [Architecture Overview](#2-architecture-overview)
3. [Backend Stack (Python)](#3-backend-stack-python)
4. [Frontend Stack](#4-frontend-stack)
5. [Database Layer](#5-database-layer)
6. [AI/LLM Integration](#6-aillm-integration)
7. [File Processing](#7-file-processing)
8. [Infrastructure](#8-infrastructure)
9. [Development Tooling](#9-development-tooling)
10. [Security Considerations](#10-security-considerations)
11. [AI-Friendly Patterns](#11-ai-friendly-patterns)
12. [Migration Path from Original Plan](#12-migration-path-from-original-plan)

---

## 1. Design Philosophy

### Core Principle: AI-First Development

This tech stack is designed with the understanding that AI (Claude, GPT, etc.) will be the primary code author. Every technology choice prioritizes:

1. **Training Data Abundance**: Technologies with extensive documentation and examples that AI models have been trained on
2. **Explicit Over Implicit**: Avoid magic, convention-over-configuration, and hidden behaviors
3. **Type Safety**: Strong typing reduces AI errors and enables better autocomplete/suggestions
4. **Modularity**: Small, focused modules that AI can understand and modify independently
5. **Standard Patterns**: Use well-established patterns that AI models recognize

### Why Python Backend

| Factor | Python Advantage |
|--------|------------------|
| **AI/ML Ecosystem** | Best-in-class libraries for NLP, text analysis, and AI integration |
| **Training Data** | Python is the most common language in AI training datasets |
| **Library Maturity** | Mature, well-documented libraries with clear APIs |
| **Type Hints** | Modern Python with type hints provides clarity without verbosity |
| **Debugging** | Clear error messages and stack traces for AI to interpret |
| **Community Patterns** | Consistent coding patterns across the ecosystem |

### Anti-Patterns to Avoid

- **Metaclass magic**: Confuses AI understanding
- **Excessive decorators**: Keep to standard, well-known decorators
- **Dynamic imports**: Prefer explicit imports
- **Complex inheritance**: Favor composition over inheritance
- **Overuse of ORMs magic**: Use explicit queries where clarity matters

---

## 2. Architecture Overview

### System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND                                    │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                      Next.js 14+ (App Router)                      │  │
│  │  • React 18 Components    • Tailwind CSS    • TypeScript          │  │
│  │  • TanStack Query         • Zustand (state) • shadcn/ui           │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ REST API (JSON)
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           BACKEND (Python)                               │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                         FastAPI Framework                          │  │
│  │  • Automatic OpenAPI docs  • Pydantic validation  • Async support │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                    │                                     │
│  ┌────────────────┬────────────────┼────────────────┬────────────────┐  │
│  │   Services     │   Services     │   Services     │   Services     │  │
│  │                │                │                │                │  │
│  │ Voice Clone    │   Content      │   Analysis     │   Detection    │  │
│  │ Service        │   Generator    │   Service      │   Service      │  │
│  │                │                │                │                │  │
│  │ • CRUD ops     │ • Generation   │ • DNA extract  │ • Heuristics   │  │
│  │ • Samples      │ • Platforms    │ • NLP analysis │ • Scoring      │  │
│  │ • Merging      │ • Formatting   │ • Confidence   │ • Feedback     │  │
│  └────────────────┴────────────────┴────────────────┴────────────────┘  │
│                                    │                                     │
│  ┌────────────────┬────────────────┴────────────────┬────────────────┐  │
│  │  AI Provider   │       File Processor            │   URL Scraper  │  │
│  │  Abstraction   │                                 │                │  │
│  │                │  • PDF: PyMuPDF                 │  • httpx       │  │
│  │  • OpenAI      │  • DOCX: python-docx           │  • BeautifulSoup│  │
│  │  • Anthropic   │  • TXT: native                 │  • Playwright  │  │
│  │  • LiteLLM     │                                 │    (fallback)  │  │
│  └────────────────┴─────────────────────────────────┴────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                            DATA LAYER                                    │
│  ┌─────────────────────────────────┐  ┌─────────────────────────────┐   │
│  │          PostgreSQL             │  │       File Storage          │   │
│  │                                 │  │                             │   │
│  │  SQLAlchemy 2.0 ORM             │  │  Local (dev)                │   │
│  │  Alembic migrations             │  │  S3/R2 (prod)               │   │
│  │  pgvector (optional, future)    │  │                             │   │
│  └─────────────────────────────────┘  └─────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

### Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| **Separate frontend/backend** | Clear boundaries, easier for AI to work on isolated parts |
| **REST over GraphQL** | Simpler, more explicit, better AI training data coverage |
| **FastAPI over Django** | Less magic, explicit routing, automatic OpenAPI documentation |
| **SQLAlchemy 2.0 over Django ORM** | More explicit queries, better type hints, clearer behavior |

---

## 3. Backend Stack (Python)

### Core Framework: FastAPI

**Version**: 0.109+ (latest stable)

**Why FastAPI**:
- Automatic OpenAPI/Swagger documentation (AI can reference this)
- Pydantic models provide clear data contracts
- Async-first but works with sync code
- Explicit dependency injection
- Extensive documentation and examples in AI training data

```python
# Example: Clean, explicit FastAPI pattern
from fastapi import FastAPI, Depends, HTTPException
from pydantic import BaseModel
from typing import List

app = FastAPI(title="Voice Clone API", version="1.0.0")

class VoiceCloneCreate(BaseModel):
    name: str
    description: str | None = None
    tags: List[str] = []

@app.post("/api/voice-clones", response_model=VoiceCloneResponse)
async def create_voice_clone(
    data: VoiceCloneCreate,
    db: AsyncSession = Depends(get_db)
) -> VoiceCloneResponse:
    """Create a new voice clone."""
    # Explicit, clear logic
    pass
```

### Package Management: uv

**Why uv**:
- Fast, modern Python package manager
- Lock file ensures reproducible builds
- Compatible with pip/requirements.txt ecosystem
- Clear dependency resolution

```bash
# Installation
curl -LsSf https://astral.sh/uv/install.sh | sh

# Usage
uv init
uv add fastapi sqlalchemy pydantic
uv sync
```

### Required Backend Packages

```toml
# pyproject.toml
[project]
name = "voice-clone-api"
version = "1.0.0"
requires-python = ">=3.11"

dependencies = [
    # Core Framework
    "fastapi>=0.109.0",
    "uvicorn[standard]>=0.27.0",
    "pydantic>=2.5.0",
    "pydantic-settings>=2.1.0",

    # Database
    "sqlalchemy[asyncio]>=2.0.25",
    "alembic>=1.13.0",
    "asyncpg>=0.29.0",  # PostgreSQL async driver

    # AI Providers
    "openai>=1.10.0",
    "anthropic>=0.18.0",
    "litellm>=1.20.0",  # Unified interface (optional)

    # File Processing
    "pymupdf>=1.23.0",  # PDF parsing (better than pdf-parse)
    "python-docx>=1.1.0",  # DOCX parsing
    "python-multipart>=0.0.6",  # File uploads

    # URL Scraping
    "httpx>=0.26.0",  # Modern HTTP client
    "beautifulsoup4>=4.12.0",
    "lxml>=5.1.0",  # Fast HTML parser

    # NLP (for detection heuristics)
    "spacy>=3.7.0",
    "textstat>=0.7.3",  # Readability metrics

    # Utilities
    "python-dotenv>=1.0.0",
    "structlog>=24.1.0",  # Structured logging
]

[project.optional-dependencies]
dev = [
    "pytest>=7.4.0",
    "pytest-asyncio>=0.23.0",
    "pytest-cov>=4.1.0",
    "ruff>=0.1.0",  # Fast linter
    "mypy>=1.8.0",
]
```

### Project Structure

```
backend/
├── pyproject.toml
├── uv.lock
├── alembic/
│   ├── alembic.ini
│   ├── env.py
│   └── versions/
├── src/
│   └── voice_clone/
│       ├── __init__.py
│       ├── main.py                 # FastAPI app entry point
│       ├── config.py               # Settings management
│       ├── dependencies.py         # Dependency injection
│       │
│       ├── api/
│       │   ├── __init__.py
│       │   ├── router.py           # Main API router
│       │   ├── voice_clones.py     # Voice clone endpoints
│       │   ├── content.py          # Content generation endpoints
│       │   ├── library.py          # Library endpoints
│       │   └── settings.py         # Settings endpoints
│       │
│       ├── models/
│       │   ├── __init__.py
│       │   ├── base.py             # SQLAlchemy base
│       │   ├── voice_clone.py      # VoiceClone model
│       │   ├── writing_sample.py   # WritingSample model
│       │   ├── voice_dna.py        # VoiceDNA model
│       │   ├── content.py          # Content model
│       │   └── settings.py         # Settings models
│       │
│       ├── schemas/
│       │   ├── __init__.py
│       │   ├── voice_clone.py      # Pydantic schemas
│       │   ├── content.py
│       │   └── settings.py
│       │
│       ├── services/
│       │   ├── __init__.py
│       │   ├── voice_clone.py      # Voice clone business logic
│       │   ├── analysis.py         # DNA analysis service
│       │   ├── generation.py       # Content generation service
│       │   ├── detection.py        # AI detection heuristics
│       │   └── merge.py            # Voice clone merging
│       │
│       ├── ai/
│       │   ├── __init__.py
│       │   ├── provider.py         # AI provider abstraction
│       │   ├── openai_provider.py
│       │   ├── anthropic_provider.py
│       │   └── prompts/
│       │       ├── __init__.py
│       │       ├── analysis.py     # Voice DNA analysis prompts
│       │       ├── generation.py   # Content generation prompts
│       │       └── merge.py        # Merge prompts
│       │
│       ├── parsers/
│       │   ├── __init__.py
│       │   ├── pdf.py
│       │   ├── docx.py
│       │   └── url.py
│       │
│       └── utils/
│           ├── __init__.py
│           └── text.py             # Text utilities
│
└── tests/
    ├── __init__.py
    ├── conftest.py
    ├── test_voice_clones.py
    ├── test_content.py
    └── test_detection.py
```

---

## 4. Frontend Stack

### Core Framework: Next.js 14+

**Why Keep Next.js for Frontend**:
- Excellent React documentation in AI training data
- Type safety with TypeScript
- Built-in routing and optimization
- Can be deployed as static/SSG for simpler hosting

### Frontend Packages

```json
{
  "dependencies": {
    "next": "^14.1.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@tanstack/react-query": "^5.17.0",
    "zustand": "^4.5.0",
    "axios": "^1.6.0",
    "zod": "^3.22.0",
    "tailwindcss": "^3.4.0",
    "@radix-ui/react-*": "latest",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0",
    "lucide-react": "^0.309.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "@types/react": "^18.2.0",
    "@types/node": "^20.11.0",
    "eslint": "^8.56.0",
    "eslint-config-next": "^14.1.0",
    "prettier": "^3.2.0"
  }
}
```

### Frontend Structure

```
frontend/
├── package.json
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── voice-clones/
│   │   ├── create/
│   │   ├── library/
│   │   └── settings/
│   ├── components/
│   │   ├── ui/                    # shadcn/ui components
│   │   ├── voice-clone/
│   │   ├── content/
│   │   └── library/
│   ├── lib/
│   │   ├── api.ts                 # API client
│   │   ├── utils.ts
│   │   └── validations.ts
│   ├── hooks/
│   │   ├── use-voice-clones.ts
│   │   ├── use-content.ts
│   │   └── use-settings.ts
│   ├── stores/
│   │   └── app-store.ts
│   └── types/
│       └── index.ts
└── public/
```

### State Management Strategy

| State Type | Solution | Rationale |
|------------|----------|-----------|
| **Server State** | TanStack Query | Handles caching, refetching, optimistic updates |
| **UI State** | Zustand | Simple, explicit, minimal boilerplate |
| **Form State** | React Hook Form + Zod | Type-safe validation |
| **URL State** | Next.js searchParams | Shareable, bookmarkable |

---

## 5. Database Layer

### PostgreSQL + SQLAlchemy 2.0

**Why SQLAlchemy 2.0**:
- Fully typed with modern Python type hints
- Explicit query patterns (AI can understand the SQL being generated)
- Async support
- Well-documented migration system (Alembic)

### Model Pattern

```python
# models/voice_clone.py
from datetime import datetime
from typing import Optional, List
from sqlalchemy import String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import ARRAY, UUID, JSONB
import uuid

from .base import Base

class VoiceClone(Base):
    """A voice clone capturing a writer's unique style."""

    __tablename__ = "voice_clones"

    # Primary key
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    # Required fields
    name: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)

    # Optional fields
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    tags: Mapped[List[str]] = mapped_column(ARRAY(String), default=list)
    avatar_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    # Merge tracking
    is_merged: Mapped[bool] = mapped_column(Boolean, default=False)
    merge_config: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)

    # Confidence tracking
    confidence_score: Mapped[int] = mapped_column(default=0)
    current_dna_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), nullable=True
    )

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    # Relationships
    samples: Mapped[List["WritingSample"]] = relationship(
        back_populates="voice_clone",
        cascade="all, delete-orphan"
    )
    dna_versions: Mapped[List["VoiceDnaVersion"]] = relationship(
        back_populates="voice_clone",
        cascade="all, delete-orphan"
    )
```

### Database Service Pattern

```python
# services/voice_clone.py
from typing import Optional, List
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from voice_clone.models import VoiceClone
from voice_clone.schemas import VoiceCloneCreate, VoiceCloneUpdate

class VoiceCloneService:
    """Service for voice clone operations."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, clone_id: UUID) -> Optional[VoiceClone]:
        """Get a voice clone by ID."""
        result = await self.db.execute(
            select(VoiceClone).where(VoiceClone.id == clone_id)
        )
        return result.scalar_one_or_none()

    async def get_all(self) -> List[VoiceClone]:
        """Get all voice clones."""
        result = await self.db.execute(
            select(VoiceClone).order_by(VoiceClone.created_at.desc())
        )
        return list(result.scalars().all())

    async def create(self, data: VoiceCloneCreate) -> VoiceClone:
        """Create a new voice clone."""
        clone = VoiceClone(
            name=data.name,
            description=data.description,
            tags=data.tags
        )
        self.db.add(clone)
        await self.db.commit()
        await self.db.refresh(clone)
        return clone

    async def update(
        self,
        clone_id: UUID,
        data: VoiceCloneUpdate
    ) -> Optional[VoiceClone]:
        """Update an existing voice clone."""
        clone = await self.get_by_id(clone_id)
        if not clone:
            return None

        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(clone, field, value)

        await self.db.commit()
        await self.db.refresh(clone)
        return clone

    async def delete(self, clone_id: UUID) -> bool:
        """Delete a voice clone."""
        clone = await self.get_by_id(clone_id)
        if not clone:
            return False

        await self.db.delete(clone)
        await self.db.commit()
        return True
```

---

## 6. AI/LLM Integration

### Provider Abstraction Layer

```python
# ai/provider.py
from abc import ABC, abstractmethod
from typing import Optional, AsyncIterator
from pydantic import BaseModel

class GenerationOptions(BaseModel):
    """Options for text generation."""
    model: Optional[str] = None
    max_tokens: int = 4096
    temperature: float = 0.7
    stream: bool = False

class AnalysisResult(BaseModel):
    """Result from text analysis."""
    voice_dna: dict
    confidence: float
    notes: Optional[str] = None

class AIProvider(ABC):
    """Abstract base class for AI providers."""

    @property
    @abstractmethod
    def name(self) -> str:
        """Provider name."""
        pass

    @abstractmethod
    async def generate_text(
        self,
        prompt: str,
        options: Optional[GenerationOptions] = None
    ) -> str:
        """Generate text from a prompt."""
        pass

    @abstractmethod
    async def generate_stream(
        self,
        prompt: str,
        options: Optional[GenerationOptions] = None
    ) -> AsyncIterator[str]:
        """Generate text with streaming."""
        pass

    @abstractmethod
    async def analyze_text(
        self,
        text: str,
        instructions: str
    ) -> AnalysisResult:
        """Analyze text and extract voice DNA."""
        pass
```

### OpenAI Implementation

```python
# ai/openai_provider.py
from typing import Optional, AsyncIterator
from openai import AsyncOpenAI

from .provider import AIProvider, GenerationOptions, AnalysisResult

class OpenAIProvider(AIProvider):
    """OpenAI API provider."""

    def __init__(self, api_key: str, default_model: str = "gpt-4-turbo"):
        self.client = AsyncOpenAI(api_key=api_key)
        self.default_model = default_model

    @property
    def name(self) -> str:
        return "openai"

    async def generate_text(
        self,
        prompt: str,
        options: Optional[GenerationOptions] = None
    ) -> str:
        opts = options or GenerationOptions()

        response = await self.client.chat.completions.create(
            model=opts.model or self.default_model,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=opts.max_tokens,
            temperature=opts.temperature
        )

        return response.choices[0].message.content or ""

    async def generate_stream(
        self,
        prompt: str,
        options: Optional[GenerationOptions] = None
    ) -> AsyncIterator[str]:
        opts = options or GenerationOptions()

        stream = await self.client.chat.completions.create(
            model=opts.model or self.default_model,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=opts.max_tokens,
            temperature=opts.temperature,
            stream=True
        )

        async for chunk in stream:
            if chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content
```

### Anthropic Implementation

```python
# ai/anthropic_provider.py
from typing import Optional, AsyncIterator
from anthropic import AsyncAnthropic

from .provider import AIProvider, GenerationOptions, AnalysisResult

class AnthropicProvider(AIProvider):
    """Anthropic Claude API provider."""

    def __init__(self, api_key: str, default_model: str = "claude-3-opus-20240229"):
        self.client = AsyncAnthropic(api_key=api_key)
        self.default_model = default_model

    @property
    def name(self) -> str:
        return "anthropic"

    async def generate_text(
        self,
        prompt: str,
        options: Optional[GenerationOptions] = None
    ) -> str:
        opts = options or GenerationOptions()

        response = await self.client.messages.create(
            model=opts.model or self.default_model,
            max_tokens=opts.max_tokens,
            messages=[{"role": "user", "content": prompt}]
        )

        return response.content[0].text
```

### Provider Factory

```python
# ai/__init__.py
from typing import Literal
from functools import lru_cache

from voice_clone.config import settings
from .provider import AIProvider
from .openai_provider import OpenAIProvider
from .anthropic_provider import AnthropicProvider

ProviderName = Literal["openai", "anthropic"]

@lru_cache()
def get_ai_provider(name: ProviderName | None = None) -> AIProvider:
    """Get an AI provider instance."""
    provider_name = name or settings.default_ai_provider

    if provider_name == "openai":
        return OpenAIProvider(
            api_key=settings.openai_api_key,
            default_model=settings.openai_model
        )
    elif provider_name == "anthropic":
        return AnthropicProvider(
            api_key=settings.anthropic_api_key,
            default_model=settings.anthropic_model
        )
    else:
        raise ValueError(f"Unknown provider: {provider_name}")
```

---

## 7. File Processing

### PDF Parser

```python
# parsers/pdf.py
import fitz  # PyMuPDF
from pathlib import Path
from typing import Union

async def extract_text_from_pdf(source: Union[Path, bytes]) -> str:
    """Extract text content from a PDF file.

    Args:
        source: File path or bytes content

    Returns:
        Extracted text content
    """
    if isinstance(source, Path):
        doc = fitz.open(source)
    else:
        doc = fitz.open(stream=source, filetype="pdf")

    text_parts = []
    for page in doc:
        text_parts.append(page.get_text())

    doc.close()
    return "\n".join(text_parts)
```

### DOCX Parser

```python
# parsers/docx.py
from docx import Document
from pathlib import Path
from typing import Union
import io

async def extract_text_from_docx(source: Union[Path, bytes]) -> str:
    """Extract text content from a DOCX file.

    Args:
        source: File path or bytes content

    Returns:
        Extracted text content
    """
    if isinstance(source, Path):
        doc = Document(source)
    else:
        doc = Document(io.BytesIO(source))

    paragraphs = [paragraph.text for paragraph in doc.paragraphs]
    return "\n".join(paragraphs)
```

### URL Scraper

```python
# parsers/url.py
import httpx
from bs4 import BeautifulSoup
from typing import Optional

async def extract_text_from_url(url: str) -> str:
    """Extract main text content from a URL.

    Args:
        url: The URL to scrape

    Returns:
        Extracted text content

    Raises:
        httpx.HTTPError: If the request fails
    """
    async with httpx.AsyncClient() as client:
        response = await client.get(
            url,
            headers={"User-Agent": "Mozilla/5.0 (compatible; VoiceCloneBot/1.0)"},
            follow_redirects=True,
            timeout=30.0
        )
        response.raise_for_status()

    soup = BeautifulSoup(response.text, "lxml")

    # Remove unwanted elements
    for element in soup(["script", "style", "nav", "footer", "header", "aside"]):
        element.decompose()

    # Try to find main content
    main_content = (
        soup.find("article") or
        soup.find("main") or
        soup.find(class_="content") or
        soup.find(class_="post") or
        soup.body
    )

    if main_content:
        return main_content.get_text(separator="\n", strip=True)

    return soup.get_text(separator="\n", strip=True)
```

---

## 8. Infrastructure

### Development Environment

```yaml
# docker-compose.yml
version: "3.9"

services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: voice_clone
      POSTGRES_PASSWORD: localdev
      POSTGRES_DB: voice_clone
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.dev
    environment:
      DATABASE_URL: postgresql+asyncpg://voice_clone:localdev@db:5432/voice_clone
      OPENAI_API_KEY: ${OPENAI_API_KEY}
      ANTHROPIC_API_KEY: ${ANTHROPIC_API_KEY}
    ports:
      - "8000:8000"
    volumes:
      - ./backend/src:/app/src
    depends_on:
      - db

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:8000
    ports:
      - "3000:3000"
    volumes:
      - ./frontend/src:/app/src
    depends_on:
      - backend

volumes:
  pgdata:
```

### Production Deployment Options

| Option | Pros | Cons | Recommendation |
|--------|------|------|----------------|
| **Railway** | Simple, good Python support, managed Postgres | Limited customization | Good for MVP |
| **Render** | Simple, auto-deploy from Git | Cold starts on free tier | Good for MVP |
| **Fly.io** | Great performance, global edge | More configuration | Good for scale |
| **Vercel + Railway** | Vercel for frontend, Railway for backend | Two services | Best separation |

### Recommended: Vercel (Frontend) + Railway (Backend)

```
Frontend (Vercel):
- Auto-deploys from Git
- Edge functions for API routes (if needed)
- Built-in CDN

Backend (Railway):
- Python with uv
- PostgreSQL addon
- Auto-migrations
- Environment variables management
```

---

## 9. Development Tooling

### Linting and Formatting

```toml
# pyproject.toml (backend)
[tool.ruff]
target-version = "py311"
line-length = 88
select = [
    "E",   # pycodestyle errors
    "W",   # pycodestyle warnings
    "F",   # Pyflakes
    "I",   # isort
    "B",   # flake8-bugbear
    "C4",  # flake8-comprehensions
    "UP",  # pyupgrade
]
ignore = ["E501"]  # Line too long (handled by formatter)

[tool.ruff.format]
quote-style = "double"
indent-style = "space"

[tool.mypy]
python_version = "3.11"
strict = true
ignore_missing_imports = true
```

### Testing Strategy

```python
# tests/conftest.py
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

from voice_clone.main import app
from voice_clone.models.base import Base
from voice_clone.dependencies import get_db

# Test database
TEST_DATABASE_URL = "postgresql+asyncpg://test:test@localhost:5432/voice_clone_test"

@pytest.fixture
async def db_session():
    """Create a fresh database session for each test."""
    engine = create_async_engine(TEST_DATABASE_URL)

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        yield session

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

@pytest.fixture
async def client(db_session):
    """Create a test client with database override."""
    def get_test_db():
        return db_session

    app.dependency_overrides[get_db] = get_test_db

    async with AsyncClient(app=app, base_url="http://test") as client:
        yield client

    app.dependency_overrides.clear()
```

---

## 10. Security Considerations

### API Key Management

```python
# config.py
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    """Application settings loaded from environment."""

    # Database
    database_url: str

    # AI Providers (secrets)
    openai_api_key: Optional[str] = None
    anthropic_api_key: Optional[str] = None

    # AI Configuration
    default_ai_provider: str = "anthropic"
    openai_model: str = "gpt-4-turbo"
    anthropic_model: str = "claude-3-opus-20240229"

    # File Storage
    storage_type: str = "local"  # "local" or "s3"
    storage_path: str = "./uploads"
    s3_bucket: Optional[str] = None

    # Security
    cors_origins: list[str] = ["http://localhost:3000"]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()
```

### Input Validation

All inputs are validated via Pydantic schemas with explicit constraints:

```python
# schemas/voice_clone.py
from pydantic import BaseModel, Field, field_validator
from typing import List, Optional
import re

class VoiceCloneCreate(BaseModel):
    """Schema for creating a voice clone."""

    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=2000)
    tags: List[str] = Field(default_factory=list, max_length=20)

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        # Only allow alphanumeric, spaces, hyphens, underscores
        if not re.match(r"^[\w\s\-]+$", v):
            raise ValueError("Name contains invalid characters")
        return v.strip()

    @field_validator("tags")
    @classmethod
    def validate_tags(cls, v: List[str]) -> List[str]:
        # Sanitize each tag
        return [tag.strip()[:50] for tag in v if tag.strip()]
```

---

## 11. AI-Friendly Patterns

### Pattern 1: Explicit Dependencies

```python
# GOOD: Explicit dependency injection
@app.get("/api/voice-clones/{clone_id}")
async def get_voice_clone(
    clone_id: UUID,
    service: VoiceCloneService = Depends(get_voice_clone_service)
) -> VoiceCloneResponse:
    clone = await service.get_by_id(clone_id)
    if not clone:
        raise HTTPException(status_code=404, detail="Voice clone not found")
    return VoiceCloneResponse.model_validate(clone)

# BAD: Hidden dependencies
@app.get("/api/voice-clones/{clone_id}")
async def get_voice_clone(clone_id: UUID):
    # Where does service come from? Unclear to AI
    clone = await service.get_by_id(clone_id)  # type: ignore
```

### Pattern 2: Clear Error Handling

```python
# GOOD: Explicit error handling with clear messages
async def analyze_voice_dna(clone_id: UUID) -> VoiceDna:
    clone = await get_voice_clone(clone_id)

    if not clone.samples:
        raise ValueError(
            f"Voice clone '{clone.name}' has no samples. "
            "Add at least one writing sample before analyzing."
        )

    if sum(s.word_count for s in clone.samples) < 500:
        raise ValueError(
            f"Voice clone '{clone.name}' needs more text. "
            f"Current: {sum(s.word_count for s in clone.samples)} words. "
            "Minimum: 500 words."
        )

    # Proceed with analysis...
```

### Pattern 3: Self-Documenting Code

```python
# GOOD: Clear function with docstring and type hints
async def calculate_confidence_score(clone: VoiceClone) -> int:
    """Calculate confidence score for a voice clone.

    The score (0-100) indicates how well the voice can be cloned
    based on the quantity and variety of writing samples.

    Scoring breakdown:
    - Word count: 0-30 points
    - Sample count: 0-20 points
    - Content type variety: 0-20 points
    - Length distribution: 0-15 points
    - Consistency: 0-15 points

    Args:
        clone: The voice clone to score

    Returns:
        Confidence score from 0-100
    """
    score = 0

    # Word count score (max 30)
    total_words = sum(s.word_count for s in clone.samples)
    if total_words >= 10000:
        score += 30
    elif total_words >= 5000:
        score += 25
    # ... etc

    return score
```

### Pattern 4: Modular Services

Keep services focused on single responsibilities:

```python
# services/analysis.py - Only handles DNA analysis
# services/generation.py - Only handles content generation
# services/detection.py - Only handles AI detection scoring
# services/merge.py - Only handles voice clone merging
```

### Pattern 5: Configuration as Code

```python
# prompts/analysis.py
VOICE_DNA_ANALYSIS_PROMPT = """
You are an expert linguistic analyst. Analyze the following writing samples
to extract a comprehensive "Voice DNA" profile.

## Instructions
{instructions}

## Writing Samples
{samples}

## Output Format
Return a JSON object following this exact structure:
{structure}

Analyze thoroughly and be specific. Include actual examples from the text.
"""

def build_analysis_prompt(
    samples: List[str],
    instructions: str,
    structure: dict
) -> str:
    """Build the voice DNA analysis prompt.

    Args:
        samples: List of writing sample texts
        instructions: Custom analysis instructions
        structure: Expected output JSON structure

    Returns:
        Formatted prompt string
    """
    return VOICE_DNA_ANALYSIS_PROMPT.format(
        instructions=instructions,
        samples="\n\n---\n\n".join(samples),
        structure=json.dumps(structure, indent=2)
    )
```

---

## 12. Migration Path from Original Plan

### Changes from Original PRD

| Original | New | Rationale |
|----------|-----|-----------|
| Next.js API Routes (TypeScript) | FastAPI (Python) | Better AI/ML ecosystem, more training data |
| Prisma ORM | SQLAlchemy 2.0 | More explicit, better type hints |
| npm packages | uv + Python packages | Faster, more reliable |
| Combined frontend/backend | Separate services | Clearer boundaries for AI |
| cheerio + puppeteer | BeautifulSoup + Playwright | Python equivalents |
| pdf-parse, mammoth | PyMuPDF, python-docx | More reliable Python alternatives |

### Implementation Order

1. **Phase 1: Foundation**
   - Set up project structure
   - Configure PostgreSQL + SQLAlchemy
   - Create base models
   - Set up FastAPI with basic endpoints

2. **Phase 2: Core Features**
   - Voice clone CRUD
   - Writing sample management
   - File parsers (PDF, DOCX, URL)
   - AI provider abstraction

3. **Phase 3: Intelligence**
   - Voice DNA analysis
   - Content generation
   - AI detection heuristics
   - Voice clone merging

4. **Phase 4: Frontend**
   - Set up Next.js frontend
   - Build UI components
   - Connect to API
   - Polish UX

5. **Phase 5: Production**
   - Deployment configuration
   - Security hardening
   - Performance optimization
   - Documentation

---

## Summary

This tech stack prioritizes:

1. **Python backend** with FastAPI for AI-friendly development
2. **Explicit patterns** over magic and convention
3. **Strong typing** throughout (Python type hints, TypeScript)
4. **Modular architecture** that AI can understand and modify
5. **Well-documented libraries** with extensive training data coverage

The separation of frontend and backend, combined with clear service boundaries and explicit dependencies, creates a codebase that AI can maintain and extend reliably.
