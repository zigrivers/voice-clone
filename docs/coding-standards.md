# Voice Clone - Coding Standards

**Version**: 1.0
**Created**: February 4, 2026
**Purpose**: Comprehensive coding standards for AI-assisted development ensuring consistent, maintainable, and type-safe code

---

## Table of Contents

1. [Philosophy](#1-philosophy)
2. [Python Standards](#2-python-standards)
3. [FastAPI Standards](#3-fastapi-standards)
4. [SQLAlchemy Standards](#4-sqlalchemy-standards)
5. [Pydantic Standards](#5-pydantic-standards)
6. [TypeScript Standards](#6-typescript-standards)
7. [React & Next.js Standards](#7-react--nextjs-standards)
8. [TanStack Query Standards](#8-tanstack-query-standards)
9. [Zustand Standards](#9-zustand-standards)
10. [Testing Standards](#10-testing-standards)
11. [Error Handling](#11-error-handling)
12. [Security Standards](#12-security-standards)
13. [Code Review Checklist](#13-code-review-checklist)

---

## 1. Philosophy

### AI-First Development Principles

This codebase is designed for AI-assisted development. Every standard prioritizes:

| Principle | Rationale |
|-----------|-----------|
| **Explicit over implicit** | AI can't infer hidden behaviors or magic |
| **Type safety everywhere** | Types serve as documentation and catch errors |
| **Consistent patterns** | Predictable code is easier to generate correctly |
| **Self-documenting code** | Clear names and structure reduce need for comments |
| **Single responsibility** | Smaller, focused modules are easier to understand |
| **No magic** | Avoid metaclasses, dynamic imports, complex decorators |

### The Cardinal Rules

1. **Every function has type hints** - No exceptions
2. **Every public function has a docstring** - Google style
3. **No `Any` type unless absolutely necessary** - Use `object` or generics
4. **No bare `except` clauses** - Always catch specific exceptions
5. **No mutable default arguments** - Use `None` and create inside function
6. **No circular imports** - Restructure if needed
7. **No business logic in routes/components** - Use services/hooks

---

## 2. Python Standards

### 2.1 Type Hints

Use modern Python 3.11+ type hints. Prefer built-in generics over `typing` module.

```python
# CORRECT: Modern type hints
from collections.abc import Callable, Iterable, Sequence
from typing import TypeAlias

def process_items(items: list[str]) -> dict[str, int]:
    return {item: len(item) for item in items}

def find_user(user_id: int) -> User | None:
    ...

# Type alias with explicit annotation
UserID: TypeAlias = int
JSONDict: TypeAlias = dict[str, Any]

# INCORRECT: Old-style type hints
from typing import List, Dict, Optional, Union

def process_items(items: List[str]) -> Dict[str, int]:  # Wrong
    ...

def find_user(user_id: int) -> Optional[User]:  # Wrong
    ...
```

#### Parameter vs Return Types

```python
# For parameters: use abstract types (accept broader input)
def transform(data: Iterable[str]) -> list[int]:
    return [len(s) for s in data]

# For return types: use concrete types (be specific about output)
def get_users() -> list[User]:  # Not Iterable[User]
    ...
```

#### When to Use `object` vs `Any`

```python
# Use `object` when you accept anything but want type safety
def log_value(value: object) -> None:
    print(f"Value: {value}")

# Only use `Any` when truly necessary (e.g., JSON parsing)
def parse_json(data: str) -> dict[str, Any]:
    return json.loads(data)
```

### 2.2 Async/Await Patterns

```python
import asyncio
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

# Async function with proper type hints
async def fetch_data(url: str) -> dict[str, Any]:
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        return response.json()

# Running blocking code in async context
async def process_pdf(content: bytes) -> str:
    # Use asyncio.to_thread for synchronous blocking operations
    result = await asyncio.to_thread(extract_text_sync, content)
    return result

# Parallel async operations
async def fetch_all_users(user_ids: list[str]) -> list[User]:
    tasks = [fetch_user(uid) for uid in user_ids]
    return await asyncio.gather(*tasks)

# Async context manager
@asynccontextmanager
async def managed_session() -> AsyncIterator[AsyncSession]:
    async with async_session_maker() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
```

### 2.3 Docstrings (Google Style)

Every public function, class, and module must have a docstring.

```python
def calculate_confidence_score(
    clone: VoiceClone,
    include_consistency: bool = True,
) -> int:
    """Calculate confidence score for a voice clone.

    The score (0-100) indicates how well the voice can be cloned
    based on the quantity and variety of writing samples.

    Args:
        clone: The voice clone to score.
        include_consistency: Whether to include consistency analysis.
            Defaults to True.

    Returns:
        Confidence score from 0-100.

    Raises:
        ValueError: If clone has no samples.

    Example:
        >>> clone = await get_voice_clone(clone_id)
        >>> score = calculate_confidence_score(clone)
        >>> print(f"Confidence: {score}%")
    """
    if not clone.samples:
        raise ValueError(f"Voice clone '{clone.name}' has no samples")

    # Implementation...
```

#### Class Docstrings

```python
class VoiceCloneService:
    """Service for voice clone CRUD operations.

    Handles creation, retrieval, update, and deletion of voice clones.
    All database operations are performed through the injected session.

    Attributes:
        db: Async database session for queries.

    Example:
        >>> service = VoiceCloneService(db_session)
        >>> clone = await service.create(VoiceCloneCreate(name="My Clone"))
    """

    def __init__(self, db: AsyncSession) -> None:
        """Initialize the service with a database session.

        Args:
            db: Async SQLAlchemy session.
        """
        self.db = db
```

### 2.4 Import Organization

Imports must be organized in this order, separated by blank lines:

```python
# 1. Standard library imports
from collections.abc import Callable, Sequence
from datetime import datetime, timedelta
from typing import Any, TypeAlias
from uuid import UUID

# 2. Third-party imports
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

# 3. First-party imports (absolute paths)
from voice_clone.config import settings
from voice_clone.models import VoiceClone
from voice_clone.schemas import VoiceCloneCreate, VoiceCloneResponse

# 4. Local imports (relative, same package)
from .dependencies import get_service
```

**Rules:**
- Never use `from module import *`
- Prefer absolute imports over relative (except within same package)
- Sort alphabetically within each group
- Use `ruff` to enforce automatically

### 2.5 Naming Conventions

| Item | Convention | Example |
|------|------------|---------|
| Modules | `snake_case` | `voice_clone.py` |
| Classes | `PascalCase` | `VoiceCloneService` |
| Functions | `snake_case` | `get_by_id` |
| Variables | `snake_case` | `clone_id` |
| Constants | `UPPER_SNAKE_CASE` | `MAX_SAMPLES` |
| Private | `_leading_underscore` | `_calculate_score` |
| Type aliases | `PascalCase` | `UserID: TypeAlias = int` |

### 2.6 Code Organization

```python
# File structure within a module
"""Module docstring describing purpose."""

# Imports (organized as above)

# Constants
MAX_RETRIES = 3
DEFAULT_TIMEOUT = 30.0

# Type aliases
CloneID: TypeAlias = UUID

# Exceptions (if module-specific)
class CloneNotFoundError(Exception):
    """Raised when a voice clone is not found."""
    pass

# Main classes/functions
class VoiceCloneService:
    ...

# Helper functions (private)
def _validate_samples(samples: list[WritingSample]) -> bool:
    ...
```

---

## 3. FastAPI Standards

### 3.1 Dependency Injection

Use `Annotated` for cleaner dependency injection.

```python
from typing import Annotated
from fastapi import Depends

# Define typed dependencies
SessionDep = Annotated[AsyncSession, Depends(get_session)]
ServiceDep = Annotated[VoiceCloneService, Depends(get_voice_clone_service)]
CurrentUserDep = Annotated[User, Depends(get_current_user)]

# Use in routes
@router.get("/{clone_id}")
async def get_voice_clone(
    clone_id: UUID,
    service: ServiceDep,
) -> VoiceCloneResponse:
    clone = await service.get_by_id(clone_id)
    if not clone:
        raise HTTPException(status_code=404, detail="Voice clone not found")
    return VoiceCloneResponse.model_validate(clone)
```

### 3.2 Validation Dependencies

Create dependencies that validate and return resources.

```python
async def valid_voice_clone(
    clone_id: UUID,
    service: ServiceDep,
) -> VoiceClone:
    """Dependency that validates clone exists and returns it."""
    clone = await service.get_by_id(clone_id)
    if not clone:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Voice clone with id '{clone_id}' not found",
        )
    return clone

ValidCloneDep = Annotated[VoiceClone, Depends(valid_voice_clone)]

# Now routes receive validated clone directly
@router.put("/{clone_id}")
async def update_voice_clone(
    clone: ValidCloneDep,  # Already validated and fetched
    data: VoiceCloneUpdate,
    service: ServiceDep,
) -> VoiceCloneResponse:
    updated = await service.update(clone.id, data)
    return VoiceCloneResponse.model_validate(updated)
```

### 3.3 Route Organization

```python
# api/voice_clones.py
"""Voice clone API endpoints."""

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status

from voice_clone.schemas import (
    VoiceCloneCreate,
    VoiceCloneResponse,
    VoiceCloneUpdate,
    PaginatedResponse,
)
from voice_clone.services import VoiceCloneService

from .dependencies import get_voice_clone_service, valid_voice_clone

router = APIRouter(prefix="/voice-clones", tags=["voice-clones"])

# Type aliases for this module
ServiceDep = Annotated[VoiceCloneService, Depends(get_voice_clone_service)]
ValidCloneDep = Annotated[VoiceClone, Depends(valid_voice_clone)]


@router.get("", response_model=PaginatedResponse[VoiceCloneResponse])
async def list_voice_clones(
    service: ServiceDep,
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
) -> PaginatedResponse[VoiceCloneResponse]:
    """List all voice clones with pagination."""
    clones, total = await service.list_paginated(page, page_size)
    return PaginatedResponse.create(
        items=[VoiceCloneResponse.model_validate(c) for c in clones],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.post("", response_model=VoiceCloneResponse, status_code=status.HTTP_201_CREATED)
async def create_voice_clone(
    data: VoiceCloneCreate,
    service: ServiceDep,
) -> VoiceCloneResponse:
    """Create a new voice clone."""
    clone = await service.create(data)
    return VoiceCloneResponse.model_validate(clone)


@router.get("/{clone_id}", response_model=VoiceCloneResponse)
async def get_voice_clone(clone: ValidCloneDep) -> VoiceCloneResponse:
    """Get a voice clone by ID."""
    return VoiceCloneResponse.model_validate(clone)


@router.put("/{clone_id}", response_model=VoiceCloneResponse)
async def update_voice_clone(
    clone: ValidCloneDep,
    data: VoiceCloneUpdate,
    service: ServiceDep,
) -> VoiceCloneResponse:
    """Update an existing voice clone."""
    updated = await service.update(clone.id, data)
    return VoiceCloneResponse.model_validate(updated)


@router.delete("/{clone_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_voice_clone(
    clone: ValidCloneDep,
    service: ServiceDep,
) -> None:
    """Delete a voice clone."""
    await service.delete(clone.id)
```

### 3.4 Background Tasks

```python
from fastapi import BackgroundTasks

async def send_analysis_complete_notification(
    clone_id: UUID,
    user_email: str,
) -> None:
    """Background task to send notification after analysis."""
    # Implementation...

@router.post("/{clone_id}/analyze")
async def analyze_voice_clone(
    clone: ValidCloneDep,
    background_tasks: BackgroundTasks,
    service: ServiceDep,
) -> AnalysisResponse:
    """Trigger voice DNA analysis."""
    result = await service.analyze(clone.id)

    # Queue notification (runs after response sent)
    background_tasks.add_task(
        send_analysis_complete_notification,
        clone_id=clone.id,
        user_email=clone.owner_email,
    )

    return AnalysisResponse.model_validate(result)
```

---

## 4. SQLAlchemy Standards

### 4.1 Model Definition

```python
# models/voice_clone.py
"""Voice clone database model."""

from datetime import datetime
from typing import TYPE_CHECKING
from uuid import UUID, uuid4

from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import ARRAY, JSONB, UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base

if TYPE_CHECKING:
    from .writing_sample import WritingSample


class VoiceClone(Base):
    """A voice clone capturing a writer's unique style.

    Attributes:
        id: Unique identifier.
        name: Display name (unique).
        description: Optional description.
        tags: List of tags for organization.
        confidence_score: Quality score (0-100).
        samples: Related writing samples.
    """

    __tablename__ = "voice_clones"

    # Primary key - always UUID
    id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        primary_key=True,
        default=uuid4,
    )

    # Required fields - use Mapped[type] without Optional
    name: Mapped[str] = mapped_column(String(255), unique=True, index=True)

    # Optional fields - use Mapped[type | None]
    description: Mapped[str | None] = mapped_column(Text, default=None)

    # Array fields
    tags: Mapped[list[str]] = mapped_column(
        ARRAY(String(50)),
        default=list,
        server_default="{}",
    )

    # JSON fields
    voice_dna: Mapped[dict | None] = mapped_column(JSONB, default=None)

    # Numeric with default
    confidence_score: Mapped[int] = mapped_column(default=0)

    # Timestamps - always include these
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=datetime.utcnow,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )

    # Relationships - use lazy="raise" to prevent implicit loading
    samples: Mapped[list["WritingSample"]] = relationship(
        back_populates="voice_clone",
        cascade="all, delete-orphan",
        lazy="raise",  # Forces explicit eager loading
    )

    def __repr__(self) -> str:
        return f"<VoiceClone(id={self.id}, name='{self.name}')>"
```

### 4.2 Query Patterns

```python
# services/voice_clone.py
"""Voice clone service with database operations."""

from uuid import UUID

from sqlalchemy import and_, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from voice_clone.models import VoiceClone, WritingSample
from voice_clone.schemas import VoiceCloneCreate, VoiceCloneUpdate


class VoiceCloneService:
    """Service for voice clone operations."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_by_id(self, clone_id: UUID) -> VoiceClone | None:
        """Get a voice clone by ID."""
        result = await self.db.execute(
            select(VoiceClone).where(VoiceClone.id == clone_id)
        )
        return result.scalar_one_or_none()

    async def get_with_samples(self, clone_id: UUID) -> VoiceClone | None:
        """Get a voice clone with samples eagerly loaded."""
        result = await self.db.execute(
            select(VoiceClone)
            .where(VoiceClone.id == clone_id)
            .options(selectinload(VoiceClone.samples))
        )
        return result.scalar_one_or_none()

    async def list_with_filters(
        self,
        *,
        search: str | None = None,
        tags: list[str] | None = None,
        min_confidence: int | None = None,
        offset: int = 0,
        limit: int = 20,
    ) -> tuple[list[VoiceClone], int]:
        """List voice clones with filters and pagination."""
        # Build query
        query = select(VoiceClone)
        count_query = select(func.count()).select_from(VoiceClone)

        # Build conditions list
        conditions: list = []

        if search:
            conditions.append(
                or_(
                    VoiceClone.name.ilike(f"%{search}%"),
                    VoiceClone.description.ilike(f"%{search}%"),
                )
            )

        if tags:
            # PostgreSQL array overlap
            conditions.append(VoiceClone.tags.overlap(tags))

        if min_confidence is not None:
            conditions.append(VoiceClone.confidence_score >= min_confidence)

        # Apply conditions
        if conditions:
            where_clause = and_(*conditions)
            query = query.where(where_clause)
            count_query = count_query.where(where_clause)

        # Get total count
        total_result = await self.db.execute(count_query)
        total = total_result.scalar_one()

        # Apply pagination and ordering
        query = (
            query
            .order_by(VoiceClone.created_at.desc())
            .offset(offset)
            .limit(limit)
        )

        result = await self.db.execute(query)
        clones = list(result.scalars().all())

        return clones, total

    async def create(self, data: VoiceCloneCreate) -> VoiceClone:
        """Create a new voice clone."""
        clone = VoiceClone(
            name=data.name,
            description=data.description,
            tags=data.tags,
        )
        self.db.add(clone)
        await self.db.flush()
        await self.db.refresh(clone)
        return clone

    async def update(
        self,
        clone_id: UUID,
        data: VoiceCloneUpdate,
    ) -> VoiceClone:
        """Update an existing voice clone."""
        clone = await self.get_by_id(clone_id)
        if not clone:
            raise ValueError(f"Voice clone {clone_id} not found")

        # Update only provided fields
        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(clone, field, value)

        await self.db.flush()
        await self.db.refresh(clone)
        return clone

    async def delete(self, clone_id: UUID) -> None:
        """Delete a voice clone."""
        clone = await self.get_by_id(clone_id)
        if clone:
            await self.db.delete(clone)
            await self.db.flush()
```

### 4.3 Session Management

```python
# database.py
"""Database configuration and session management."""

from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from voice_clone.config import settings

# Create engine (single instance per process)
engine = create_async_engine(
    settings.database_url,
    echo=settings.debug,  # Log SQL in debug mode
    pool_pre_ping=True,  # Verify connections
)

# Session factory
async_session_maker = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,  # Prevent lazy loading issues
    autoflush=False,  # Manual flush for control
)


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency for database sessions."""
    async with async_session_maker() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
```

---

## 5. Pydantic Standards

### 5.1 Base Model Configuration

```python
# schemas/base.py
"""Base Pydantic models with common configuration."""

from pydantic import BaseModel, ConfigDict


class AppBaseModel(BaseModel):
    """Base model with standard configuration."""

    model_config = ConfigDict(
        # Enable ORM mode for SQLAlchemy
        from_attributes=True,
        # Allow field aliases
        populate_by_name=True,
        # Strip whitespace from strings
        str_strip_whitespace=True,
        # Validate default values
        validate_default=True,
        # Use enum values not enum objects
        use_enum_values=True,
        # Forbid extra fields (strict validation)
        extra="forbid",
    )
```

### 5.2 Schema Patterns

```python
# schemas/voice_clone.py
"""Voice clone Pydantic schemas."""

from datetime import datetime
from uuid import UUID

from pydantic import Field, field_validator

from .base import AppBaseModel


# Input schema (for creation)
class VoiceCloneCreate(AppBaseModel):
    """Schema for creating a voice clone."""

    name: str = Field(
        min_length=1,
        max_length=255,
        description="Display name for the voice clone",
    )
    description: str | None = Field(
        default=None,
        max_length=2000,
        description="Optional description",
    )
    tags: list[str] = Field(
        default_factory=list,
        max_length=20,
        description="Tags for organization",
    )

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        """Validate name contains only allowed characters."""
        import re
        if not re.match(r"^[\w\s\-]+$", v):
            raise ValueError("Name can only contain letters, numbers, spaces, hyphens, and underscores")
        return v.strip()

    @field_validator("tags")
    @classmethod
    def validate_tags(cls, v: list[str]) -> list[str]:
        """Normalize and deduplicate tags."""
        seen: set[str] = set()
        result: list[str] = []
        for tag in v:
            normalized = tag.strip().lower()[:50]
            if normalized and normalized not in seen:
                seen.add(normalized)
                result.append(normalized)
        return result


# Update schema (all fields optional)
class VoiceCloneUpdate(AppBaseModel):
    """Schema for updating a voice clone."""

    name: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = None
    tags: list[str] | None = Field(default=None, max_length=20)

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str | None) -> str | None:
        if v is None:
            return None
        import re
        if not re.match(r"^[\w\s\-]+$", v):
            raise ValueError("Name can only contain letters, numbers, spaces, hyphens, and underscores")
        return v.strip()


# Response schema
class VoiceCloneResponse(AppBaseModel):
    """Schema for voice clone responses."""

    id: UUID
    name: str
    description: str | None
    tags: list[str]
    confidence_score: int
    created_at: datetime
    updated_at: datetime


# Response with relationships
class VoiceCloneWithSamplesResponse(VoiceCloneResponse):
    """Voice clone response including samples."""

    samples: list["WritingSampleResponse"]
    sample_count: int = Field(description="Total number of samples")


# Paginated response (generic)
from typing import Generic, TypeVar

DataT = TypeVar("DataT")


class PaginatedResponse(AppBaseModel, Generic[DataT]):
    """Generic paginated response."""

    items: list[DataT]
    total: int
    page: int
    page_size: int
    pages: int

    @classmethod
    def create(
        cls,
        items: list[DataT],
        total: int,
        page: int,
        page_size: int,
    ) -> "PaginatedResponse[DataT]":
        """Create paginated response with calculated pages."""
        pages = (total + page_size - 1) // page_size if page_size > 0 else 0
        return cls(
            items=items,
            total=total,
            page=page,
            page_size=page_size,
            pages=pages,
        )
```

### 5.3 Validation Patterns

```python
from typing import Self

from pydantic import EmailStr, Field, field_validator, model_validator

from .base import AppBaseModel


class ContentGenerateRequest(AppBaseModel):
    """Request schema for content generation."""

    voice_clone_id: UUID
    input_text: str = Field(min_length=10, max_length=10000)
    platforms: list[Platform] = Field(min_length=1, max_length=7)

    # Optional overrides
    tone_override: int | None = Field(default=None, ge=1, le=10)
    humor_level: int | None = Field(default=None, ge=1, le=10)
    formality: int | None = Field(default=None, ge=1, le=10)

    # Phrases to include/exclude
    include_phrases: list[str] = Field(default_factory=list, max_length=10)
    exclude_phrases: list[str] = Field(default_factory=list, max_length=10)

    @field_validator("include_phrases", "exclude_phrases")
    @classmethod
    def validate_phrases(cls, v: list[str]) -> list[str]:
        """Validate phrase lists."""
        return [phrase.strip()[:100] for phrase in v if phrase.strip()]

    @model_validator(mode="after")
    def validate_no_overlap(self) -> Self:
        """Ensure include and exclude phrases don't overlap."""
        include_set = set(p.lower() for p in self.include_phrases)
        exclude_set = set(p.lower() for p in self.exclude_phrases)
        overlap = include_set & exclude_set
        if overlap:
            raise ValueError(f"Phrases cannot be in both include and exclude: {overlap}")
        return self
```

---

## 6. TypeScript Standards

### 6.1 Strict Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "exactOptionalPropertyTypes": true
  }
}
```

### 6.2 Type vs Interface

**Use `interface` for:**
- Object shapes and contracts
- Public APIs that might be extended

**Use `type` for:**
- Union types
- Mapped/conditional types
- Utility type compositions

```typescript
// Interface: object shapes
interface User {
  id: string;
  email: string;
  name: string;
}

interface AdminUser extends User {
  permissions: string[];
}

// Type: unions and utilities
type UserRole = 'admin' | 'editor' | 'viewer';
type CreateUserInput = Omit<User, 'id'>;
type PartialUser = Partial<User>;
```

### 6.3 Discriminated Unions

Use discriminated unions for type-safe state management.

```typescript
// API response states
type ApiResponse<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: string };

// Type-safe handling with exhaustive check
function handleResponse<T>(response: ApiResponse<T>): T | null {
  switch (response.status) {
    case 'idle':
    case 'loading':
      return null;
    case 'success':
      return response.data;
    case 'error':
      console.error(response.error);
      return null;
    default:
      // Exhaustive check - TypeScript errors if case missing
      const _exhaustive: never = response;
      return _exhaustive;
  }
}
```

### 6.4 Type Guards

```typescript
// Type predicate
function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'email' in value &&
    typeof (value as User).id === 'string'
  );
}

// Discriminated union guard
function isSuccessResponse<T>(
  response: ApiResponse<T>
): response is Extract<ApiResponse<T>, { status: 'success' }> {
  return response.status === 'success';
}
```

### 6.5 Generic Patterns

```typescript
// Constrained generic
interface Repository<T extends { id: string }> {
  findById(id: string): Promise<T | null>;
  findAll(): Promise<T[]>;
  create(data: Omit<T, 'id'>): Promise<T>;
}

// Generic component props
interface ListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T) => string;
}

function List<T>({ items, renderItem, keyExtractor }: ListProps<T>) {
  return (
    <ul>
      {items.map((item, index) => (
        <li key={keyExtractor(item)}>{renderItem(item, index)}</li>
      ))}
    </ul>
  );
}
```

### 6.6 Utility Types

```typescript
// Built-in utilities
type UserPreview = Pick<User, 'id' | 'name'>;
type UserUpdate = Partial<Omit<User, 'id'>>;
type RequiredUser = Required<User>;
type ReadonlyUser = Readonly<User>;

// Custom utilities
type Nullable<T> = T | null;

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

type RequireFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
```

---

## 7. React & Next.js Standards

### 7.1 Server vs Client Components

```typescript
// Server Component (default) - no directive needed
// app/voice-clones/[id]/page.tsx
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function VoiceClonePage({ params }: Props) {
  const { id } = await params;
  const clone = await getVoiceClone(id);

  if (!clone) {
    notFound();
  }

  return (
    <div>
      <h1>{clone.name}</h1>
      {/* Client component for interactivity */}
      <VoiceCloneActions cloneId={clone.id} />
    </div>
  );
}
```

```typescript
// Client Component - requires 'use client' directive
// components/voice-clone/voice-clone-actions.tsx
'use client';

import { useState } from 'react';

interface Props {
  cloneId: string;
}

export function VoiceCloneActions({ cloneId }: Props) {
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    setIsDeleting(true);
    // ...
  }

  return (
    <button onClick={handleDelete} disabled={isDeleting}>
      {isDeleting ? 'Deleting...' : 'Delete'}
    </button>
  );
}
```

### 7.2 Data Fetching

```typescript
// Fetch with caching
async function getVoiceClone(id: string): Promise<VoiceClone | null> {
  const res = await fetch(`${process.env.API_URL}/voice-clones/${id}`, {
    next: {
      revalidate: 60, // Revalidate every 60 seconds
      tags: [`voice-clone-${id}`], // For on-demand revalidation
    },
  });

  if (!res.ok) return null;
  return res.json();
}

// Parallel fetching
async function VoiceCloneDashboard({ cloneId }: { cloneId: string }) {
  // Start all requests simultaneously
  const [clone, samples, stats] = await Promise.all([
    getVoiceClone(cloneId),
    getVoiceCloneSamples(cloneId),
    getVoiceCloneStats(cloneId),
  ]);

  return (
    <div>
      <CloneHeader clone={clone} />
      <SamplesList samples={samples} />
      <StatsPanel stats={stats} />
    </div>
  );
}
```

### 7.3 Server Actions

```typescript
// app/actions/voice-clone.ts
'use server';

import { revalidateTag } from 'next/cache';
import { z } from 'zod';

const UpdateSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(2000).optional(),
});

export async function updateVoiceClone(
  cloneId: string,
  formData: FormData
): Promise<{ success: boolean; errors?: Record<string, string[]> }> {
  const result = UpdateSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description'),
  });

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
    };
  }

  try {
    await api.put(`/voice-clones/${cloneId}`, result.data);
    revalidateTag(`voice-clone-${cloneId}`);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      errors: { _form: ['Failed to update'] },
    };
  }
}
```

### 7.4 Component Patterns

```typescript
// Compound component pattern
interface TabsContextValue {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabs() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs components must be used within Tabs');
  }
  return context;
}

