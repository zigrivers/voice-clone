# Voice Clone Implementation Plan

**Version**: 1.0
**Created**: February 4, 2026
**Scope**: P0 User Stories Only (45 stories)
**Organization**: Layer-first (Backend → Frontend)
**Session Strategy**: Single session, sequential work
**Parallelization**: Conservative (only when domains completely independent)

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Phase Overview](#phase-overview)
3. [Phase 1: Project Setup & Infrastructure](#phase-1-project-setup--infrastructure)
4. [Phase 2: Backend Models & Database](#phase-2-backend-models--database)
5. [Phase 3: Backend Services & API Routes](#phase-3-backend-services--api-routes)
6. [Phase 4: Frontend Foundation](#phase-4-frontend-foundation)
7. [Phase 5: Frontend Features](#phase-5-frontend-features)
8. [Phase 6: Integration & Polish](#phase-6-integration--polish)
9. [Dependency Chains](#dependency-chains)
10. [Task Reference by User Story](#task-reference-by-user-story)

---

## Executive Summary

This plan breaks down 45 P0 user stories across 7 epics into **92 implementation tasks**, organized in a layer-first approach. Each task includes full AI context: description, files to modify, code patterns to follow, test requirements, and verification steps.

**Key Statistics:**
- Total Tasks: 92
- P0 User Stories Covered: 45
- Estimated Development Time: Sequential single-session work
- Parallelizable Tasks: 6 (marked explicitly)

---

## Phase Overview

| Phase | Purpose | Tasks | Dependencies |
|-------|---------|-------|--------------|
| **Phase 1** | Project Setup & Infrastructure | 15 | None |
| **Phase 2** | Backend Models & Database | 16 | Phase 1 |
| **Phase 3** | Backend Services & API Routes | 28 | Phase 2 |
| **Phase 4** | Frontend Foundation | 12 | Phase 1 (partial) |
| **Phase 5** | Frontend Features | 18 | Phases 3, 4 |
| **Phase 6** | Integration & Polish | 3 | All prior |

---

## Phase 1: Project Setup & Infrastructure

**Purpose**: Establish development environment, project structure, and foundational tooling.

---

### Task 1.1: Initialize Python Backend Project

**User Stories**: US-07-005, US-07-006
**Parallel**: SEQUENTIAL
**Prerequisites**: None

**Description**: Create the backend directory structure with pyproject.toml, configure uv package manager, and set up the basic FastAPI application entry point.

**Files to Create**:
```
backend/
├── pyproject.toml
├── .python-version
└── src/voice_clone/
    ├── __init__.py
    ├── main.py
    └── config.py
```

**Code Patterns**:
- Follow project structure from `docs/project-structure.md` Section 3
- Use Pydantic Settings for configuration (`docs/tech-stack.md` Section 10)
- FastAPI app factory pattern

**pyproject.toml Template**:
```toml
[project]
name = "voice-clone-api"
version = "1.0.0"
requires-python = ">=3.11"

dependencies = [
    "fastapi>=0.109.0",
    "uvicorn[standard]>=0.27.0",
    "pydantic>=2.5.0",
    "pydantic-settings>=2.1.0",
    "sqlalchemy[asyncio]>=2.0.25",
    "alembic>=1.13.0",
    "asyncpg>=0.29.0",
    "openai>=1.10.0",
    "anthropic>=0.18.0",
    "pymupdf>=1.23.0",
    "python-docx>=1.1.0",
    "python-multipart>=0.0.6",
    "httpx>=0.26.0",
    "beautifulsoup4>=4.12.0",
    "lxml>=5.1.0",
    "spacy>=3.7.0",
    "textstat>=0.7.3",
    "python-dotenv>=1.0.0",
    "structlog>=24.1.0",
    "cryptography>=42.0.0",
]

[project.optional-dependencies]
dev = [
    "pytest>=7.4.0",
    "pytest-asyncio>=0.23.0",
    "pytest-cov>=4.1.0",
    "ruff>=0.1.0",
    "mypy>=1.8.0",
]
```

**Test Requirements**:
- Health check endpoint test
- Config loading test

**Verification**:
```bash
cd backend
uv sync
uv run uvicorn voice_clone.main:app --reload
# Should start on port 8000 without errors
```

---

### Task 1.2: Configure PostgreSQL Connection

**User Stories**: US-07-005
**Parallel**: SEQUENTIAL
**Prerequisites**: Task 1.1

**Description**: Set up SQLAlchemy 2.0 async engine, session management, and database configuration.

**Files to Create**:
```
backend/src/voice_clone/
├── database.py
└── models/
    ├── __init__.py
    └── base.py
```

**Code Patterns**:
- SQLAlchemy 2.0 async patterns from `docs/coding-standards.md` Section 4.3
- Use `Mapped[]` type hints for all columns
- Async session factory with dependency injection

**database.py Template**:
```python
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from voice_clone.config import settings

engine = create_async_engine(settings.database_url, echo=False)
async_session_maker = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def get_db() -> AsyncSession:
    async with async_session_maker() as session:
        yield session
```

**Test Requirements**:
- Database connection test
- Session lifecycle test

**Verification**:
```bash
# With PostgreSQL running
uv run python -c "from voice_clone.database import engine; print('Connected!')"
```

---

### Task 1.3: Set Up Alembic Migrations

**User Stories**: US-07-005
**Parallel**: SEQUENTIAL
**Prerequisites**: Task 1.2

**Description**: Initialize Alembic for database migrations with async support.

**Files to Create**:
```
backend/
├── alembic.ini
└── alembic/
    ├── env.py
    ├── script.py.mako
    └── versions/
```

**Code Patterns**:
- Async Alembic configuration
- Import all models in env.py for autogenerate support

**Test Requirements**:
- Migration up/down test

**Verification**:
```bash
cd backend
uv run alembic upgrade head
uv run alembic downgrade -1
uv run alembic upgrade head
```

---

### Task 1.4: Implement Health Check Endpoint

**User Stories**: US-07-006
**Parallel**: SEQUENTIAL
**Prerequisites**: Task 1.2

**Description**: Create `/health` endpoint with basic and detailed health checks including database connectivity.

**Files to Create**:
```
backend/src/voice_clone/api/
├── __init__.py
└── health.py
```

**Files to Modify**:
```
backend/src/voice_clone/main.py
```

**Code Patterns**:
- FastAPI route patterns from `docs/coding-standards.md` Section 3

**API Endpoints**:
```
GET /health         → {"status": "healthy"}
GET /health/detail  → {"status": "healthy", "database": "connected", "version": "1.0.0"}
```

**Test Requirements**:
- Unit test for health endpoint
- Integration test with DB connection check

**Verification**:
```bash
curl localhost:8000/health
# {"status": "healthy"}
```

---

### Task 1.5: Create API Error Response Framework

**User Stories**: US-07-004
**Parallel**: SEQUENTIAL
**Prerequisites**: Task 1.1

**Description**: Implement consistent error response format, exception handlers, and validation error formatting.

**Files to Create**:
```
backend/src/voice_clone/exceptions.py
```

**Files to Modify**:
```
backend/src/voice_clone/main.py
```

**Code Patterns**:
- Error handling patterns from `docs/coding-standards.md` Section 11
- Structured error responses with error codes

**Error Response Format**:
```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Voice clone with ID xxx not found",
    "details": {}
  }
}
```

**Test Requirements**:
- Tests for 400, 404, 422, 500 response formats

**Verification**:
- API returns structured error JSON for all error types

---

### Task 1.6: Initialize Next.js Frontend Project

**User Stories**: US-07-001
**Parallel**: PARALLEL with Task 1.1
**Prerequisites**: None

**Description**: Create Next.js 14+ App Router project with TypeScript, Tailwind CSS, and configure path aliases.

**Files to Create**:
```
frontend/
├── package.json
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── postcss.config.js
├── .eslintrc.json
└── src/
    └── app/
        ├── layout.tsx
        ├── page.tsx
        ├── loading.tsx
        ├── error.tsx
        └── not-found.tsx
```

**Code Patterns**:
- Frontend structure from `docs/project-structure.md` Section 4
- App Router conventions

**package.json Core Dependencies**:
```json
{
  "dependencies": {
    "next": "^14.1.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "next-auth": "^5.0.0",
    "@tanstack/react-query": "^5.17.0",
    "zustand": "^4.5.0",
    "axios": "^1.6.0",
    "zod": "^3.22.0",
    "tailwindcss": "^3.4.0"
  }
}
```

**Test Requirements**:
- Basic render test

**Verification**:
```bash
cd frontend
npm install
npm run dev
# Should start on localhost:3000
```

---

### Task 1.7: Install and Configure shadcn/ui

**User Stories**: US-07-001, US-07-003
**Parallel**: SEQUENTIAL
**Prerequisites**: Task 1.6

**Description**: Set up shadcn/ui component library and install core components.

**Files to Create**:
```
frontend/src/
├── components/ui/
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   ├── input.tsx
│   ├── textarea.tsx
│   ├── select.tsx
│   ├── tabs.tsx
│   ├── toast.tsx
│   └── toaster.tsx
└── lib/
    └── utils.ts
```

**Commands**:
```bash
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card dialog input textarea select tabs toast
```

**Test Requirements**:
- Component render tests

**Verification**:
- Components render correctly in browser

---

### Task 1.8: Configure TanStack Query

**User Stories**: Foundation for all API calls
**Parallel**: SEQUENTIAL
**Prerequisites**: Task 1.6

**Description**: Set up React Query provider, configure default options, and create API client.

**Files to Create**:
```
frontend/src/lib/
├── api.ts
└── query-client.tsx
```

**Files to Modify**:
```
frontend/src/app/layout.tsx
```

**Code Patterns**:
- TanStack Query patterns from `docs/coding-standards.md` Section 8
- QueryClientProvider in root layout

**api.ts Template**:
```typescript
import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
  headers: { 'Content-Type': 'application/json' }
});
```

**Test Requirements**:
- Query client initialization test

**Verification**:
- QueryClientProvider works in components

---

### Task 1.9: Configure Zustand Store

**User Stories**: US-07-003
**Parallel**: SEQUENTIAL
**Prerequisites**: Task 1.6

**Description**: Set up Zustand for UI state management (sidebar, modals, notifications).

**Files to Create**:
```
frontend/src/stores/app-store.ts
```

**Code Patterns**:
- Zustand patterns from `docs/coding-standards.md` Section 9

**Store Template**:
```typescript
import { create } from 'zustand';

interface AppState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen }))
}));
```

**Test Requirements**:
- Store state update tests

**Verification**:
- Store provides work for UI state

---

### Task 1.10: Create Docker Compose for Local Development

**User Stories**: Foundation
**Parallel**: PARALLEL with Tasks 1.1, 1.6
**Prerequisites**: None

**Description**: Configure Docker Compose with PostgreSQL service.

**Files to Create**:
```
docker-compose.yml
```

**docker-compose.yml Template**:
```yaml
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

**Verification**:
```bash
docker compose up -d
docker compose logs db
# PostgreSQL should be ready
```

---

### Task 1.11: Create Environment Configuration

**User Stories**: Foundation
**Parallel**: SEQUENTIAL
**Prerequisites**: Tasks 1.1, 1.6

**Description**: Create .env.example with all required variables.

**Files to Create**:
```
.env.example
backend/.env.example
frontend/.env.local.example
```

**.env.example Template**:
```bash
# Database
DATABASE_URL=postgresql+asyncpg://voice_clone:localdev@localhost:5432/voice_clone

# AI Providers
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
DEFAULT_AI_PROVIDER=anthropic

# Security
ENCRYPTION_KEY=your-32-byte-fernet-key-here

# OAuth
AUTH_SECRET=your-nextauth-secret-here
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

**Verification**:
- Both backend and frontend start with .env from example

---

### Task 1.12: Create FastAPI Dependency Injection Setup

**User Stories**: Foundation
**Parallel**: SEQUENTIAL
**Prerequisites**: Task 1.2

**Description**: Create dependency injection module for services.

**Files to Create**:
```
backend/src/voice_clone/dependencies.py
```

**Code Patterns**:
- FastAPI Depends pattern from `docs/tech-stack.md` Section 3

**Test Requirements**:
- Dependency resolution tests

**Verification**:
- Dependencies inject correctly in routes

---

### Task 1.13: Create Backend Test Configuration

**User Stories**: Foundation
**Parallel**: SEQUENTIAL
**Prerequisites**: Task 1.2

**Description**: Set up pytest with async support and test database.

**Files to Create**:
```
backend/tests/
├── __init__.py
├── conftest.py
└── test_health.py
```

**Code Patterns**:
- Test patterns from `docs/tdd-standards.md`
- Async pytest fixtures

**conftest.py Template**:
```python
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from voice_clone.main import app

TEST_DATABASE_URL = "postgresql+asyncpg://voice_clone:localdev@localhost:5432/voice_clone_test"

@pytest.fixture
async def client():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac
```

**Verification**:
```bash
cd backend
uv run pytest tests/ -v
```

---

### Task 1.14: Create Frontend Test Configuration

**User Stories**: Foundation
**Parallel**: SEQUENTIAL
**Prerequisites**: Task 1.6

**Description**: Set up Jest and React Testing Library.

**Files to Create**:
```
frontend/
├── jest.config.js
├── jest.setup.js
└── tests/
    └── components/
```

**Verification**:
```bash
cd frontend
npm test
```

---

### Task 1.15: Create Main README

**User Stories**: Foundation
**Parallel**: SEQUENTIAL
**Prerequisites**: Tasks 1.10, 1.11

**Description**: Create project README with setup instructions.

**Files to Create**:
```
README.md
```

**Content**:
- Project overview
- Quick start guide
- Development commands
- Architecture overview

---

## Phase 2: Backend Models & Database

**Purpose**: Define all database models, create initial migrations, establish data layer patterns.

---

### Task 2.1: Create User Model

**User Stories**: US-07-007
**Parallel**: SEQUENTIAL
**Prerequisites**: Task 1.2

**Description**: Define User model for OAuth-authenticated users.

**Files to Create**:
```
backend/src/voice_clone/models/user.py
```

**Model Fields**:
```python
class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    avatar_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    oauth_provider: Mapped[str] = mapped_column(String(50), nullable=False)
    oauth_id: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, onupdate=datetime.utcnow)
```

**Test Requirements**:
- Model instantiation test
- Unique email constraint test

---

### Task 2.2: Create UserApiKey Model

**User Stories**: US-07-008
**Parallel**: SEQUENTIAL
**Prerequisites**: Task 2.1

**Description**: Define model for storing encrypted user API keys.

**Files to Modify**:
```
backend/src/voice_clone/models/user.py
```

**Model Fields**:
```python
class UserApiKey(Base):
    __tablename__ = "user_api_keys"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    provider: Mapped[str] = mapped_column(String(50), nullable=False)  # 'openai' or 'anthropic'
    encrypted_api_key: Mapped[str] = mapped_column(Text, nullable=False)
    is_valid: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
```

**Test Requirements**:
- Relationship to User test
- Cascade delete test

---

### Task 2.3: Create VoiceClone Model

**User Stories**: US-02-001, US-02-002, US-02-003
**Parallel**: SEQUENTIAL
**Prerequisites**: Task 2.1

**Description**: Define VoiceClone model with all fields.

**Files to Create**:
```
backend/src/voice_clone/models/voice_clone.py
```

**Model Fields**:
```python
class VoiceClone(Base):
    __tablename__ = "voice_clones"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    tags: Mapped[List[str]] = mapped_column(ARRAY(String), default=list)
    is_merged: Mapped[bool] = mapped_column(Boolean, default=False)
    confidence_score: Mapped[int] = mapped_column(Integer, default=0)
    current_dna_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, onupdate=datetime.utcnow)
```

**Test Requirements**:
- Model instantiation test
- Tags array handling test

---

### Task 2.4: Create WritingSample Model

**User Stories**: US-02-006, US-02-007, US-02-008, US-02-009
**Parallel**: SEQUENTIAL
**Prerequisites**: Task 2.3

**Description**: Define WritingSample model with source types.

**Files to Create**:
```
backend/src/voice_clone/models/writing_sample.py
```

**Model Fields**:
```python
class SourceType(str, Enum):
    PASTE = "paste"
    FILE = "file"
    URL = "url"

class WritingSample(Base):
    __tablename__ = "writing_samples"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    voice_clone_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("voice_clones.id", ondelete="CASCADE"))
    source_type: Mapped[SourceType] = mapped_column(Enum(SourceType), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    source_url: Mapped[Optional[str]] = mapped_column(String(2000), nullable=True)
    original_filename: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    word_count: Mapped[int] = mapped_column(Integer, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
```

**Test Requirements**:
- Model instantiation test
- Cascade delete test

---

### Task 2.5: Create VoiceDnaVersion Model

**User Stories**: US-02-011, US-02-012
**Parallel**: SEQUENTIAL
**Prerequisites**: Task 2.3

**Description**: Define model for storing Voice DNA versions.

**Files to Create**:
```
backend/src/voice_clone/models/voice_dna.py
```

**Model Fields**:
```python
class VoiceDnaVersion(Base):
    __tablename__ = "voice_dna_versions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    voice_clone_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("voice_clones.id", ondelete="CASCADE"))
    version: Mapped[int] = mapped_column(Integer, nullable=False)
    dna_data: Mapped[dict] = mapped_column(JSONB, nullable=False)
    analysis_metadata: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
```

**Test Requirements**:
- JSONB storage test
- Version numbering test

---

### Task 2.6: Create Settings Model

**User Stories**: US-01-001, US-01-002, US-01-004, US-01-005
**Parallel**: SEQUENTIAL
**Prerequisites**: Task 2.1

**Description**: Define Settings model for methodology settings.

**Files to Create**:
```
backend/src/voice_clone/models/settings.py
```

**Model Fields**:
```python
class Settings(Base):
    __tablename__ = "settings"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    voice_cloning_instructions: Mapped[str] = mapped_column(Text, nullable=False)
    anti_ai_guidelines: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, onupdate=datetime.utcnow)
```

**Test Requirements**:
- Default values test
- Update timestamp test

---

### Task 2.7: Create SettingsHistory Model

**User Stories**: US-01-003
**Parallel**: SEQUENTIAL
**Prerequisites**: Task 2.6

**Description**: Define model for settings version history.

**Files to Modify**:
```
backend/src/voice_clone/models/settings.py
```

**Model Fields**:
```python
class SettingsHistory(Base):
    __tablename__ = "settings_history"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    settings_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("settings.id", ondelete="CASCADE"))
    setting_type: Mapped[str] = mapped_column(String(50), nullable=False)  # 'voice_cloning_instructions' or 'anti_ai_guidelines'
    content: Mapped[str] = mapped_column(Text, nullable=False)
    version: Mapped[int] = mapped_column(Integer, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
```

**Test Requirements**:
- History creation test
- Version limit enforcement test (keep only 10)

---

### Task 2.8: Create PlatformSettings Model

**User Stories**: US-01-006
**Parallel**: SEQUENTIAL
**Prerequisites**: Task 2.6

**Description**: Define model for platform-specific best practices.

**Files to Modify**:
```
backend/src/voice_clone/models/settings.py
```

**Model Fields**:
```python
class Platform(str, Enum):
    LINKEDIN = "linkedin"
    TWITTER = "twitter"
    FACEBOOK = "facebook"
    INSTAGRAM = "instagram"
    EMAIL = "email"
    BLOG = "blog"
    SMS = "sms"
    CUSTOM = "custom"

class PlatformSettings(Base):
    __tablename__ = "platform_settings"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    platform: Mapped[str] = mapped_column(String(50), nullable=False)
    display_name: Mapped[str] = mapped_column(String(100), nullable=False)
    best_practices: Mapped[str] = mapped_column(Text, nullable=False)
    is_default: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, onupdate=datetime.utcnow)
```

**Test Requirements**:
- Default platforms seeding test
- Custom platform creation test

---

### Task 2.9: Create Content Model

**User Stories**: US-04-012, US-05-001
**Parallel**: SEQUENTIAL
**Prerequisites**: Task 2.3

**Description**: Define Content model for generated content.

**Files to Create**:
```
backend/src/voice_clone/models/content.py
```

**Model Fields**:
```python
class ContentStatus(str, Enum):
    DRAFT = "draft"
    READY = "ready"
    PUBLISHED = "published"
    ARCHIVED = "archived"

class Content(Base):
    __tablename__ = "content"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    voice_clone_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("voice_clones.id", ondelete="SET NULL"), nullable=True)
    platform: Mapped[str] = mapped_column(String(50), nullable=False)
    content_text: Mapped[str] = mapped_column(Text, nullable=False)
    input_text: Mapped[str] = mapped_column(Text, nullable=False)
    properties_used: Mapped[dict] = mapped_column(JSONB, nullable=False)
    detection_score: Mapped[int] = mapped_column(Integer, nullable=True)
    detection_breakdown: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    status: Mapped[ContentStatus] = mapped_column(Enum(ContentStatus), default=ContentStatus.DRAFT)
    tags: Mapped[List[str]] = mapped_column(ARRAY(String), default=list)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, onupdate=datetime.utcnow)
```

**Test Requirements**:
- Status enum test
- Properties JSONB test

---

### Task 2.10: Create VoiceCloneMergeSource Model

**User Stories**: US-03-001, US-03-002, US-03-003
**Parallel**: SEQUENTIAL
**Prerequisites**: Task 2.3

**Description**: Define model for tracking merge sources and weights.

**Files to Modify**:
```
backend/src/voice_clone/models/voice_clone.py
```

**Model Fields**:
```python
class VoiceCloneMergeSource(Base):
    __tablename__ = "voice_clone_merge_sources"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    merged_clone_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("voice_clones.id", ondelete="CASCADE"))
    source_clone_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("voice_clones.id", ondelete="CASCADE"))
    element_weights: Mapped[dict] = mapped_column(JSONB, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
```

**Test Requirements**:
- Self-referential relationship test
- Weight validation test

---

### Task 2.11: Create ApiUsageLog Model

**User Stories**: US-07-009 (foundation)
**Parallel**: SEQUENTIAL
**Prerequisites**: Task 2.1

**Description**: Define model for tracking AI API usage.

**Files to Create**:
```
backend/src/voice_clone/models/usage.py
```

**Model Fields**:
```python
class ApiUsageLog(Base):
    __tablename__ = "api_usage_logs"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    provider: Mapped[str] = mapped_column(String(50), nullable=False)
    operation: Mapped[str] = mapped_column(String(50), nullable=False)
    model: Mapped[str] = mapped_column(String(100), nullable=False)
    input_tokens: Mapped[int] = mapped_column(Integer, nullable=False)
    output_tokens: Mapped[int] = mapped_column(Integer, nullable=False)
    voice_clone_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
```

**Test Requirements**:
- Usage logging test
- Aggregation query test

---

### Task 2.12: Export All Models

**User Stories**: Foundation
**Parallel**: SEQUENTIAL
**Prerequisites**: Tasks 2.1-2.11

**Description**: Update models/__init__.py to export all models.

**Files to Modify**:
```
backend/src/voice_clone/models/__init__.py
```

**Content**:
```python
from .base import Base
from .user import User, UserApiKey
from .voice_clone import VoiceClone, VoiceCloneMergeSource
from .writing_sample import WritingSample, SourceType
from .voice_dna import VoiceDnaVersion
from .settings import Settings, SettingsHistory, PlatformSettings, Platform
from .content import Content, ContentStatus
from .usage import ApiUsageLog

__all__ = [
    "Base", "User", "UserApiKey", "VoiceClone", "VoiceCloneMergeSource",
    "WritingSample", "SourceType", "VoiceDnaVersion", "Settings",
    "SettingsHistory", "PlatformSettings", "Platform", "Content",
    "ContentStatus", "ApiUsageLog"
]
```

---

### Task 2.13: Generate Initial Migration

**User Stories**: US-07-005
**Parallel**: SEQUENTIAL
**Prerequisites**: Task 2.12

**Description**: Generate Alembic migration for all models.

**Files to Create**:
```
backend/alembic/versions/001_initial_schema.py
```

**Commands**:
```bash
cd backend
uv run alembic revision --autogenerate -m "initial_schema"
uv run alembic upgrade head
```

**Verification**:
```bash
# All tables created in PostgreSQL
psql -U voice_clone -d voice_clone -c "\dt"
```

---

### Task 2.14: Create Pydantic Schemas - User & Auth

**User Stories**: US-07-007, US-07-008
**Parallel**: SEQUENTIAL
**Prerequisites**: Task 2.12

**Description**: Create Pydantic schemas for user and auth endpoints.

**Files to Create**:
```
backend/src/voice_clone/schemas/user.py
```

**Schemas**:
- UserResponse
- UserCreate (OAuth profile)
- ApiKeyCreate
- ApiKeyResponse (masked)

---

### Task 2.15: Create Pydantic Schemas - Voice Clone

**User Stories**: US-02-001 to US-02-012
**Parallel**: SEQUENTIAL
**Prerequisites**: Task 2.12

**Description**: Create Pydantic schemas for voice clone endpoints.

**Files to Create**:
```
backend/src/voice_clone/schemas/voice_clone.py
```

**Schemas**:
- VoiceCloneCreate
- VoiceCloneUpdate
- VoiceCloneResponse
- VoiceCloneListResponse
- WritingSampleCreate
- WritingSampleResponse
- VoiceDnaResponse
- ConfidenceScoreResponse

---

### Task 2.16: Create Pydantic Schemas - Content & Settings

**User Stories**: US-01-*, US-04-*, US-05-*
**Parallel**: SEQUENTIAL
**Prerequisites**: Task 2.12

**Description**: Create Pydantic schemas for content and settings.

**Files to Create**:
```
backend/src/voice_clone/schemas/content.py
backend/src/voice_clone/schemas/settings.py
```

**Schemas**:
- ContentCreate
- ContentUpdate
- ContentResponse
- ContentListResponse
- GenerationRequest
- GenerationResponse
- SettingsResponse
- SettingsUpdate
- PlatformSettingsResponse

---

## Phase 3: Backend Services & API Routes

**Purpose**: Implement business logic services and expose API endpoints.

---

### Task 3.1: Implement API Key Encryption Utilities

**User Stories**: US-07-008
**Parallel**: SEQUENTIAL
**Prerequisites**: Task 1.1

**Description**: Create encryption utilities using Fernet.

**Files to Create**:
```
backend/src/voice_clone/utils/
├── __init__.py
└── encryption.py
```

**Code Pattern** (from tech-stack.md):
```python
from cryptography.fernet import Fernet
from voice_clone.config import settings

def get_fernet() -> Fernet:
    return Fernet(settings.encryption_key.encode())

def encrypt_api_key(api_key: str) -> str:
    fernet = get_fernet()
    return fernet.encrypt(api_key.encode()).decode()

def decrypt_api_key(encrypted_key: str) -> str:
    fernet = get_fernet()
    return fernet.decrypt(encrypted_key.encode()).decode()
```

**Test Requirements**:
- Encrypt/decrypt roundtrip test
- Invalid key handling test

---

### Task 3.2: Implement User Service

**User Stories**: US-07-007
**Parallel**: SEQUENTIAL
**Prerequisites**: Task 2.14

**Description**: Create UserService for user CRUD and OAuth profile handling.

**Files to Create**:
```
backend/src/voice_clone/services/
├── __init__.py
└── user.py
```

**Service Methods**:
- `get_by_id(user_id: UUID) -> User | None`
- `get_by_email(email: str) -> User | None`
- `get_or_create_oauth_user(oauth_data: dict) -> User`
- `update(user_id: UUID, data: UserUpdate) -> User`

**Test Requirements**:
- All CRUD operations
- OAuth user creation

---

### Task 3.3: Implement API Key Service

**User Stories**: US-07-008
**Parallel**: SEQUENTIAL
**Prerequisites**: Tasks 3.1, 3.2

**Description**: Service for managing user AI provider API keys.

**Files to Modify**:
```
backend/src/voice_clone/services/user.py
```

**Service Methods**:
- `save_api_key(user_id: UUID, provider: str, api_key: str) -> ApiKeyResponse`
- `validate_api_key(api_key: str, provider: str) -> bool`
- `get_api_keys(user_id: UUID) -> List[ApiKeyResponse]` (masked)
- `delete_api_key(user_id: UUID, key_id: UUID) -> bool`

**Test Requirements**:
- Key encryption test
- Provider validation test (mock API call)

---

### Task 3.4: Implement VoiceClone Service - CRUD

**User Stories**: US-02-001, US-02-002, US-02-003, US-02-004, US-02-005
**Parallel**: SEQUENTIAL
**Prerequisites**: Task 2.15

**Description**: Create VoiceCloneService with all CRUD operations.

**Files to Create**:
```
backend/src/voice_clone/services/voice_clone.py
```

**Service Methods**:
- `get_all(user_id: UUID, filters: dict) -> List[VoiceClone]`
- `get_by_id(clone_id: UUID) -> VoiceClone | None`
- `create(user_id: UUID, data: VoiceCloneCreate) -> VoiceClone`
- `update(clone_id: UUID, data: VoiceCloneUpdate) -> VoiceClone`
- `delete(clone_id: UUID) -> bool`

**Test Requirements**:
- Full CRUD test suite
- Pagination test
- Filtering test

---

### Task 3.5: Implement Confidence Score Calculation

**User Stories**: US-02-010
**Parallel**: SEQUENTIAL
**Prerequisites**: Task 3.4

**Description**: Implement confidence score algorithm per PRD specification.

**Files to Modify**:
```
backend/src/voice_clone/services/voice_clone.py
```

**Algorithm (from PRD)**:
```python
def calculate_confidence_score(clone: VoiceClone) -> int:
    score = 0
    samples = clone.samples

    # Word count (max 30 pts)
    total_words = sum(s.word_count for s in samples)
    if total_words >= 10000: score += 30
    elif total_words >= 5000: score += 25
    elif total_words >= 2500: score += 20
    elif total_words >= 1000: score += 15
    elif total_words >= 500: score += 10
    else: score += int(total_words / 50)

    # Sample count (max 20 pts)
    sample_count = len(samples)
    if sample_count >= 10: score += 20
    elif sample_count >= 5: score += 15
    elif sample_count >= 3: score += 10
    else: score += sample_count * 3

    # Content type variety (max 20 pts)
    # ... (implement per PRD)

    # Sample length distribution (max 15 pts)
    # ... (implement per PRD)

    # Consistency score (max 15 pts)
    # ... (implement per PRD)

    return min(score, 100)
```

**Test Requirements**:
- Tests for each score component
- Boundary tests (0, 50, 100)

---

### Task 3.6: Implement AI Provider Abstraction

**User Stories**: US-02-011, US-04-005
**Parallel**: SEQUENTIAL
**Prerequisites**: Task 1.1

**Description**: Create abstract AIProvider base class and factory.

**Files to Create**:
```
backend/src/voice_clone/ai/
├── __init__.py
└── provider.py
```

**Code Pattern** (from tech-stack.md Section 6):
```python
from abc import ABC, abstractmethod
from typing import AsyncIterator
from pydantic import BaseModel

class GenerationOptions(BaseModel):
    model: str | None = None
    max_tokens: int = 4096
    temperature: float = 0.7

class AIProvider(ABC):
    @property
    @abstractmethod
    def name(self) -> str: ...

    @abstractmethod
    async def generate_text(self, prompt: str, options: GenerationOptions | None = None) -> str: ...

    @abstractmethod
    async def generate_stream(self, prompt: str, options: GenerationOptions | None = None) -> AsyncIterator[str]: ...
```

**Test Requirements**:
- Interface contract tests

---

### Task 3.7: Implement OpenAI Provider

**User Stories**: US-02-011, US-04-005
**Parallel**: SEQUENTIAL
**Prerequisites**: Task 3.6

**Description**: Implement OpenAI provider.

**Files to Create**:
```
backend/src/voice_clone/ai/openai_provider.py
```

**Code Pattern** (from tech-stack.md):
```python
from openai import AsyncOpenAI
from .provider import AIProvider, GenerationOptions

class OpenAIProvider(AIProvider):
    def __init__(self, api_key: str, default_model: str = "gpt-4-turbo"):
        self.client = AsyncOpenAI(api_key=api_key)
        self.default_model = default_model

    @property
    def name(self) -> str:
        return "openai"

    async def generate_text(self, prompt: str, options: GenerationOptions | None = None) -> str:
        opts = options or GenerationOptions()
        response = await self.client.chat.completions.create(
            model=opts.model or self.default_model,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=opts.max_tokens,
            temperature=opts.temperature
        )
        return response.choices[0].message.content or ""
```

**Test Requirements**:
- Unit tests with mocked API

---

### Task 3.8: Implement Anthropic Provider

**User Stories**: US-02-011, US-04-005
**Parallel**: PARALLEL with Task 3.7
**Prerequisites**: Task 3.6

**Description**: Implement Anthropic provider.

**Files to Create**:
```
backend/src/voice_clone/ai/anthropic_provider.py
```

**Test Requirements**:
- Unit tests with mocked API

---

### Task 3.9: Create AI Provider Factory

**User Stories**: US-02-011, US-04-005
**Parallel**: SEQUENTIAL
**Prerequisites**: Tasks 3.7, 3.8

**Description**: Create factory function to get AI providers.

**Files to Modify**:
```
backend/src/voice_clone/ai/__init__.py
```

**Code Pattern**:
```python
def get_ai_provider(
    provider: str = "anthropic",
    api_key: str | None = None
) -> AIProvider:
    if provider == "openai":
        return OpenAIProvider(api_key or settings.openai_api_key)
    elif provider == "anthropic":
        return AnthropicProvider(api_key or settings.anthropic_api_key)
    raise ValueError(f"Unknown provider: {provider}")
```

---

### Task 3.10: Create Voice DNA Analysis Prompts

**User Stories**: US-02-011
**Parallel**: SEQUENTIAL
**Prerequisites**: Task 3.6

**Description**: Create prompt templates for voice DNA analysis.

**Files to Create**:
```
backend/src/voice_clone/ai/prompts/
├── __init__.py
└── analysis.py
```

**Prompt Template**:
```python
VOICE_DNA_ANALYSIS_PROMPT = """
You are an expert linguistic analyst. Analyze the following writing samples
to extract a comprehensive "Voice DNA" profile.

## Instructions
{instructions}

## Writing Samples
{samples}

## Output Format
Return a JSON object with these 10 elements:
1. vocabulary_patterns
2. sentence_structure
3. paragraph_structure
4. tone_markers
5. rhetorical_devices
6. punctuation_habits
7. opening_patterns
8. closing_patterns
9. humor_and_personality
10. distinctive_signatures

Be specific. Include actual examples from the text.
"""
```

**Test Requirements**:
- Prompt generation tests

---

### Task 3.11: Implement Analysis Service

**User Stories**: US-02-011
**Parallel**: SEQUENTIAL
**Prerequisites**: Tasks 3.9, 3.10

**Description**: Create AnalysisService for orchestrating voice DNA analysis.

**Files to Create**:
```
backend/src/voice_clone/services/analysis.py
```

**Service Methods**:
- `analyze_voice_dna(clone_id: UUID, provider: str | None = None) -> VoiceDnaVersion`
- `_build_analysis_prompt(samples: List[WritingSample], instructions: str) -> str`
- `_parse_dna_response(response: str) -> dict`

**Test Requirements**:
- Analysis flow tests (mocked AI)
- DNA versioning test

---

### Task 3.12: Implement PDF Parser

**User Stories**: US-02-007
**Parallel**: SEQUENTIAL
**Prerequisites**: Task 1.1

**Description**: Create PDF text extraction using PyMuPDF.

**Files to Create**:
```
backend/src/voice_clone/parsers/
├── __init__.py
└── pdf.py
```

**Code Pattern** (from tech-stack.md Section 7):
```python
import fitz
from pathlib import Path

async def extract_text_from_pdf(source: Path | bytes) -> str:
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

**Test Requirements**:
- PDF parsing tests with sample files

---

### Task 3.13: Implement DOCX Parser

**User Stories**: US-02-007
**Parallel**: PARALLEL with Task 3.14
**Prerequisites**: Task 3.12

**Description**: Create DOCX text extraction.

**Files to Create**:
```
backend/src/voice_clone/parsers/docx.py
```

**Test Requirements**:
- DOCX parsing tests

---

### Task 3.14: Implement URL Scraper

**User Stories**: US-02-008
**Parallel**: PARALLEL with Task 3.13
**Prerequisites**: Task 1.1

**Description**: Create URL content scraper.

**Files to Create**:
```
backend/src/voice_clone/parsers/url.py
```

**Code Pattern** (from tech-stack.md Section 7):
```python
import httpx
from bs4 import BeautifulSoup

async def extract_text_from_url(url: str) -> str:
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

    # Find main content
    main_content = soup.find("article") or soup.find("main") or soup.body

    if main_content:
        return main_content.get_text(separator="\n", strip=True)
    return soup.get_text(separator="\n", strip=True)
```

**Test Requirements**:
- URL scraping tests
- Error handling tests

---

### Task 3.15: Implement Writing Sample Service

**User Stories**: US-02-006, US-02-007, US-02-008, US-02-009
**Parallel**: SEQUENTIAL
**Prerequisites**: Tasks 3.12, 3.13, 3.14

**Description**: Create service for sample CRUD and upload handling.

**Files to Create**:
```
backend/src/voice_clone/services/writing_sample.py
```

**Service Methods**:
- `get_samples(clone_id: UUID) -> List[WritingSample]`
- `add_sample_from_paste(clone_id: UUID, content: str) -> WritingSample`
- `add_sample_from_file(clone_id: UUID, file: UploadFile) -> WritingSample`
- `add_sample_from_url(clone_id: UUID, url: str) -> WritingSample`
- `delete_sample(sample_id: UUID) -> bool`
- `_count_words(text: str) -> int`

**Test Requirements**:
- All sample operations
- Word count accuracy

---

### Task 3.16: Create Content Generation Prompts

**User Stories**: US-04-005
**Parallel**: SEQUENTIAL
**Prerequisites**: Task 3.10

**Description**: Create prompt templates for content generation.

**Files to Create**:
```
backend/src/voice_clone/ai/prompts/generation.py
```

**Prompt Template**:
```python
CONTENT_GENERATION_PROMPT = """
You are a content writer with a specific voice. Generate content following the exact
voice characteristics provided below.

## Voice DNA
{voice_dna}

## Anti-AI Detection Guidelines
{anti_ai_guidelines}

## Platform Best Practices ({platform})
{platform_practices}

## Content Request
Input: {input_text}
Length: {length}
Tone Override: {tone_override}
Target Audience: {audience}
CTA Style: {cta_style}

Generate authentic content that sounds exactly like this voice, optimized for {platform}.
"""
```

**Test Requirements**:
- Prompt construction tests

---

### Task 3.17: Implement Generation Service

**User Stories**: US-04-005
**Parallel**: SEQUENTIAL
**Prerequisites**: Tasks 3.9, 3.16

**Description**: Create GenerationService for content creation.

**Files to Create**:
```
backend/src/voice_clone/services/generation.py
```

**Service Methods**:
- `generate_content(request: GenerationRequest, user_id: UUID) -> GenerationResponse`
- `regenerate_content(content_id: UUID, feedback: str | None = None) -> GenerationResponse`
- `_build_generation_prompt(...) -> str`

**Test Requirements**:
- Generation flow tests
- Multi-platform generation

---

### Task 3.18: Implement Detection Heuristics

**User Stories**: US-04-006
**Parallel**: SEQUENTIAL
**Prerequisites**: Task 1.1

**Description**: Create AI detection scoring algorithm.

**Files to Create**:
```
backend/src/voice_clone/services/detection.py
```

**Scoring Algorithm (from PRD)**:
```python
def calculate_detection_score(text: str, voice_dna: dict) -> dict:
    """Calculate AI detection score (0-100, higher = more human-like)."""
    breakdown = {
        "sentence_variety": score_sentence_variety(text),      # max 20
        "vocabulary_diversity": score_vocabulary(text),         # max 15
        "specificity": score_specificity(text),                 # max 15
        "transition_naturalness": score_transitions(text),      # max 10
        "opening_closing": score_openings_closings(text, voice_dna),  # max 10
        "punctuation": score_punctuation(text, voice_dna),      # max 10
        "personality": score_personality(text, voice_dna),      # max 10
        "structure": score_structure(text),                     # max 10
    }
    total = sum(breakdown.values())
    return {"score": total, "breakdown": breakdown}
```

**Test Requirements**:
- Tests for each score component
- Edge cases (empty text, very short)

---

### Task 3.19: Integrate Detection with Generation

**User Stories**: US-04-006
**Parallel**: SEQUENTIAL
**Prerequisites**: Tasks 3.17, 3.18

**Description**: Integrate detection scoring into generation flow.

**Files to Modify**:
```
backend/src/voice_clone/services/generation.py
```

**Test Requirements**:
- Generated content includes detection score

---

### Task 3.20: Create Merge Prompts

**User Stories**: US-03-003
**Parallel**: SEQUENTIAL
**Prerequisites**: Task 3.10

**Description**: Create prompt templates for DNA merging.

**Files to Create**:
```
backend/src/voice_clone/ai/prompts/merge.py
```

**Test Requirements**:
- Merge prompt construction

---

### Task 3.21: Implement Merge Service

**User Stories**: US-03-001, US-03-002, US-03-003
**Parallel**: SEQUENTIAL
**Prerequisites**: Tasks 3.9, 3.20

**Description**: Create MergeService for combining voice clones.

**Files to Create**:
```
backend/src/voice_clone/services/merge.py
```

**Service Methods**:
- `create_merged_clone(user_id: UUID, source_configs: List[MergeSourceConfig]) -> VoiceClone`
- `_merge_dna_elements(source_dnas: List[dict], weights: List[dict]) -> dict`

**Test Requirements**:
- Merge flow tests
- Weight validation (2-5 sources, weights sum to 100%)

---

### Task 3.22: Implement Settings Service

**User Stories**: US-01-001, US-01-002, US-01-004, US-01-005
**Parallel**: SEQUENTIAL
**Prerequisites**: Task 2.16

**Description**: Create SettingsService for methodology settings.

**Files to Create**:
```
backend/src/voice_clone/services/settings.py
```

**Service Methods**:
- `get_settings(user_id: UUID) -> Settings`
- `update_voice_cloning_instructions(user_id: UUID, content: str) -> Settings`
- `update_anti_ai_guidelines(user_id: UUID, content: str) -> Settings`
- `get_settings_history(user_id: UUID, setting_type: str) -> List[SettingsHistory]`
- `revert_to_version(user_id: UUID, version_id: UUID) -> Settings`

**Test Requirements**:
- Settings CRUD
- History creation (limit 10)
- Revert functionality

---

### Task 3.23: Implement Platform Settings Service

**User Stories**: US-01-006
**Parallel**: SEQUENTIAL
**Prerequisites**: Task 3.22

**Description**: Create service for platform-specific settings.

**Files to Modify**:
```
backend/src/voice_clone/services/settings.py
```

**Service Methods**:
- `get_platform_settings(user_id: UUID) -> List[PlatformSettings]`
- `get_platform_setting(user_id: UUID, platform: str) -> PlatformSettings`
- `update_platform_setting(user_id: UUID, platform: str, best_practices: str) -> PlatformSettings`
- `create_custom_platform(user_id: UUID, name: str, best_practices: str) -> PlatformSettings`
- `delete_custom_platform(user_id: UUID, platform_id: UUID) -> bool`
- `seed_default_platforms(user_id: UUID) -> None`

**Test Requirements**:
- Default platforms seeding (7 platforms)
- Custom platform CRUD
- Cannot delete default platforms

---

### Task 3.24: Create Voice Clone API Routes

**User Stories**: US-02-001 to US-02-012
**Parallel**: SEQUENTIAL
**Prerequisites**: Tasks 3.4, 3.5, 3.11, 3.15

**Description**: Implement all voice clone endpoints.

**Files to Create**:
```
backend/src/voice_clone/api/voice_clones.py
backend/src/voice_clone/api/router.py
```

**Endpoints**:
```
GET    /api/v1/voice-clones                    # List all clones
POST   /api/v1/voice-clones                    # Create clone
GET    /api/v1/voice-clones/{id}               # Get clone details
PUT    /api/v1/voice-clones/{id}               # Update clone
DELETE /api/v1/voice-clones/{id}               # Delete clone
POST   /api/v1/voice-clones/{id}/samples       # Add sample (paste/file/url)
GET    /api/v1/voice-clones/{id}/samples       # List samples
DELETE /api/v1/voice-clones/{id}/samples/{sid} # Delete sample
POST   /api/v1/voice-clones/{id}/analyze       # Trigger DNA analysis
GET    /api/v1/voice-clones/{id}/dna           # Get current DNA
GET    /api/v1/voice-clones/{id}/confidence    # Get confidence score
```

**Test Requirements**:
- API integration tests for all endpoints

---

### Task 3.25: Create Content API Routes

**User Stories**: US-04-001 to US-04-012
**Parallel**: SEQUENTIAL
**Prerequisites**: Tasks 3.17, 3.19

**Description**: Implement content generation and management endpoints.

**Files to Create**:
```
backend/src/voice_clone/api/content.py
```

**Endpoints**:
```
POST   /api/v1/content/generate         # Generate content
POST   /api/v1/content/{id}/regenerate  # Regenerate with feedback
PUT    /api/v1/content/{id}             # Edit content
DELETE /api/v1/content/{id}             # Delete content
```

**Test Requirements**:
- Generation endpoint tests
- Edit/delete tests

---

### Task 3.26: Create Settings API Routes

**User Stories**: US-01-001 to US-01-006
**Parallel**: SEQUENTIAL
**Prerequisites**: Tasks 3.22, 3.23

**Description**: Implement settings endpoints.

**Files to Create**:
```
backend/src/voice_clone/api/settings.py
```

**Endpoints**:
```
GET    /api/v1/settings                              # Get all settings
PUT    /api/v1/settings/voice-cloning-instructions   # Update instructions
PUT    /api/v1/settings/anti-ai-guidelines           # Update guidelines
GET    /api/v1/settings/history/{type}               # Get history
POST   /api/v1/settings/revert/{version_id}          # Revert to version
GET    /api/v1/settings/platforms                    # List platforms
GET    /api/v1/settings/platforms/{platform}         # Get platform
PUT    /api/v1/settings/platforms/{platform}         # Update platform
POST   /api/v1/settings/platforms                    # Add custom platform
DELETE /api/v1/settings/platforms/{id}               # Delete custom platform
```

**Test Requirements**:
- All settings endpoint tests

---

### Task 3.27: Create Library API Routes

**User Stories**: US-05-001 to US-05-005, US-05-007
**Parallel**: SEQUENTIAL
**Prerequisites**: Task 3.25

**Description**: Implement content library endpoints.

**Files to Create**:
```
backend/src/voice_clone/api/library.py
```

**Endpoints**:
```
GET    /api/v1/library                  # List content with filters
GET    /api/v1/library/{id}             # Get content details
PUT    /api/v1/library/{id}             # Update content
PUT    /api/v1/library/{id}/archive     # Archive/unarchive
DELETE /api/v1/library/{id}             # Delete content
```

**Query Parameters for List**:
- `voice_clone_id`: Filter by voice clone
- `platform`: Filter by platform
- `status`: Filter by status
- `search`: Keyword search
- `sort`: created_at, detection_score, status
- `page`, `per_page`: Pagination

**Test Requirements**:
- Filter tests
- Search tests
- Pagination tests

---

### Task 3.28: Create Platform Output Routes

**User Stories**: US-06-001 to US-06-005
**Parallel**: SEQUENTIAL
**Prerequisites**: Task 3.25

**Description**: Implement export and formatting endpoints.

**Files to Modify**:
```
backend/src/voice_clone/api/content.py
```

**Endpoints**:
```
GET    /api/v1/content/{id}/preview/{platform}  # Get platform preview
GET    /api/v1/content/{id}/export              # Export as file
GET    /api/v1/platforms/limits                 # Get character limits
```

**Export Formats**:
- Plain text (.txt)
- PDF

**Test Requirements**:
- Export format tests
- Character limit display

---

## Phase 4: Frontend Foundation

**Purpose**: Establish frontend layout, authentication, and routing infrastructure.

---

### Task 4.1: Configure Auth.js (NextAuth)

**User Stories**: US-07-007
**Parallel**: SEQUENTIAL
**Prerequisites**: Task 1.6

**Description**: Set up Auth.js with Google and GitHub providers.

**Files to Create**:
```
frontend/src/lib/auth.ts
frontend/src/app/api/auth/[...nextauth]/route.ts
```

**Code Pattern**:
```typescript
import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import GitHub from "next-auth/providers/github"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google, GitHub],
  callbacks: {
    async signIn({ user, account }) {
      // Sync user with backend
      return true
    }
  }
})
```

**Test Requirements**:
- OAuth flow mock tests

---

### Task 4.2: Create Auth Provider Component

**User Stories**: US-07-007
**Parallel**: SEQUENTIAL
**Prerequisites**: Task 4.1

**Description**: Create SessionProvider wrapper and useSession hook.

**Files to Create**:
```
frontend/src/components/auth/auth-provider.tsx
frontend/src/hooks/use-session.ts
```

**Test Requirements**:
- Session state tests

---

### Task 4.3: Create Sign In/Out Components

**User Stories**: US-07-007
**Parallel**: SEQUENTIAL
**Prerequisites**: Task 4.2

**Description**: Create sign-in buttons and user menu.

**Files to Create**:
```
frontend/src/components/auth/sign-in-button.tsx
frontend/src/components/auth/sign-out-button.tsx
frontend/src/components/auth/user-menu.tsx
```

**Test Requirements**:
- Component render tests

---

### Task 4.4: Create Auth Pages

**User Stories**: US-07-007
**Parallel**: SEQUENTIAL
**Prerequisites**: Task 4.3

**Description**: Create sign-in and sign-out pages.

**Files to Create**:
```
frontend/src/app/auth/signin/page.tsx
frontend/src/app/auth/signout/page.tsx
```

**Test Requirements**:
- Page render tests

---

### Task 4.5: Create Main Layout

**User Stories**: US-07-001
**Parallel**: SEQUENTIAL
**Prerequisites**: Tasks 4.2, 1.8, 1.9

**Description**: Create root layout with sidebar, header, and providers.

**Files to Modify**:
```
frontend/src/app/layout.tsx
```

**Files to Create**:
```
frontend/src/components/layout/header.tsx
frontend/src/components/layout/sidebar.tsx
```

**Test Requirements**:
- Layout render tests

---

### Task 4.6: Create Navigation Component

**User Stories**: US-07-001
**Parallel**: SEQUENTIAL
**Prerequisites**: Task 4.5

**Description**: Create navigation with links.

**Files to Create**:
```
frontend/src/components/layout/nav-link.tsx
```

**Navigation Items**:
- Voice Clones (`/voice-clones`)
- Create Content (`/create`)
- Library (`/library`)
- Settings (`/settings`)

**Test Requirements**:
- Navigation tests
- Active state tests

---

### Task 4.7: Implement Toast Notifications

**User Stories**: US-07-003
**Parallel**: SEQUENTIAL
**Prerequisites**: Task 1.7

**Description**: Create toast notification system.

**Files to Create**:
```
frontend/src/components/ui/toaster.tsx
frontend/src/hooks/use-toast.ts
```

**Test Requirements**:
- Toast display tests

---

### Task 4.8: Create Frontend Type Definitions

**User Stories**: All stories
**Parallel**: SEQUENTIAL
**Prerequisites**: Task 2.16

**Description**: Create TypeScript interfaces matching backend schemas.

**Files to Create**:
```
frontend/src/types/
├── index.ts
├── voice-clone.ts
├── content.ts
├── settings.ts
└── auth.ts
```

**Test Requirements**:
- Types compile without errors

---

### Task 4.9: Create Voice Clone Hooks

**User Stories**: US-02-001 to US-02-012
**Parallel**: SEQUENTIAL
**Prerequisites**: Tasks 1.8, 4.8

**Description**: Create TanStack Query hooks for voice clones.

**Files to Create**:
```
frontend/src/hooks/use-voice-clones.ts
```

**Hooks**:
- `useVoiceClones(filters?: Filters)`
- `useVoiceClone(id: string)`
- `useCreateVoiceClone()`
- `useUpdateVoiceClone()`
- `useDeleteVoiceClone()`
- `useAddSample()`
- `useAnalyzeVoiceClone()`

**Test Requirements**:
- Query hook tests

---

### Task 4.10: Create Content Hooks

**User Stories**: US-04-001 to US-04-012
**Parallel**: SEQUENTIAL
**Prerequisites**: Tasks 1.8, 4.8

**Description**: Create TanStack Query hooks for content.

**Files to Create**:
```
frontend/src/hooks/use-content.ts
```

**Hooks**:
- `useGenerateContent()`
- `useRegenerateContent()`
- `useContentLibrary(filters?: Filters)`
- `useContent(id: string)`
- `useUpdateContent()`
- `useDeleteContent()`

**Test Requirements**:
- Mutation hook tests

---

### Task 4.11: Create Settings Hooks

**User Stories**: US-01-001 to US-01-006
**Parallel**: SEQUENTIAL
**Prerequisites**: Tasks 1.8, 4.8

**Description**: Create TanStack Query hooks for settings.

**Files to Create**:
```
frontend/src/hooks/use-settings.ts
```

**Hooks**:
- `useSettings()`
- `useUpdateSettings()`
- `usePlatformSettings()`
- `useUpdatePlatformSettings()`

**Test Requirements**:
- Settings hooks tests

---

### Task 4.12: Create Form Validation Schemas

**User Stories**: All form-related stories
**Parallel**: SEQUENTIAL
**Prerequisites**: Task 4.8

**Description**: Create Zod schemas for form validation.

**Files to Create**:
```
frontend/src/lib/validations.ts
```

**Schemas**:
- `voiceCloneSchema`
- `writingSampleSchema`
- `contentGenerationSchema`
- `settingsSchema`

**Test Requirements**:
- Validation tests

---

## Phase 5: Frontend Features

**Purpose**: Implement all user-facing features and pages.

---

### Task 5.1: Create Voice Clone List Page

**User Stories**: US-02-001
**Parallel**: SEQUENTIAL
**Prerequisites**: Tasks 3.24, 4.9

**Description**: Create page showing all voice clones.

**Files to Create**:
```
frontend/src/app/voice-clones/page.tsx
frontend/src/components/voice-clone/voice-clone-card.tsx
frontend/src/components/voice-clone/voice-clone-list.tsx
```

**Features**:
- Grid/list toggle
- Filter by tags
- Search by name
- Confidence score badge

**Test Requirements**:
- Page render tests
- Filter/search tests

---

### Task 5.2: Create Voice Clone Form

**User Stories**: US-02-002, US-02-004
**Parallel**: SEQUENTIAL
**Prerequisites**: Task 5.1

**Description**: Create form for creating/editing voice clones.

**Files to Create**:
```
frontend/src/components/voice-clone/voice-clone-form.tsx
frontend/src/app/voice-clones/new/page.tsx
frontend/src/app/voice-clones/[id]/edit/page.tsx
```

**Test Requirements**:
- Form validation tests
- Submit tests

---

### Task 5.3: Create Voice Clone Detail Page

**User Stories**: US-02-003, US-02-005
**Parallel**: SEQUENTIAL
**Prerequisites**: Task 5.1

**Description**: Create detail page with metadata, samples, DNA view.

**Files to Create**:
```
frontend/src/app/voice-clones/[id]/page.tsx
frontend/src/components/voice-clone/confidence-badge.tsx
```

**Test Requirements**:
- Page render tests
- Delete confirmation tests

---

### Task 5.4: Create Sample Uploader

**User Stories**: US-02-006, US-02-007, US-02-008
**Parallel**: SEQUENTIAL
**Prerequisites**: Task 5.3

**Description**: Create tabbed uploader for paste, file, URL samples.

**Files to Create**:
```
frontend/src/components/voice-clone/sample-uploader.tsx
frontend/src/components/voice-clone/sample-list.tsx
```

**Features**:
- Tab navigation (Paste, Upload, URL)
- File drag-and-drop
- Word count preview

**Test Requirements**:
- Upload flow tests

---

### Task 5.5: Create DNA Viewer

**User Stories**: US-02-012
**Parallel**: SEQUENTIAL
**Prerequisites**: Task 5.3

**Description**: Create accordion display for Voice DNA components.

**Files to Create**:
```
frontend/src/components/voice-clone/dna-viewer.tsx
```

**Test Requirements**:
- DNA display tests

---

### Task 5.6: Create Merge Clone Pages

**User Stories**: US-03-001, US-03-002
**Parallel**: SEQUENTIAL
**Prerequisites**: Task 5.1

**Description**: Create interface for selecting and configuring merge.

**Files to Create**:
```
frontend/src/app/voice-clones/merge/page.tsx
frontend/src/components/voice-clone/merge-clone-selection.tsx
frontend/src/components/voice-clone/element-weight-config.tsx
```

**Features**:
- Clone selector (2-5 clones)
- Weight sliders for each DNA element
- Real-time weight validation

**Test Requirements**:
- Selection tests
- Weight validation tests

---

### Task 5.7: Create Content Creator Page

**User Stories**: US-04-001, US-04-002, US-04-003, US-04-004
**Parallel**: SEQUENTIAL
**Prerequisites**: Tasks 4.10, 5.1

**Description**: Create main content generation page.

**Files to Create**:
```
frontend/src/app/create/page.tsx
frontend/src/components/content/voice-clone-selector.tsx
frontend/src/components/content/content-input.tsx
frontend/src/components/content/properties-panel.tsx
frontend/src/components/content/platform-selector.tsx
```

**Features**:
- Voice clone dropdown
- Rich text input with markdown preview
- Collapsible properties panel
- Multi-platform selection

**Test Requirements**:
- Page flow tests
- Property panel tests

---

### Task 5.8: Create Generation Results View

**User Stories**: US-04-005, US-04-006, US-04-007, US-04-008
**Parallel**: SEQUENTIAL
**Prerequisites**: Task 5.7

**Description**: Create tabbed results view with detection score.

**Files to Create**:
```
frontend/src/components/content/content-results.tsx
frontend/src/components/content/detection-score.tsx
```

**Features**:
- Platform tabs for multi-platform results
- Inline editing
- Regenerate button
- Detection score breakdown

**Test Requirements**:
- Results display tests
- Edit/regenerate tests

---

### Task 5.9: Create Copy & Save Actions

**User Stories**: US-04-011, US-04-012
**Parallel**: SEQUENTIAL
**Prerequisites**: Task 5.8

**Description**: Create copy-to-clipboard and save-to-library buttons.

**Files to Create**:
```
frontend/src/components/content/copy-button.tsx
frontend/src/components/content/save-button.tsx
```

**Test Requirements**:
- Copy functionality tests
- Save confirmation tests

---

### Task 5.10: Create Library Page

**User Stories**: US-05-001, US-05-002
**Parallel**: SEQUENTIAL
**Prerequisites**: Task 3.27

**Description**: Create searchable content library.

**Files to Create**:
```
frontend/src/app/library/page.tsx
frontend/src/components/library/content-table.tsx
frontend/src/components/library/content-filters.tsx
```

**Features**:
- Data table with sorting
- Filter sidebar
- Search input
- Pagination

**Test Requirements**:
- Filter tests
- Search tests

---

### Task 5.11: Create Content Detail View

**User Stories**: US-05-003, US-05-004, US-05-005, US-05-007
**Parallel**: SEQUENTIAL
**Prerequisites**: Task 5.10

**Description**: Create modal for content details with edit/delete.

**Files to Create**:
```
frontend/src/components/library/content-detail.tsx
frontend/src/components/library/content-preview.tsx
```

**Test Requirements**:
- Detail view tests
- Archive/delete tests

---

### Task 5.12: Create Platform Preview Components

**User Stories**: US-06-001
**Parallel**: SEQUENTIAL
**Prerequisites**: Task 5.8

**Description**: Create platform-specific preview components.

**Files to Create**:
```
frontend/src/components/content/platform-preview.tsx
```

**Features**:
- LinkedIn post preview
- Twitter/X tweet preview
- Character count display

**Test Requirements**:
- Preview render tests

---

### Task 5.13: Create Twitter Thread Editor

**User Stories**: US-06-002
**Parallel**: SEQUENTIAL
**Prerequisites**: Task 5.12

**Description**: Create thread display with numbering.

**Files to Create**:
```
frontend/src/components/content/twitter-thread-editor.tsx
```

**Test Requirements**:
- Thread editing tests

---

### Task 5.14: Create Export Options

**User Stories**: US-06-003, US-06-004, US-06-005
**Parallel**: SEQUENTIAL
**Prerequisites**: Task 5.12

**Description**: Create export dropdown.

**Files to Create**:
```
frontend/src/components/content/export-options.tsx
```

**Features**:
- Copy to clipboard
- Export as .txt
- Export as PDF

**Test Requirements**:
- Export tests

---

### Task 5.15: Create Settings Page

**User Stories**: US-07-002
**Parallel**: SEQUENTIAL
**Prerequisites**: Task 3.26

**Description**: Create tabbed settings dashboard.

**Files to Create**:
```
frontend/src/app/settings/page.tsx
```

**Tabs**:
- Voice Cloning Instructions
- Anti-AI Guidelines
- Platform Best Practices
- AI Provider

**Test Requirements**:
- Tab navigation tests

---

### Task 5.16: Create Methodology Settings Components

**User Stories**: US-01-001, US-01-002, US-01-004, US-01-005
**Parallel**: SEQUENTIAL
**Prerequisites**: Task 5.15

**Description**: Create editor for instructions and guidelines.

**Files to Create**:
```
frontend/src/components/settings/methodology-editor.tsx
```

**Features**:
- Code editor with syntax highlighting
- View/edit toggle
- History sidebar
- Revert button

**Test Requirements**:
- Editor tests
- History tests

---

### Task 5.17: Create Platform Settings Component

**User Stories**: US-01-006
**Parallel**: SEQUENTIAL
**Prerequisites**: Task 5.15

**Description**: Create interface for managing platform best practices.

**Files to Create**:
```
frontend/src/components/settings/platform-settings.tsx
```

**Features**:
- Platform list
- Edit modal
- Add custom platform
- Delete custom platform

**Test Requirements**:
- Platform edit tests
- Custom platform tests

---

### Task 5.18: Create AI Provider Settings

**User Stories**: US-07-008
**Parallel**: SEQUENTIAL
**Prerequisites**: Task 5.15

**Description**: Create interface for API key configuration.

**Files to Create**:
```
frontend/src/app/settings/ai-provider/page.tsx
frontend/src/components/settings/ai-provider-settings.tsx
```

**Features**:
- API key input (password field)
- Validate button
- Status indicator
- Provider selection

**Test Requirements**:
- API key validation tests

---

## Phase 6: Integration & Polish

**Purpose**: End-to-end testing and production readiness.

---

### Task 6.1: Create E2E Test Suite

**User Stories**: All
**Parallel**: SEQUENTIAL
**Prerequisites**: All Phase 5 tasks

**Description**: Create Playwright E2E tests for critical flows.

**Files to Create**:
```
frontend/tests/e2e/
├── voice-clone.spec.ts
├── content-generation.spec.ts
├── library.spec.ts
└── settings.spec.ts
```

**Test Flows**:
- Create voice clone → Add samples → Analyze DNA
- Generate content → View detection score → Save to library
- Filter library → Edit content → Archive

---

### Task 6.2: Create Deployment Configuration

**User Stories**: Foundation
**Parallel**: SEQUENTIAL
**Prerequisites**: All prior tasks

**Description**: Create configuration for deployment.

**Files to Create**:
```
backend/Dockerfile
frontend/vercel.json
railway.toml
```

---

### Task 6.3: Save Implementation Plan to Project

**User Stories**: Foundation
**Parallel**: SEQUENTIAL
**Prerequisites**: None

**Description**: Save this implementation plan as `docs/implementation-plan.md` in the project repository.

---

## Dependency Chains

### Critical Path 1: Voice Clone Core
```
1.1 → 1.2 → 1.3 → 2.3 → 2.4 → 2.5 → 2.13 → 3.4 → 3.24 → 5.1 → 5.3
```

### Critical Path 2: Content Generation
```
3.6 → 3.7/3.8 → 3.9 → 3.11 → 3.16 → 3.17 → 3.25 → 5.7 → 5.8
```

### Critical Path 3: Authentication
```
1.6 → 4.1 → 4.2 → 4.3 → 4.4 → 4.5
```

---

## Task Reference by User Story

| User Story | Tasks |
|------------|-------|
| US-01-001 | 2.6, 3.22, 3.26, 5.15, 5.16 |
| US-01-002 | 2.6, 3.22, 3.26, 5.15, 5.16 |
| US-01-003 | 2.7, 3.22, 3.26, 5.16 |
| US-01-004 | 2.6, 3.22, 3.26, 5.15, 5.16 |
| US-01-005 | 2.6, 3.22, 3.26, 5.15, 5.16 |
| US-01-006 | 2.8, 3.23, 3.26, 5.15, 5.17 |
| US-02-001 | 2.3, 3.4, 3.24, 4.9, 5.1 |
| US-02-002 | 2.3, 3.4, 3.24, 4.9, 5.2 |
| US-02-003 | 2.3, 3.4, 3.24, 4.9, 5.3 |
| US-02-004 | 2.3, 3.4, 3.24, 4.9, 5.2 |
| US-02-005 | 2.3, 3.4, 3.24, 4.9, 5.3 |
| US-02-006 | 2.4, 3.15, 3.24, 5.4 |
| US-02-007 | 2.4, 3.12, 3.13, 3.15, 3.24, 5.4 |
| US-02-008 | 2.4, 3.14, 3.15, 3.24, 5.4 |
| US-02-009 | 2.4, 3.15, 3.24, 5.4 |
| US-02-010 | 3.5, 3.24 |
| US-02-011 | 2.5, 3.6-3.11, 3.24 |
| US-02-012 | 2.5, 3.24, 5.5 |
| US-03-001 | 2.10, 3.21, 5.6 |
| US-03-002 | 2.10, 3.21, 5.6 |
| US-03-003 | 2.10, 3.20, 3.21 |
| US-04-001 | 4.10, 5.7 |
| US-04-002 | 4.10, 5.7 |
| US-04-003 | 5.7 |
| US-04-004 | 5.7 |
| US-04-005 | 3.9, 3.16, 3.17, 3.25, 5.8 |
| US-04-006 | 3.18, 3.19, 5.8 |
| US-04-007 | 5.8 |
| US-04-008 | 3.17, 5.8 |
| US-04-009 | 3.17, 5.8 |
| US-04-011 | 5.9 |
| US-04-012 | 2.9, 3.25, 5.9 |
| US-05-001 | 2.9, 3.27, 4.10, 5.10 |
| US-05-002 | 3.27, 5.10 |
| US-05-003 | 3.27, 5.11 |
| US-05-004 | 3.27, 5.11 |
| US-05-005 | 3.27, 5.11 |
| US-05-007 | 3.27, 5.11 |
| US-06-001 | 3.28, 5.12 |
| US-06-002 | 5.13 |
| US-06-003 | 3.28, 5.14 |
| US-06-004 | 3.28, 5.14 |
| US-06-005 | 3.28, 5.12 |
| US-07-001 | 1.6, 4.5, 4.6 |
| US-07-002 | 5.15 |
| US-07-003 | 1.5, 1.9, 4.7 |
| US-07-004 | 1.5 |
| US-07-005 | 1.1, 1.2, 1.3, 2.13 |
| US-07-006 | 1.4 |
| US-07-007 | 2.1, 3.2, 4.1-4.4 |
| US-07-008 | 2.2, 3.1, 3.3, 5.18 |

---

## Verification Checklist

After completing all tasks, verify:

- [ ] All 45 P0 user stories have working implementations
- [ ] All backend tests pass (`uv run pytest`)
- [ ] All frontend tests pass (`npm test`)
- [ ] E2E tests pass (`npm run e2e`)
- [ ] Linting passes (backend: `ruff`, frontend: `eslint`)
- [ ] Application starts without errors
- [ ] OAuth flow works (Google and GitHub)
- [ ] Voice clone CRUD works
- [ ] Sample upload (paste, file, URL) works
- [ ] Voice DNA analysis completes
- [ ] Content generation produces results
- [ ] AI detection scoring displays
- [ ] Content library filtering works
- [ ] Settings save and load correctly

---

## Next Steps After Plan Approval

1. Save this plan as `docs/implementation-plan.md` in the project
2. Start with Task 1.1: Initialize Python Backend Project
3. Follow tasks sequentially unless marked PARALLEL
4. Commit after each completed task using conventional commits
5. Run tests after each phase before proceeding

---

*End of Implementation Plan*
