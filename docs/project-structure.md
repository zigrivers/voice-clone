# Voice Clone - Project Structure Guide

**Version**: 1.1
**Created**: February 4, 2026
**Updated**: February 4, 2026
**Purpose**: Comprehensive guide to project organization optimized for AI-assisted development

---

## Table of Contents

1. [Overview](#1-overview)
2. [Root Level Structure](#2-root-level-structure)
3. [Backend Structure (Python/FastAPI)](#3-backend-structure-pythonfastapi)
4. [Frontend Structure (Next.js)](#4-frontend-structure-nextjs)
5. [Shared/Cross-Cutting Concerns](#5-sharedcross-cutting-concerns)
6. [Naming Conventions](#6-naming-conventions)
7. [File Templates](#7-file-templates)
8. [Anti-Patterns](#8-anti-patterns)

---

## 1. Overview

### Repository Layout

```
voice-clone/                    # Repository root
├── docs/                       # Documentation
├── backend/                    # Python/FastAPI backend (single package)
├── frontend/                   # Next.js frontend (single package)
├── scripts/                    # Development and deployment scripts
├── .gitignore
├── docker-compose.yml
├── CLAUDE.md                   # AI assistant instructions
└── README.md
```

### Design Philosophy

This structure is optimized for **AI-assisted development**:

1. **Explicit over implicit** - No magic, clear file purposes
2. **Flat when possible** - Avoid deep nesting that confuses AI context
3. **Consistent patterns** - Same structure repeated across similar concerns
4. **Self-documenting** - File names describe their contents
5. **Single responsibility** - Each file/module has one clear purpose

### Key Principles

| Principle | Application |
|-----------|-------------|
| **Separation of concerns** | Backend and frontend are completely separate packages |
| **Module-by-feature** | Group related functionality together (services, models, schemas) |
| **No shared code** | Backend and frontend don't share code; API contracts are explicit |
| **Flat imports** | Prefer shallow import paths over deep nesting |

---

## 2. Root Level Structure

### Complete Root Layout

```
voice-clone/
├── docs/                       # All documentation
│   ├── plan.md                 # Product Requirements Document (PRD)
│   ├── tech-stack.md           # Technology decisions and patterns
│   ├── project-structure.md    # This document
│   └── git-workflow.md         # Git conventions and workflow
│
├── backend/                    # Python backend application
│   └── ...                     # (see Section 3)
│
├── frontend/                   # Next.js frontend application
│   └── ...                     # (see Section 4)
│
├── scripts/                    # Development scripts
│   ├── setup-hooks.sh          # Install git hooks
│   ├── worktree.sh             # Git worktree management
│   └── hooks/                  # Git hook scripts
│       ├── pre-commit
│       └── commit-msg
│
├── .env.example                # Environment variable template
├── .gitignore                  # Git ignore rules
├── docker-compose.yml          # Local development services
├── CLAUDE.md                   # AI assistant project instructions
└── README.md                   # Project overview and setup
```

### File Purposes

| File/Directory | Purpose |
|----------------|---------|
| `docs/` | All project documentation; never code here |
| `backend/` | Complete Python/FastAPI application |
| `frontend/` | Complete Next.js application |
| `scripts/` | Shell scripts for development automation |
| `.env.example` | Template showing required environment variables |
| `docker-compose.yml` | PostgreSQL and other local services |
| `CLAUDE.md` | Instructions for AI assistants working on this project |

### CLAUDE.md Placement

The `CLAUDE.md` file lives at the repository root and contains:
- Project overview and tech stack summary
- Development commands
- Git workflow rules
- Links to detailed documentation

AI assistants read this file first to understand project conventions.

---

## 3. Backend Structure (Python/FastAPI)

### Complete Backend Layout

```
backend/
├── pyproject.toml              # Project metadata and dependencies
├── uv.lock                     # Locked dependency versions
├── .python-version             # Python version specification
│
├── alembic/                    # Database migrations
│   ├── alembic.ini             # Alembic configuration
│   ├── env.py                  # Migration environment setup
│   └── versions/               # Migration files
│       └── 001_initial.py      # Numbered migration files
│
├── src/                        # Source code root
│   └── voice_clone/            # Main package (matches project name)
│       ├── __init__.py         # Package marker (can be empty)
│       ├── main.py             # FastAPI app entry point
│       ├── config.py           # Pydantic settings and configuration
│       ├── dependencies.py     # FastAPI dependency injection
│       │
│       ├── api/                # HTTP layer - routes only
│       │   ├── __init__.py
│       │   ├── router.py       # Main router that includes all subrouters
│       │   ├── auth.py         # /api/v1/auth/* endpoints (OAuth callbacks)
│       │   ├── voice_clones.py # /api/v1/voice-clones/* endpoints
│       │   ├── content.py      # /api/v1/content/* endpoints
│       │   ├── library.py      # /api/v1/library/* endpoints
│       │   ├── settings.py     # /api/v1/settings/* endpoints
│       │   └── usage.py        # /api/v1/usage/* endpoints
│       │
│       ├── models/             # SQLAlchemy ORM models
│       │   ├── __init__.py     # Export all models
│       │   ├── base.py         # Base model class, common fields
│       │   ├── user.py         # User, UserApiKey models
│       │   ├── voice_clone.py  # VoiceClone model
│       │   ├── writing_sample.py
│       │   ├── voice_dna.py    # VoiceDnaVersion model
│       │   ├── content.py      # Content, ContentTemplate models
│       │   ├── settings.py     # Settings, PlatformSettings models
│       │   └── usage.py        # ApiUsageLog model
│       │
│       ├── schemas/            # Pydantic schemas for API
│       │   ├── __init__.py
│       │   ├── user.py         # UserResponse, ApiKeyCreate, etc.
│       │   ├── voice_clone.py  # VoiceCloneCreate, VoiceCloneResponse, etc.
│       │   ├── content.py      # ContentCreate, ContentResponse, TemplateCreate, etc.
│       │   ├── settings.py     # SettingsUpdate, etc.
│       │   └── usage.py        # UsageSummary, UsageLog, etc.
│       │
│       ├── services/           # Business logic layer
│       │   ├── __init__.py
│       │   ├── user.py         # UserService - user and API key management
│       │   ├── voice_clone.py  # VoiceCloneService class
│       │   ├── analysis.py     # AnalysisService - DNA extraction
│       │   ├── generation.py   # GenerationService - content creation
│       │   ├── detection.py    # DetectionService - AI scoring
│       │   ├── merge.py        # MergeService - voice clone merging
│       │   └── usage.py        # UsageService - API usage tracking
│       │
│       ├── ai/                 # AI provider integration
│       │   ├── __init__.py     # get_ai_provider factory function
│       │   ├── provider.py     # AIProvider abstract base class
│       │   ├── openai_provider.py
│       │   ├── anthropic_provider.py
│       │   └── prompts/        # Prompt templates
│       │       ├── __init__.py
│       │       ├── analysis.py # Voice DNA analysis prompts
│       │       ├── generation.py
│       │       └── merge.py
│       │
│       ├── parsers/            # File and URL parsing
│       │   ├── __init__.py
│       │   ├── pdf.py          # extract_text_from_pdf()
│       │   ├── docx.py         # extract_text_from_docx()
│       │   └── url.py          # extract_text_from_url()
│       │
│       └── utils/              # Shared utilities
│           ├── __init__.py
│           ├── text.py         # Text processing helpers
│           └── encryption.py   # Fernet encryption for API keys
│
└── tests/                      # Test files mirror src/ structure
    ├── __init__.py
    ├── conftest.py             # Pytest fixtures
    ├── test_voice_clones.py    # Tests for voice clone features
    ├── test_content.py
    └── test_detection.py
```

### Directory Explanations

#### `api/` - HTTP Layer
Contains **only** route definitions. No business logic here.

```python
# api/voice_clones.py - GOOD
@router.get("/{clone_id}")
async def get_voice_clone(
    clone_id: UUID,
    service: VoiceCloneService = Depends(get_voice_clone_service)
) -> VoiceCloneResponse:
    clone = await service.get_by_id(clone_id)
    if not clone:
        raise HTTPException(status_code=404)
    return VoiceCloneResponse.model_validate(clone)
```

Routes should:
- Accept request data
- Call service methods
- Return response schemas
- Handle HTTP-specific concerns (status codes, headers)

#### `models/` - Database Models
SQLAlchemy ORM models representing database tables.

```python
# models/voice_clone.py
class VoiceClone(Base):
    __tablename__ = "voice_clones"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255), unique=True)
    # ... fields and relationships
```

Models should:
- Define table structure
- Define relationships
- Use explicit type hints (`Mapped[]`)
- Keep methods minimal (property accessors only)

#### `schemas/` - API Contracts
Pydantic models for request/response validation.

```python
# schemas/voice_clone.py
class VoiceCloneCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: str | None = None

class VoiceCloneResponse(BaseModel):
    id: UUID
    name: str
    confidence_score: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
```

Schemas should:
- Define validation rules
- Separate Create/Update/Response schemas
- Enable `from_attributes` for ORM compatibility

#### `services/` - Business Logic
Where the actual work happens. Each service is a class.

```python
# services/voice_clone.py
class VoiceCloneService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, clone_id: UUID) -> VoiceClone | None:
        result = await self.db.execute(
            select(VoiceClone).where(VoiceClone.id == clone_id)
        )
        return result.scalar_one_or_none()
```

Services should:
- Contain all business logic
- Accept dependencies via constructor
- Return domain objects (models), not schemas
- Be testable in isolation

#### `ai/` - AI Provider Integration
Abstraction layer for AI providers (OpenAI, Anthropic).

Structure:
- `provider.py` - Abstract base class defining interface
- `*_provider.py` - Concrete implementations
- `prompts/` - Prompt templates as Python strings

#### `parsers/` - File Processing
Standalone functions for extracting text from various sources.

```python
# parsers/pdf.py
async def extract_text_from_pdf(source: Path | bytes) -> str:
    """Extract text from PDF file or bytes."""
    ...
```

### API Versioning

All API routes use version prefix:

```python
# api/router.py
api_router = APIRouter(prefix="/api/v1")
api_router.include_router(voice_clones.router, prefix="/voice-clones")
api_router.include_router(content.router, prefix="/content")
```

Resulting endpoints:
- `GET /api/v1/voice-clones`
- `POST /api/v1/voice-clones`
- `GET /api/v1/voice-clones/{id}`
- etc.

---

## 4. Frontend Structure (Next.js)

### Complete Frontend Layout

```
frontend/
├── package.json
├── package-lock.json
├── next.config.js              # Next.js configuration
├── tailwind.config.ts          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
├── postcss.config.js
├── .eslintrc.json
│
├── public/                     # Static assets (served as-is)
│   ├── favicon.ico
│   └── images/
│
└── src/                        # Source code
    ├── app/                    # Next.js App Router
    │   ├── layout.tsx          # Root layout (providers, global styles)
    │   ├── page.tsx            # Home page (/)
    │   ├── loading.tsx         # Global loading state
    │   ├── error.tsx           # Global error boundary
    │   ├── not-found.tsx       # 404 page
    │   │
    │   ├── api/                # API routes (Next.js)
    │   │   └── auth/
    │   │       └── [...nextauth]/
    │   │           └── route.ts  # Auth.js route handler
    │   │
    │   ├── auth/               # /auth routes
    │   │   ├── signin/
    │   │   │   └── page.tsx    # OAuth sign-in page
    │   │   └── signout/
    │   │       └── page.tsx    # Sign-out confirmation
    │   │
    │   ├── voice-clones/       # /voice-clones routes
    │   │   ├── page.tsx        # Voice clones list
    │   │   ├── [id]/           # /voice-clones/[id]
    │   │   │   ├── page.tsx    # Voice clone detail
    │   │   │   └── edit/
    │   │   │       └── page.tsx
    │   │   └── new/
    │   │       └── page.tsx    # Create new voice clone
    │   │
    │   ├── create/             # /create - content creation
    │   │   └── page.tsx
    │   │
    │   ├── library/            # /library - content library
    │   │   └── page.tsx
    │   │
    │   └── settings/           # /settings
    │       ├── page.tsx        # Settings overview
    │       ├── ai-provider/
    │       │   └── page.tsx    # AI provider configuration
    │       └── usage/
    │           └── page.tsx    # Usage tracking dashboard
    │
    ├── components/             # React components
    │   ├── ui/                 # shadcn/ui base components
    │   │   ├── button.tsx
    │   │   ├── card.tsx
    │   │   ├── dialog.tsx
    │   │   ├── input.tsx
    │   │   └── ...
    │   │
    │   ├── auth/               # Authentication components
    │   │   ├── auth-provider.tsx     # Session provider wrapper
    │   │   ├── sign-in-button.tsx    # OAuth sign-in buttons
    │   │   ├── sign-out-button.tsx
    │   │   └── user-menu.tsx         # User avatar/dropdown
    │   │
    │   ├── voice-clone/        # Voice clone feature components
    │   │   ├── voice-clone-card.tsx
    │   │   ├── voice-clone-form.tsx
    │   │   ├── voice-clone-comparison.tsx  # Side-by-side comparison
    │   │   ├── sample-uploader.tsx
    │   │   ├── dna-viewer.tsx
    │   │   └── confidence-badge.tsx
    │   │
    │   ├── content/            # Content creation components
    │   │   ├── content-editor.tsx
    │   │   ├── platform-selector.tsx
    │   │   ├── properties-panel.tsx
    │   │   ├── detection-score.tsx
    │   │   ├── variation-comparison.tsx    # A/B variations view
    │   │   └── template-selector.tsx       # Content templates
    │   │
    │   ├── library/            # Library components
    │   │   ├── content-table.tsx
    │   │   ├── content-filters.tsx
    │   │   └── content-preview.tsx
    │   │
    │   ├── settings/           # Settings components
    │   │   ├── ai-provider-settings.tsx
    │   │   └── usage-dashboard.tsx
    │   │
    │   └── layout/             # Layout components
    │       ├── header.tsx
    │       ├── sidebar.tsx
    │       └── nav-link.tsx
    │
    ├── lib/                    # Utilities and configuration
    │   ├── api.ts              # API client (axios instance)
    │   ├── auth.ts             # Auth.js configuration
    │   ├── utils.ts            # General utilities (cn, formatDate, etc.)
    │   └── validations.ts      # Zod schemas for form validation
    │
    ├── hooks/                  # Custom React hooks
    │   ├── use-session.ts      # Auth session hook wrapper
    │   ├── use-voice-clones.ts # TanStack Query hooks for voice clones
    │   ├── use-content.ts
    │   ├── use-templates.ts    # Content templates hooks
    │   ├── use-settings.ts
    │   ├── use-usage.ts        # API usage tracking hooks
    │   └── use-debounce.ts
    │
    ├── stores/                 # Zustand state stores
    │   └── app-store.ts        # UI state (sidebar, modals, etc.)
    │
    └── types/                  # TypeScript type definitions
        ├── index.ts            # Re-export all types
        ├── auth.ts             # User, Session types
        ├── voice-clone.ts      # VoiceClone, WritingSample types
        ├── content.ts          # Content, Platform, Template types
        ├── usage.ts            # UsageSummary, UsageLog types
        └── api.ts              # API response types
```

### Directory Explanations

#### `app/` - App Router
Next.js 14+ App Router using file-based routing.

```
app/
├── page.tsx                    # Route: /
├── voice-clones/
│   ├── page.tsx                # Route: /voice-clones
│   └── [id]/
│       └── page.tsx            # Route: /voice-clones/:id
```

Each route directory can contain:
- `page.tsx` - The page component (required for route to exist)
- `layout.tsx` - Layout wrapper for this route and children
- `loading.tsx` - Loading UI (shows during suspense)
- `error.tsx` - Error boundary
- `not-found.tsx` - 404 for this segment

#### `components/` - React Components

Organization by feature, not by type:

```
components/
├── ui/                 # Generic, reusable (shadcn/ui)
├── voice-clone/        # Voice clone feature
├── content/            # Content creation feature
├── library/            # Content library feature
└── layout/             # App shell components
```

**Why feature-based?**
- Related components stay together
- Easy to find what you need
- Scales better than type-based (`buttons/`, `forms/`, `cards/`)

#### `lib/` - Utilities

Non-React utilities and configuration:

```typescript
// lib/api.ts - API client
import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' }
});

// lib/utils.ts - General utilities
export function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US').format(new Date(date));
}
```

#### `hooks/` - Custom Hooks

TanStack Query hooks for server state:

```typescript
// hooks/use-voice-clones.ts
export function useVoiceClones() {
  return useQuery({
    queryKey: ['voice-clones'],
    queryFn: () => api.get('/voice-clones').then(r => r.data)
  });
}

export function useVoiceClone(id: string) {
  return useQuery({
    queryKey: ['voice-clone', id],
    queryFn: () => api.get(`/voice-clones/${id}`).then(r => r.data)
  });
}
```

#### `stores/` - Zustand Stores

Client-side UI state only:

```typescript
// stores/app-store.ts
interface AppState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen }))
}));
```

**State Management Strategy:**

| State Type | Solution |
|------------|----------|
| Auth state | Auth.js (NextAuth) |
| Server data | TanStack Query |
| UI state | Zustand |
| Form state | React Hook Form |
| URL state | Next.js searchParams |

---

## 5. Shared/Cross-Cutting Concerns

### Environment Variables

#### Root `.env.example`

```bash
# Database
DATABASE_URL=postgresql+asyncpg://voice_clone:localdev@localhost:5432/voice_clone

# AI Providers (optional - users can also configure via UI)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
DEFAULT_AI_PROVIDER=anthropic

# Security
ENCRYPTION_KEY=your-fernet-encryption-key-here  # For encrypting user API keys

# OAuth (Auth.js)
AUTH_SECRET=your-nextauth-secret-here
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

#### Backend `.env`
```
backend/.env                    # Backend-specific overrides (gitignored)
```

#### Frontend `.env.local`
```
frontend/.env.local             # Frontend-specific (gitignored)
```

**Naming convention:**
- `NEXT_PUBLIC_*` - Exposed to browser (frontend only)
- All other vars - Server-side only

### Docker Configuration

```yaml
# docker-compose.yml (root)
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

volumes:
  pgdata:
```

Backend and frontend run natively during development:
- Backend: `cd backend && uv run uvicorn voice_clone.main:app --reload`
- Frontend: `cd frontend && npm run dev`

### Scripts Directory

```
scripts/
├── setup-hooks.sh              # Install git hooks
├── worktree.sh                 # Manage git worktrees
└── hooks/
    ├── pre-commit              # Block commits to main
    └── commit-msg              # Validate commit message format
```

---

## 6. Naming Conventions

### Complete Convention Table

| Item | Convention | Example |
|------|------------|---------|
| **Python files** | snake_case | `voice_clone.py`, `writing_sample.py` |
| **Python classes** | PascalCase | `VoiceClone`, `WritingSample` |
| **Python functions** | snake_case | `get_by_id`, `extract_text` |
| **Python constants** | UPPER_SNAKE_CASE | `MAX_SAMPLES`, `DEFAULT_MODEL` |
| **Python packages** | snake_case | `voice_clone`, `ai_providers` |
| **TypeScript files** | kebab-case | `voice-clone.ts`, `use-voice-clones.ts` |
| **React components** | PascalCase | `VoiceCloneCard`, `PlatformSelector` |
| **React component files** | kebab-case | `voice-clone-card.tsx` |
| **TypeScript interfaces** | PascalCase | `VoiceClone`, `ApiResponse` |
| **TypeScript functions** | camelCase | `formatDate`, `useVoiceClones` |
| **CSS classes** | kebab-case (Tailwind) | `text-primary`, `bg-muted` |
| **Database tables** | snake_case plural | `voice_clones`, `writing_samples` |
| **Database columns** | snake_case | `created_at`, `voice_clone_id` |
| **API endpoints** | kebab-case | `/voice-clones`, `/writing-samples` |
| **Environment vars** | UPPER_SNAKE_CASE | `DATABASE_URL`, `API_KEY` |
| **Git branches** | kebab-case with prefix | `feat/voice-merger`, `fix/upload-bug` |

### Examples

#### Python (Backend)

```python
# File: backend/src/voice_clone/services/voice_clone.py

MAX_SAMPLES_PER_CLONE = 100  # Constant

class VoiceCloneService:  # Class
    async def get_by_id(self, clone_id: UUID):  # Method
        pass

    def _calculate_score(self, samples: list):  # Private method
        pass
```

#### TypeScript (Frontend)

```typescript
// File: frontend/src/components/voice-clone/voice-clone-card.tsx

interface VoiceCloneCardProps {  // Interface
  voiceClone: VoiceClone;
  onSelect: (id: string) => void;
}

export function VoiceCloneCard({ voiceClone, onSelect }: VoiceCloneCardProps) {
  const handleClick = () => {  // Local function
    onSelect(voiceClone.id);
  };

  return <div className="voice-clone-card">...</div>;
}
```

---

## 7. File Templates

### Python Service Template

```python
"""Service for [feature] operations."""

from typing import Optional, List
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from voice_clone.models import ModelName
from voice_clone.schemas import CreateSchema, UpdateSchema


class FeatureService:
    """Service for [feature] operations."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, item_id: UUID) -> Optional[ModelName]:
        """Get item by ID."""
        result = await self.db.execute(
            select(ModelName).where(ModelName.id == item_id)
        )
        return result.scalar_one_or_none()

    async def get_all(self) -> List[ModelName]:
        """Get all items."""
        result = await self.db.execute(
            select(ModelName).order_by(ModelName.created_at.desc())
        )
        return list(result.scalars().all())

    async def create(self, data: CreateSchema) -> ModelName:
        """Create new item."""
        item = ModelName(**data.model_dump())
        self.db.add(item)
        await self.db.commit()
        await self.db.refresh(item)
        return item
```

### Python API Router Template

```python
"""API routes for [feature]."""

from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status

from voice_clone.dependencies import get_feature_service
from voice_clone.schemas import CreateSchema, ResponseSchema
from voice_clone.services import FeatureService


router = APIRouter(tags=["feature"])


@router.get("", response_model=List[ResponseSchema])
async def list_items(
    service: FeatureService = Depends(get_feature_service)
) -> List[ResponseSchema]:
    """List all items."""
    items = await service.get_all()
    return [ResponseSchema.model_validate(item) for item in items]


@router.get("/{item_id}", response_model=ResponseSchema)
async def get_item(
    item_id: UUID,
    service: FeatureService = Depends(get_feature_service)
) -> ResponseSchema:
    """Get item by ID."""
    item = await service.get_by_id(item_id)
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found"
        )
    return ResponseSchema.model_validate(item)


@router.post("", response_model=ResponseSchema, status_code=status.HTTP_201_CREATED)
async def create_item(
    data: CreateSchema,
    service: FeatureService = Depends(get_feature_service)
) -> ResponseSchema:
    """Create new item."""
    item = await service.create(data)
    return ResponseSchema.model_validate(item)
```

### React Component Template

```tsx
// components/feature/feature-card.tsx

interface FeatureCardProps {
  item: FeatureItem;
  onAction?: (id: string) => void;
}

export function FeatureCard({ item, onAction }: FeatureCardProps) {
  return (
    <div className="rounded-lg border p-4">
      <h3 className="font-medium">{item.name}</h3>
      {item.description && (
        <p className="text-sm text-muted-foreground">{item.description}</p>
      )}
      {onAction && (
        <button
          onClick={() => onAction(item.id)}
          className="mt-2 text-sm text-primary"
        >
          Select
        </button>
      )}
    </div>
  );
}
```

### React Hook Template (TanStack Query)

```typescript
// hooks/use-feature.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Feature, FeatureCreate } from '@/types';

const QUERY_KEY = ['features'];

export function useFeatures() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: async (): Promise<Feature[]> => {
      const { data } = await api.get('/features');
      return data;
    }
  });
}

export function useFeature(id: string) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: async (): Promise<Feature> => {
      const { data } = await api.get(`/features/${id}`);
      return data;
    },
    enabled: !!id
  });
}

export function useCreateFeature() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: FeatureCreate): Promise<Feature> => {
      const { data: response } = await api.post('/features', data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    }
  });
}
```

### Import Ordering

#### Python

```python
# 1. Standard library
import json
from datetime import datetime
from typing import Optional, List
from uuid import UUID

# 2. Third-party packages
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import select

# 3. Local imports (absolute)
from voice_clone.models import VoiceClone
from voice_clone.schemas import VoiceCloneCreate
from voice_clone.services import VoiceCloneService
```

#### TypeScript

```typescript
// 1. React/Next.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// 2. Third-party
import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

// 3. Internal - absolute imports
import { Button } from '@/components/ui/button';
import { useVoiceClones } from '@/hooks/use-voice-clones';
import type { VoiceClone } from '@/types';

// 4. Relative imports (same feature)
import { VoiceCloneCard } from './voice-clone-card';
```

---

## 8. Anti-Patterns

### What NOT to Do

#### Backend Anti-Patterns

| Anti-Pattern | Why It's Bad | Do This Instead |
|--------------|--------------|-----------------|
| Business logic in routes | Hard to test, violates SRP | Put logic in services |
| Raw SQL in routes | Security risk, no abstraction | Use service layer with SQLAlchemy |
| Circular imports | Confuses AI, runtime errors | Careful module organization |
| `from module import *` | Unclear dependencies | Import specific names |
| Mutable default arguments | Subtle bugs | Use `None` and create inside function |
| Deep inheritance | Hard to understand | Composition over inheritance |
| Magic methods for business logic | AI can't follow | Explicit method calls |

```python
# BAD: Logic in route
@router.post("/voice-clones")
async def create(data: VoiceCloneCreate, db: AsyncSession = Depends(get_db)):
    # 50 lines of business logic here...
    pass

# GOOD: Route calls service
@router.post("/voice-clones")
async def create(
    data: VoiceCloneCreate,
    service: VoiceCloneService = Depends(get_service)
):
    return await service.create(data)
```

#### Frontend Anti-Patterns

| Anti-Pattern | Why It's Bad | Do This Instead |
|--------------|--------------|-----------------|
| Fetching in components | Duplicated logic, no caching | Use TanStack Query hooks |
| Props drilling 5+ levels | Unmaintainable | Context or composition |
| State in wrong place | Re-renders, bugs | Lift state appropriately |
| Large components (500+ lines) | Hard to understand | Extract sub-components |
| Index files everywhere | Confusing imports | Direct file imports |
| `any` type | Loses type safety | Define proper types |
| Inline styles for complex styling | Inconsistent | Tailwind classes |

```tsx
// BAD: Fetch in component
function VoiceCloneList() {
  const [clones, setClones] = useState([]);
  useEffect(() => {
    fetch('/api/voice-clones').then(r => r.json()).then(setClones);
  }, []);
  // ...
}

// GOOD: Use hook
function VoiceCloneList() {
  const { data: clones, isLoading } = useVoiceClones();
  // ...
}
```

#### Project Structure Anti-Patterns

| Anti-Pattern | Why It's Bad | Do This Instead |
|--------------|--------------|-----------------|
| Shared code between packages | Coupling, sync issues | Duplicate or use API contracts |
| `utils/` dumping ground | Becomes unorganized | Specific utility modules |
| Deeply nested directories | Hard to navigate | Keep flat, max 3-4 levels |
| Inconsistent naming | Confusion | Follow conventions strictly |
| No clear module boundaries | Spaghetti code | One responsibility per module |
| config.ts with everything | Unclear | Separate by concern |

```
# BAD: Deep nesting
src/features/voice-clone/components/forms/inputs/text/index.tsx

# GOOD: Flat structure
src/components/voice-clone/voice-clone-form.tsx
```

---

## Quick Reference

### Where to Put Things

| You're Creating | Backend Location | Frontend Location |
|-----------------|------------------|-------------------|
| New API endpoint | `api/feature.py` | - |
| Database model | `models/feature.py` | - |
| Request/response types | `schemas/feature.py` | `types/feature.ts` |
| Business logic | `services/feature.py` | - |
| AI integration | `ai/` | - |
| File parser | `parsers/` | - |
| Encryption utility | `utils/encryption.py` | - |
| Auth-related logic | `services/user.py` | `lib/auth.ts` |
| React component | - | `components/feature/` |
| Auth component | - | `components/auth/` |
| Page/route | - | `app/feature/page.tsx` |
| API hook | - | `hooks/use-feature.ts` |
| UI state | - | `stores/app-store.ts` |
| Utility function | `utils/` | `lib/utils.ts` |

### Common Commands

```bash
# Backend
cd backend
uv sync                         # Install dependencies
uv run uvicorn voice_clone.main:app --reload  # Start dev server
uv run pytest                   # Run tests
uv run alembic upgrade head     # Run migrations

# Frontend
cd frontend
npm install                     # Install dependencies
npm run dev                     # Start dev server
npm run build                   # Production build
npm run lint                    # Lint check

# Database
docker compose up -d            # Start PostgreSQL
docker compose down             # Stop PostgreSQL
```

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-02-04 | Ken + Claude | Initial project structure document |
| 1.1 | 2026-02-04 | Ken + Claude | Added auth routes/components (Auth.js), new models (user.py, usage.py), services (user.py, usage.py), encryption utility, content templates, settings pages for AI provider and usage tracking. Updated environment variables for OAuth. |

---

*End of Document*