interface TabsProps {
  defaultTab: string;
  children: React.ReactNode;
}

export function Tabs({ defaultTab, children }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className="tabs">{children}</div>
    </TabsContext.Provider>
  );
}

Tabs.Tab = function Tab({ value, children }: { value: string; children: React.ReactNode }) {
  const { activeTab, setActiveTab } = useTabs();
  return (
    <button
      className={activeTab === value ? 'active' : ''}
      onClick={() => setActiveTab(value)}
    >
      {children}
    </button>
  );
};

Tabs.Panel = function Panel({ value, children }: { value: string; children: React.ReactNode }) {
  const { activeTab } = useTabs();
  if (activeTab !== value) return null;
  return <div>{children}</div>;
};
```

### 7.5 Custom Hooks

```typescript
// hooks/use-local-storage.ts
import { useState, useEffect, useCallback } from 'react';

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}
```

### 7.6 Performance (React 19)

With React 19's compiler, manual memoization is often unnecessary. Use these only when needed:

```typescript
// Only use memo when child receives callbacks and parent re-renders frequently
const ExpensiveList = React.memo(function ExpensiveList({
  items,
  onItemClick,
}: {
  items: Item[];
  onItemClick: (id: string) => void;
}) {
  return (
    <ul>
      {items.map((item) => (
        <li key={item.id} onClick={() => onItemClick(item.id)}>
          {item.name}
        </li>
      ))}
    </ul>
  );
});

// useMemo only for expensive computations
function SearchResults({ items, query }: { items: Item[]; query: string }) {
  const filteredItems = useMemo(() => {
    // Only if this is expensive (large dataset)
    return items.filter((item) =>
      item.name.toLowerCase().includes(query.toLowerCase())
    );
  }, [items, query]);

  return <ItemList items={filteredItems} />;
}
```

---

## 8. TanStack Query Standards

### 8.1 Query Key Factory

```typescript
// lib/queries/voice-clones.ts
import { queryOptions } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { VoiceClone, VoiceCloneFilters } from '@/types';

export const voiceCloneQueries = {
  all: () => ['voice-clones'] as const,

  lists: () => [...voiceCloneQueries.all(), 'list'] as const,

  list: (filters: VoiceCloneFilters) =>
    queryOptions({
      queryKey: [...voiceCloneQueries.lists(), filters] as const,
      queryFn: () => api.get<VoiceClone[]>('/voice-clones', { params: filters }),
      staleTime: 5 * 60 * 1000, // 5 minutes
    }),

  details: () => [...voiceCloneQueries.all(), 'detail'] as const,

  detail: (id: string) =>
    queryOptions({
      queryKey: [...voiceCloneQueries.details(), id] as const,
      queryFn: () => api.get<VoiceClone>(`/voice-clones/${id}`),
      staleTime: 10 * 60 * 1000, // 10 minutes
    }),

  samples: (cloneId: string) =>
    queryOptions({
      queryKey: [...voiceCloneQueries.detail(cloneId).queryKey, 'samples'] as const,
      queryFn: () => api.get<WritingSample[]>(`/voice-clones/${cloneId}/samples`),
    }),
};
```

### 8.2 Usage in Components

```typescript
// components/voice-clone/voice-clone-detail.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { voiceCloneQueries } from '@/lib/queries/voice-clones';

interface Props {
  cloneId: string;
}

export function VoiceCloneDetail({ cloneId }: Props) {
  const { data: clone, isPending, error } = useQuery(
    voiceCloneQueries.detail(cloneId)
  );

  if (isPending) return <Spinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div>
      <h1>{clone.name}</h1>
      <p>{clone.description}</p>
    </div>
  );
}
```

### 8.3 Mutations with Optimistic Updates

```typescript
// lib/mutations/voice-clones.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { voiceCloneQueries } from '@/lib/queries/voice-clones';
import { api } from '@/lib/api';
import type { VoiceClone, VoiceCloneUpdate } from '@/types';

export function useUpdateVoiceClone(cloneId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: VoiceCloneUpdate) =>
      api.put<VoiceClone>(`/voice-clones/${cloneId}`, data),

    onMutate: async (newData) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: voiceCloneQueries.detail(cloneId).queryKey,
      });

      // Snapshot previous value
      const previousClone = queryClient.getQueryData<VoiceClone>(
        voiceCloneQueries.detail(cloneId).queryKey
      );

      // Optimistically update
      if (previousClone) {
        queryClient.setQueryData(
          voiceCloneQueries.detail(cloneId).queryKey,
          { ...previousClone, ...newData }
        );
      }

      return { previousClone };
    },

    onError: (err, newData, context) => {
      // Rollback on error
      if (context?.previousClone) {
        queryClient.setQueryData(
          voiceCloneQueries.detail(cloneId).queryKey,
          context.previousClone
        );
      }
    },

    onSettled: () => {
      // Always refetch after mutation
      queryClient.invalidateQueries({
        queryKey: voiceCloneQueries.detail(cloneId).queryKey,
      });
    },
  });
}
```

---

## 9. Zustand Standards

### 9.1 Store Organization

```typescript
// stores/ui-store.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface UIState {
  // State
  sidebarOpen: boolean;
  activeModal: string | null;
  theme: 'light' | 'dark';
}

interface UIActions {
  // Actions
  toggleSidebar: () => void;
  openModal: (modalId: string) => void;
  closeModal: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

type UIStore = UIState & UIActions;

const initialState: UIState = {
  sidebarOpen: true,
  activeModal: null,
  theme: 'light',
};

export const useUIStore = create<UIStore>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,

        toggleSidebar: () =>
          set((state) => ({ sidebarOpen: !state.sidebarOpen })),

        openModal: (modalId) =>
          set({ activeModal: modalId }),

        closeModal: () =>
          set({ activeModal: null }),

        setTheme: (theme) =>
          set({ theme }),
      }),
      {
        name: 'ui-storage',
        partialize: (state) => ({ theme: state.theme }),
      }
    ),
    { name: 'UIStore' }
  )
);
```

### 9.2 Selectors

```typescript
// stores/ui-store.ts (continued)
import { useShallow } from 'zustand/react/shallow';

// Single value selector
export const useSidebarOpen = () => useUIStore((state) => state.sidebarOpen);
export const useTheme = () => useUIStore((state) => state.theme);

// Multiple values with useShallow
export const useModalState = () =>
  useUIStore(
    useShallow((state) => ({
      activeModal: state.activeModal,
      openModal: state.openModal,
      closeModal: state.closeModal,
    }))
  );

// Actions only (stable reference)
export const useUIActions = () =>
  useUIStore(
    useShallow((state) => ({
      toggleSidebar: state.toggleSidebar,
      setTheme: state.setTheme,
    }))
  );
```

---

## 10. Testing Standards

For comprehensive testing standards including TDD workflow, test patterns, coverage requirements, and AI-specific testing instructions, see **[TDD Standards](./tdd-standards.md)**.

The TDD Standards document covers:
- Test-Driven Generation (TDG) workflow for AI-assisted development
- Test pyramid and coverage requirements (60% unit, 30% integration, 10% E2E)
- Python/FastAPI testing with pytest (fixtures, factories, async testing)
- React/Next.js testing with Vitest (MSW, React Testing Library)
- Test organization and naming conventions
- AI-specific testing instructions and prompts
- Anti-patterns and common mistakes

---

## 11. Error Handling

### 11.1 Python Exceptions

```python
# exceptions.py
"""Application exception hierarchy."""

from fastapi import status


class AppError(Exception):
    """Base application error."""

    def __init__(
        self,
        message: str,
        code: str,
        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
    ) -> None:
        self.message = message
        self.code = code
        self.status_code = status_code
        super().__init__(message)


class NotFoundError(AppError):
    """Resource not found."""

    def __init__(self, resource: str, identifier: str | int) -> None:
        super().__init__(
            message=f"{resource} '{identifier}' not found",
            code="NOT_FOUND",
            status_code=status.HTTP_404_NOT_FOUND,
        )


class ConflictError(AppError):
    """Resource conflict (e.g., duplicate)."""

    def __init__(self, message: str) -> None:
        super().__init__(
            message=message,
            code="CONFLICT",
            status_code=status.HTTP_409_CONFLICT,
        )


class ValidationError(AppError):
    """Validation failed."""

    def __init__(self, field: str, message: str) -> None:
        super().__init__(
            message=f"Validation failed for '{field}': {message}",
            code="VALIDATION_ERROR",
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        )


# Global exception handler
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

app = FastAPI()


@app.exception_handler(AppError)
async def app_error_handler(request: Request, exc: AppError) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.message,
            "code": exc.code,
        },
    )
```

### 11.2 TypeScript Errors

```typescript
// lib/errors.ts
export class ApiError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number
  ) {
    super(message);
    this.name = 'ApiError';
  }

  static fromResponse(response: Response, data: unknown): ApiError {
    const message = typeof data === 'object' && data !== null && 'error' in data
      ? String((data as { error: string }).error)
      : 'An error occurred';
    const code = typeof data === 'object' && data !== null && 'code' in data
      ? String((data as { code: string }).code)
      : 'UNKNOWN_ERROR';
    return new ApiError(message, code, response.status);
  }
}

// API client with error handling
export async function apiRequest<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw ApiError.fromResponse(response, data);
  }

  return data as T;
}
```

---

## 12. Security Standards

### 12.1 Input Validation

- **All inputs validated via Pydantic** - Never trust raw input
- **Explicit field constraints** - min/max length, patterns, allowed values
- **Sanitize before storage** - Strip whitespace, normalize unicode

### 12.2 Authentication

```python
# Never store plain passwords
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)
```

### 12.3 Environment Variables

```python
# Never hardcode secrets
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str
    openai_api_key: str | None = None
    secret_key: str

    model_config = {"env_file": ".env"}
```

### 12.4 SQL Injection Prevention

```python
# CORRECT: Use parameterized queries (SQLAlchemy handles this)
result = await db.execute(
    select(User).where(User.email == email)
)

# NEVER: String interpolation
# result = await db.execute(f"SELECT * FROM users WHERE email = '{email}'")
```

---

## 13. Code Review Checklist

### Python

- [ ] All functions have type hints
- [ ] All public functions have docstrings
- [ ] No `Any` type without justification
- [ ] No bare `except` clauses
- [ ] Imports organized correctly
- [ ] No business logic in routes
- [ ] Async operations use `await`
- [ ] Database queries use parameterized values
- [ ] Passwords hashed, never stored plain

### TypeScript

- [ ] Strict mode enabled
- [ ] No `any` type without justification
- [ ] Discriminated unions have exhaustive checks
- [ ] Server/Client components properly separated
- [ ] No data fetching in Client Components
- [ ] TanStack Query for server state
- [ ] Zustand only for UI state
- [ ] Props interfaces defined

### General

- [ ] No secrets in code
- [ ] Error handling provides useful messages
- [ ] Tests cover happy path and edge cases
- [ ] Code is self-documenting (clear names)
- [ ] No premature optimization
- [ ] Single responsibility per function/component

---

## Quick Reference

### Python Type Hints Cheatsheet

```python
# Modern Python 3.11+
x: str                          # Required string
x: str | None                   # Optional string
x: list[str]                    # List of strings
x: dict[str, int]               # Dict with string keys, int values
x: tuple[str, int]              # Tuple with specific types
x: Callable[[int], str]         # Function taking int, returning str
x: Iterable[T]                  # Any iterable (parameter)
x: Sequence[T]                  # Ordered collection (parameter)
```

### TypeScript Cheatsheet

```typescript
// Types
x: string                       // Required string
x: string | null                // Nullable string
x?: string                      // Optional (may be undefined)
x: string[]                     // Array of strings
x: Record<string, number>       // Object with string keys, number values
x: (n: number) => string        // Function type
x: readonly string[]            // Immutable array
```

---

*End of Document*
