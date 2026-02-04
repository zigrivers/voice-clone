# Voice Clone - TDD Standards for AI-Assisted Development

**Version**: 1.0
**Created**: February 4, 2026
**Purpose**: Comprehensive Test-Driven Development standards ensuring rock-solid, bug-free applications when AI writes the code

---

## Table of Contents

1. [TDD Philosophy for AI-First Development](#1-tdd-philosophy-for-ai-first-development)
2. [The Test-Driven Generation (TDG) Workflow](#2-the-test-driven-generation-tdg-workflow)
3. [Test Pyramid & Coverage Requirements](#3-test-pyramid--coverage-requirements)
4. [Python/FastAPI TDD Standards](#4-pythonfastapi-tdd-standards)
5. [React/Next.js TDD Standards](#5-reactnextjs-tdd-standards)
6. [Test Organization & Naming Conventions](#6-test-organization--naming-conventions)
7. [AI-Specific Testing Instructions](#7-ai-specific-testing-instructions)
8. [Anti-Patterns & Common Mistakes](#8-anti-patterns--common-mistakes)
9. [Quick Reference](#9-quick-reference)

---

## 1. TDD Philosophy for AI-First Development

### Why TDD is Critical When AI Writes Code

When AI generates code, TDD becomes even more essential than in traditional development:

| Challenge | How TDD Solves It |
|-----------|-------------------|
| AI may misunderstand requirements | Tests serve as **executable specifications** that validate understanding |
| AI can introduce subtle bugs | Tests catch regressions immediately |
| AI lacks project context | Tests document expected behavior explicitly |
| AI may over-engineer solutions | Tests constrain implementation to only what's needed |
| AI output quality varies | Tests provide a consistent quality gate |

### Tests as Executable Specifications

In AI-first development, tests are not afterthoughts—they are the **primary specification**. Write tests that:

1. **Define the contract**: What inputs are accepted? What outputs are expected?
2. **Document edge cases**: What happens with empty input? Null values? Boundaries?
3. **Enforce behavior**: Tests lock in expected behavior, preventing drift

### Connection to Existing Philosophy

This aligns with the "explicit over implicit" principle in our [coding standards](./coding-standards.md):

```
Tests are explicit specifications.
Code is the implicit implementation.
AI reads the explicit, generates the implicit.
```

### Key Principles for AI-Driven TDD

| Principle | Description |
|-----------|-------------|
| **Test First, Always** | Write the test before asking AI to implement. No exceptions. |
| **One Test at a Time** | Give AI one failing test, get one passing implementation. |
| **Tests Are Requirements** | If it's not tested, it doesn't exist. |
| **Red → Green → Refactor** | Follow the cycle strictly. Never skip steps. |
| **Small Steps** | Smaller tests = better AI understanding = better code. |
| **Explicit Assertions** | Be specific about what you're testing. |

---

## 2. The Test-Driven Generation (TDG) Workflow

### The Expanded Red-Green-Refactor Cycle

Traditional TDD's Red-Green-Refactor cycle adapts for AI development:

```
┌─────────────────────────────────────────────────────────────┐
│                    TDG Workflow Cycle                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│    ┌─────────┐      ┌─────────┐      ┌──────────┐           │
│    │  RED    │ ───► │  GREEN  │ ───► │ REFACTOR │           │
│    │         │      │         │      │          │           │
│    │ Human   │      │   AI    │      │   AI     │           │
│    │ writes  │      │ writes  │      │ improves │           │
│    │ test    │      │ code    │      │ code     │           │
│    └─────────┘      └─────────┘      └──────────┘           │
│         │                                  │                 │
│         └──────────────────────────────────┘                 │
│                    (repeat)                                  │
└─────────────────────────────────────────────────────────────┘
```

### Step-by-Step TDG Workflow

#### Step 1: Human Writes Test (RED)

**You** write the test that defines expected behavior:

```python
# tests/test_voice_clone_service.py
async def test_calculate_confidence_returns_zero_for_no_samples():
    """Confidence score should be 0 when voice clone has no samples."""
    clone = VoiceClone(name="Empty Clone", samples=[])

    score = calculate_confidence_score(clone)

    assert score == 0
```

**Run the test—it must fail** (RED):
```bash
pytest tests/test_voice_clone_service.py::test_calculate_confidence_returns_zero_for_no_samples -v
# Expected: FAILED (function doesn't exist yet)
```

#### Step 2: AI Implements (GREEN)

**Prompt AI to implement just enough to pass**:

```
Implement the calculate_confidence_score function to make this test pass:

[paste the test]

Requirements:
- Return 0 if the clone has no samples
- Function signature: def calculate_confidence_score(clone: VoiceClone) -> int
- Location: services/voice_clone.py
```

**Run the test—it must pass** (GREEN):
```bash
pytest tests/test_voice_clone_service.py::test_calculate_confidence_returns_zero_for_no_samples -v
# Expected: PASSED
```

#### Step 3: AI Refactors (REFACTOR)

**Only after GREEN**, prompt AI to improve:

```
The test passes. Now refactor calculate_confidence_score to:
- Add a docstring following Google style
- Ensure type hints are complete
- Do NOT change the behavior (tests must still pass)
```

**Run all related tests—they must still pass**:
```bash
pytest tests/test_voice_clone_service.py -v
# Expected: All PASSED
```

### Critical TDG Rules

| Rule | Rationale |
|------|-----------|
| **Never ask AI to generate test AND implementation together** | AI will write tests that pass its own code, missing edge cases |
| **Run tests after every AI interaction** | Verify AI understood correctly |
| **Feed test output back to AI** | If tests fail, show AI the failure message |
| **One logical change per cycle** | Keeps AI focused, prevents confusion |
| **Review AI code before committing** | AI may over-engineer or miss the point |

### Context Management Guidelines

AI works best with focused context. Structure your prompts:

```
✅ GOOD: Focused context
"Implement the get_by_id method for VoiceCloneService.
Here's the failing test:
[test code]
Here's the model it uses:
[model code]
Make the test pass."

❌ BAD: Overwhelming context
"Here's my entire service file, model file, schema file, and
all 50 tests. Please implement everything."
```

**Checkpoint Frequency**:
- Run tests after every AI-generated change
- Commit after each GREEN phase (passing tests)
- Review after every 3-5 TDG cycles

---

## 3. Test Pyramid & Coverage Requirements

### Test Distribution

```
                    ┌───────────┐
                   /   E2E (10%) \
                  /    Slow,      \
                 /    Expensive    \
                ├───────────────────┤
               /  Integration (30%)  \
              /   Database, API,      \
             /    External Services    \
            ├───────────────────────────┤
           /      Unit Tests (60%)       \
          /   Fast, Isolated, Numerous    \
         └─────────────────────────────────┘
```

| Level | Percentage | Characteristics | Examples |
|-------|------------|-----------------|----------|
| **Unit** | 60% | Fast, isolated, mock dependencies | Service methods, utility functions |
| **Integration** | 30% | Real database, real HTTP, slower | API endpoints, database queries |
| **E2E** | 10% | Full stack, slowest, most brittle | Critical user flows |

### Coverage Targets by Code Area

| Code Area | Minimum Coverage | Target Coverage | Enforcement |
|-----------|------------------|-----------------|-------------|
| Services (business logic) | 85% | 90% | **Strict** - Block PR if below |
| API Routes | 75% | 80% | **Strict** - Block PR if below |
| Utilities | 90% | 95% | **Strict** - Block PR if below |
| Models | 50% | 70% | Moderate - Warn if below |
| React Components | 60% | 75% | Moderate - Warn if below |
| React Hooks | 80% | 90% | **Strict** - Block PR if below |

### What to Test

| Test | Don't Test |
|------|------------|
| Business logic in services | Framework internals (FastAPI, React) |
| Input validation | Third-party library behavior |
| Edge cases and boundaries | Simple getters/setters |
| Error handling paths | Configuration files |
| API request/response contracts | Styles and CSS |
| User interactions | Implementation details |
| State changes | Private methods (test via public API) |

### Coverage Enforcement

```toml
# pyproject.toml
[tool.pytest.ini_options]
addopts = "--cov=voice_clone --cov-report=term-missing --cov-fail-under=80"

[tool.coverage.run]
branch = true
source = ["src/voice_clone"]
omit = ["*/tests/*", "*/__init__.py"]

[tool.coverage.report]
exclude_lines = [
    "pragma: no cover",
    "if TYPE_CHECKING:",
    "raise NotImplementedError",
]
```

---

## 4. Python/FastAPI TDD Standards

### pytest Configuration

```toml
# pyproject.toml
[tool.pytest.ini_options]
testpaths = ["tests"]
python_files = ["test_*.py"]
python_functions = ["test_*"]
asyncio_mode = "auto"
filterwarnings = [
    "ignore::DeprecationWarning",
]
markers = [
    "slow: marks tests as slow (deselect with '-m \"not slow\"')",
    "integration: marks tests as integration tests",
]
```

### Fixture Scoping Strategy

```python
# tests/conftest.py
"""Shared test fixtures with appropriate scoping."""

import pytest
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import NullPool

# Session-scoped: expensive setup, shared across all tests
@pytest.fixture(scope="session")
def event_loop():
    """Create event loop for async tests."""
    import asyncio
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest.fixture(scope="session")
async def test_engine():
    """Create test database engine (once per session)."""
    engine = create_async_engine(
        "postgresql+asyncpg://test:test@localhost/test_db",
        poolclass=NullPool,  # Critical for test isolation
    )
    yield engine
    await engine.dispose()

# Module-scoped: schema setup per test module
@pytest.fixture(scope="module")
async def setup_database(test_engine):
    """Create tables once per module."""
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

# Function-scoped: fresh session per test with rollback
@pytest.fixture
async def db_session(test_engine, setup_database) -> AsyncSession:
    """Create isolated session with transaction rollback."""
    async_session = sessionmaker(
        test_engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )
    async with async_session() as session:
        async with session.begin():
            yield session
            await session.rollback()  # Rollback ensures isolation
```

### Factory Pattern for Test Data

```python
# tests/factories.py
"""Test data factories using factory_boy."""

import factory
from factory.alchemy import SQLAlchemyModelFactory
from voice_clone.models import VoiceClone, WritingSample

class VoiceCloneFactory(SQLAlchemyModelFactory):
    """Factory for creating test VoiceClone instances."""

    class Meta:
        model = VoiceClone
        sqlalchemy_session = None  # Set in conftest
        sqlalchemy_session_persistence = "flush"

    name = factory.Sequence(lambda n: f"Test Clone {n}")
    description = factory.Faker("paragraph")
    tags = factory.LazyFunction(lambda: ["test", "sample"])
    confidence_score = factory.Faker("random_int", min=0, max=100)

class WritingSampleFactory(SQLAlchemyModelFactory):
    """Factory for creating test WritingSample instances."""

    class Meta:
        model = WritingSample
        sqlalchemy_session = None
        sqlalchemy_session_persistence = "flush"

    title = factory.Faker("sentence")
    content = factory.Faker("text", max_nb_chars=1000)
    word_count = factory.LazyAttribute(lambda o: len(o.content.split()))
    voice_clone = factory.SubFactory(VoiceCloneFactory)
```

### Service Test Pattern (Arrange-Act-Assert)

```python
# tests/services/test_voice_clone_service.py
"""Tests for VoiceCloneService."""

import pytest
from uuid import uuid4
from voice_clone.services.voice_clone import VoiceCloneService
from voice_clone.schemas import VoiceCloneCreate

class TestVoiceCloneServiceCreate:
    """Tests for VoiceCloneService.create method."""

    async def test_create_voice_clone_with_valid_data(
        self,
        db_session: AsyncSession,
    ) -> None:
        """Successfully create a voice clone with valid input."""
        # Arrange
        service = VoiceCloneService(db_session)
        data = VoiceCloneCreate(
            name="My Voice",
            description="Test description",
            tags=["personal", "blog"],
        )

        # Act
        clone = await service.create(data)

        # Assert
        assert clone.id is not None
        assert clone.name == "My Voice"
        assert clone.description == "Test description"
        assert clone.tags == ["personal", "blog"]
        assert clone.confidence_score == 0  # Default

    async def test_create_voice_clone_without_optional_fields(
        self,
        db_session: AsyncSession,
    ) -> None:
        """Create voice clone with only required fields."""
        # Arrange
        service = VoiceCloneService(db_session)
        data = VoiceCloneCreate(name="Minimal Clone")

        # Act
        clone = await service.create(data)

        # Assert
        assert clone.name == "Minimal Clone"
        assert clone.description is None
        assert clone.tags == []
```

### API Integration Test Pattern

```python
# tests/api/test_voice_clones_api.py
"""Integration tests for voice clone API endpoints."""

import pytest
from httpx import AsyncClient
from fastapi import status

class TestVoiceCloneEndpoints:
    """Integration tests for /api/v1/voice-clones endpoints."""

    async def test_create_voice_clone_returns_201(
        self,
        client: AsyncClient,
    ) -> None:
        """POST /voice-clones returns 201 with valid data."""
        response = await client.post(
            "/api/v1/voice-clones",
            json={"name": "Test Clone", "description": "A test"},
        )

        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["name"] == "Test Clone"
        assert "id" in data

    async def test_get_nonexistent_clone_returns_404(
        self,
        client: AsyncClient,
    ) -> None:
        """GET /voice-clones/{id} returns 404 for missing clone."""
        fake_id = "00000000-0000-0000-0000-000000000000"

        response = await client.get(f"/api/v1/voice-clones/{fake_id}")

        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert "not found" in response.json()["detail"].lower()

    @pytest.mark.parametrize(
        "invalid_data,expected_field",
        [
            ({"name": ""}, "name"),
            ({"name": "a" * 256}, "name"),
            ({}, "name"),
        ],
    )
    async def test_create_with_invalid_data_returns_422(
        self,
        client: AsyncClient,
        invalid_data: dict,
        expected_field: str,
    ) -> None:
        """POST /voice-clones returns 422 for invalid data."""
        response = await client.post("/api/v1/voice-clones", json=invalid_data)

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
        errors = response.json()["detail"]
        assert any(expected_field in str(e) for e in errors)
```

### Parametrized Tests for Validation

```python
# tests/test_validation.py
"""Parametrized tests for input validation."""

import pytest
from voice_clone.schemas import VoiceCloneCreate
from pydantic import ValidationError

class TestVoiceCloneCreateValidation:
    """Validation tests for VoiceCloneCreate schema."""

    @pytest.mark.parametrize(
        "name,should_pass",
        [
            ("Valid Name", True),
            ("Name with Numbers 123", True),
            ("Name-with-dashes", True),
            ("Name_with_underscores", True),
            ("", False),  # Empty
            ("a" * 256, False),  # Too long
            ("Name@with#special!", False),  # Invalid chars
        ],
    )
    def test_name_validation(self, name: str, should_pass: bool) -> None:
        """Test name field validation rules."""
        if should_pass:
            clone = VoiceCloneCreate(name=name)
            assert clone.name == name.strip()
        else:
            with pytest.raises(ValidationError):
                VoiceCloneCreate(name=name)

    @pytest.mark.parametrize(
        "tags,expected",
        [
            (["tag1", "tag2"], ["tag1", "tag2"]),
            (["TAG1", "Tag2"], ["tag1", "tag2"]),  # Lowercase
            (["  spaced  ", "tag"], ["spaced", "tag"]),  # Trimmed
            (["dup", "dup"], ["dup"]),  # Deduplicated
            ([], []),  # Empty allowed
        ],
    )
    def test_tags_normalization(
        self,
        tags: list[str],
        expected: list[str],
    ) -> None:
        """Test tags are normalized correctly."""
        clone = VoiceCloneCreate(name="Test", tags=tags)
        assert clone.tags == expected
```

### Async Testing with pytest-asyncio

```python
# tests/test_async_operations.py
"""Tests for async operations."""

import pytest
import asyncio
from voice_clone.services.analysis import AnalysisService

class TestAsyncAnalysis:
    """Tests for async analysis operations."""

    @pytest.mark.asyncio
    async def test_analyze_samples_concurrently(
        self,
        db_session: AsyncSession,
        voice_clone_factory: VoiceCloneFactory,
    ) -> None:
        """Analysis should process multiple samples concurrently."""
        # Arrange
        clone = voice_clone_factory.create(samples_count=5)
        service = AnalysisService(db_session)

        # Act
        start = asyncio.get_event_loop().time()
        result = await service.analyze_all_samples(clone.id)
        duration = asyncio.get_event_loop().time() - start

        # Assert - concurrent should be faster than serial
        assert result.analyzed_count == 5
        assert duration < 5.0  # Would be 10+ if serial

    @pytest.mark.asyncio
    async def test_handles_timeout_gracefully(
        self,
        db_session: AsyncSession,
    ) -> None:
        """Service should handle timeouts without crashing."""
        service = AnalysisService(db_session, timeout=0.001)

        with pytest.raises(TimeoutError):
            await service.analyze_with_ai("very long text" * 1000)
```

---

## 5. React/Next.js TDD Standards

### Vitest Configuration

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'tests/'],
      thresholds: {
        lines: 75,
        functions: 75,
        branches: 70,
        statements: 75,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### Test Setup with MSW

```typescript
// tests/setup.ts
import '@testing-library/jest-dom';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { server } from './mocks/server';

// Start MSW server before tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

// Reset handlers after each test
afterEach(() => server.resetHandlers());

// Clean up after all tests
afterAll(() => server.close());
```

```typescript
// tests/mocks/server.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

```typescript
// tests/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/v1/voice-clones', () => {
    return HttpResponse.json([
      { id: '1', name: 'Test Clone', confidenceScore: 85 },
      { id: '2', name: 'Another Clone', confidenceScore: 60 },
    ]);
  }),

  http.get('/api/v1/voice-clones/:id', ({ params }) => {
    const { id } = params;
    if (id === 'not-found') {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json({
      id,
      name: 'Test Clone',
      description: 'A test voice clone',
      confidenceScore: 85,
    });
  }),

  http.post('/api/v1/voice-clones', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json(
      { id: 'new-id', ...body, confidenceScore: 0 },
      { status: 201 }
    );
  }),
];
```

### Test Wrapper with Providers

```typescript
// tests/utils/test-utils.tsx
import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

interface WrapperProps {
  children: React.ReactNode;
}

function AllTheProviders({ children }: WrapperProps) {
  const queryClient = createTestQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: AllTheProviders, ...options });
}

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };
```

### Component Test Pattern (Test User Behavior)

```typescript
// tests/components/voice-clone-card.test.tsx
import { render, screen } from '../utils/test-utils';
import userEvent from '@testing-library/user-event';
import { VoiceCloneCard } from '@/components/voice-clone/voice-clone-card';

const mockClone = {
  id: '1',
  name: 'Test Clone',
  description: 'A description',
  confidenceScore: 85,
};

describe('VoiceCloneCard', () => {
  it('displays clone name and confidence score', () => {
    render(<VoiceCloneCard clone={mockClone} />);

    expect(screen.getByText('Test Clone')).toBeInTheDocument();
    expect(screen.getByText('85%')).toBeInTheDocument();
  });

  it('displays description when provided', () => {
    render(<VoiceCloneCard clone={mockClone} />);

    expect(screen.getByText('A description')).toBeInTheDocument();
  });

  it('does not display description when not provided', () => {
    const cloneWithoutDescription = { ...mockClone, description: null };

    render(<VoiceCloneCard clone={cloneWithoutDescription} />);

    expect(screen.queryByText('A description')).not.toBeInTheDocument();
  });

  it('calls onSelect with clone id when clicked', async () => {
    const user = userEvent.setup();
    const handleSelect = vi.fn();

    render(<VoiceCloneCard clone={mockClone} onSelect={handleSelect} />);

    await user.click(screen.getByRole('button', { name: /select/i }));

    expect(handleSelect).toHaveBeenCalledWith('1');
    expect(handleSelect).toHaveBeenCalledTimes(1);
  });

  it('shows loading state when isLoading prop is true', () => {
    render(<VoiceCloneCard clone={mockClone} isLoading />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });
});
```

### Hook Test Pattern with TanStack Query

```typescript
// tests/hooks/use-voice-clone.test.tsx
import { renderHook, waitFor } from '../utils/test-utils';
import { useVoiceClone } from '@/hooks/use-voice-clone';
import { server } from '../mocks/server';
import { http, HttpResponse } from 'msw';

describe('useVoiceClone', () => {
  it('fetches voice clone successfully', async () => {
    const { result } = renderHook(() => useVoiceClone('1'));

    expect(result.current.isPending).toBe(true);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.name).toBe('Test Clone');
    expect(result.current.data?.confidenceScore).toBe(85);
  });

  it('handles 404 error gracefully', async () => {
    server.use(
      http.get('/api/v1/voice-clones/:id', () => {
        return new HttpResponse(null, { status: 404 });
      })
    );

    const { result } = renderHook(() => useVoiceClone('not-found'));

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toContain('404');
  });

  it('does not fetch when id is empty', () => {
    const { result } = renderHook(() => useVoiceClone(''));

    expect(result.current.isPending).toBe(false);
    expect(result.current.isFetching).toBe(false);
  });
});
```

### Accessibility Testing Pattern

```typescript
// tests/components/voice-clone-form.test.tsx
import { render, screen } from '../utils/test-utils';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { VoiceCloneForm } from '@/components/voice-clone/voice-clone-form';

expect.extend(toHaveNoViolations);

describe('VoiceCloneForm accessibility', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(<VoiceCloneForm onSubmit={vi.fn()} />);

    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });

  it('associates labels with inputs', () => {
    render(<VoiceCloneForm onSubmit={vi.fn()} />);

    const nameInput = screen.getByLabelText(/name/i);
    expect(nameInput).toBeInTheDocument();
    expect(nameInput).toHaveAttribute('id');
  });

  it('shows validation errors accessibly', async () => {
    const user = userEvent.setup();
    render(<VoiceCloneForm onSubmit={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /submit/i }));

    const errorMessage = await screen.findByRole('alert');
    expect(errorMessage).toBeInTheDocument();
  });

  it('manages focus correctly on form submission', async () => {
    const user = userEvent.setup();
    render(<VoiceCloneForm onSubmit={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /submit/i }));

    // Focus should move to first error field
    const nameInput = screen.getByLabelText(/name/i);
    expect(nameInput).toHaveFocus();
  });
});
```

---

## 6. Test Organization & Naming Conventions

### Directory Structure

```
backend/
└── tests/
    ├── __init__.py
    ├── conftest.py              # Shared fixtures
    ├── factories.py             # Test data factories
    │
    ├── unit/                    # Unit tests (60%)
    │   ├── services/
    │   │   ├── test_voice_clone_service.py
    │   │   ├── test_analysis_service.py
    │   │   └── test_detection_service.py
    │   ├── utils/
    │   │   └── test_text_utils.py
    │   └── schemas/
    │       └── test_voice_clone_schemas.py
    │
    ├── integration/             # Integration tests (30%)
    │   ├── api/
    │   │   ├── test_voice_clones_api.py
    │   │   └── test_content_api.py
    │   └── db/
    │       └── test_voice_clone_repository.py
    │
    └── e2e/                     # End-to-end tests (10%)
        └── test_voice_clone_workflow.py

frontend/
└── tests/
    ├── setup.ts                 # Test setup
    ├── utils/
    │   └── test-utils.tsx       # Custom render with providers
    ├── mocks/
    │   ├── handlers.ts          # MSW handlers
    │   └── server.ts            # MSW server
    │
    ├── unit/                    # Unit tests
    │   ├── components/
    │   │   ├── voice-clone-card.test.tsx
    │   │   └── voice-clone-form.test.tsx
    │   └── hooks/
    │       └── use-voice-clone.test.tsx
    │
    └── integration/             # Integration tests
        └── pages/
            └── voice-clones-page.test.tsx
```

### File Naming Patterns

| Pattern | Example | Usage |
|---------|---------|-------|
| `test_<module>.py` | `test_voice_clone_service.py` | Python test files |
| `<component>.test.tsx` | `voice-clone-card.test.tsx` | React component tests |
| `<hook>.test.ts` | `use-voice-clone.test.ts` | React hook tests |

### Test Function Naming

Follow this pattern: `test_<unit>_<scenario>_<expected_outcome>`

```python
# GOOD: Clear, descriptive names
def test_create_voice_clone_with_valid_data_returns_clone():
    ...

def test_get_voice_clone_with_invalid_id_raises_not_found():
    ...

def test_calculate_confidence_with_no_samples_returns_zero():
    ...

# BAD: Vague, unclear names
def test_create():
    ...

def test_error():
    ...

def test_it_works():
    ...
```

### Test Class Organization

Group related tests in classes:

```python
class TestVoiceCloneServiceCreate:
    """Tests for VoiceCloneService.create() method."""

    async def test_create_with_valid_data_succeeds(self): ...
    async def test_create_with_duplicate_name_raises(self): ...
    async def test_create_without_description_uses_none(self): ...

class TestVoiceCloneServiceGetById:
    """Tests for VoiceCloneService.get_by_id() method."""

    async def test_get_existing_clone_returns_clone(self): ...
    async def test_get_nonexistent_clone_returns_none(self): ...
```

---

## 7. AI-Specific Testing Instructions

### Template Prompts for AI

#### Writing Tests (Human → AI)

```
Write tests for the [feature/function] with these requirements:

Function signature: [signature]
Location: [file path]

Test scenarios to cover:
1. [Happy path scenario]
2. [Edge case 1]
3. [Edge case 2]
4. [Error case]

Use pytest with async support. Follow Arrange-Act-Assert pattern.
Each test should have a clear docstring explaining what it tests.
```

#### Implementing to Pass Tests (Human → AI)

```
Implement the function to make these tests pass:

[paste failing tests]

Requirements:
- Do NOT modify the tests
- Implement ONLY what's needed to pass
- Add type hints
- Add a Google-style docstring
- Location: [file path]

Current test output:
[paste pytest output]
```

#### Refactoring After Green (Human → AI)

```
The tests pass. Now refactor the implementation:

Current code:
[paste code]

Refactoring goals:
- [specific improvement 1]
- [specific improvement 2]

Constraints:
- Tests must still pass
- Do NOT change public interface
- Keep the same behavior
```

### Context Management Rules

| Rule | Description |
|------|-------------|
| **Minimal context** | Include only relevant code in prompts |
| **One file at a time** | Focus AI on single file changes |
| **Show test output** | Always include pytest/vitest output |
| **Reference line numbers** | Point to specific lines when relevant |
| **State assumptions** | Tell AI what to assume exists |

### Checkpoint Guidelines

| Checkpoint | Action | Frequency |
|------------|--------|-----------|
| **After each test** | Run and verify RED | Every test written |
| **After implementation** | Run and verify GREEN | Every AI response |
| **After refactor** | Run full test suite | Every refactor cycle |
| **Before commit** | Run all tests + coverage | Every commit |
| **Before PR** | Run CI checks locally | Every PR |

---

## 8. Anti-Patterns & Common Mistakes

### Testing Anti-Patterns

| Anti-Pattern | Problem | Solution |
|--------------|---------|----------|
| **Test implementation details** | Tests break with refactoring | Test behavior and outcomes |
| **Interdependent tests** | Tests fail randomly | Each test should be isolated |
| **Testing framework code** | Wasted effort | Trust the framework |
| **No assertions** | Tests pass without verifying | Always assert expected outcome |
| **Testing private methods** | Couples tests to implementation | Test via public interface |
| **Magic numbers** | Unclear test intent | Use named constants |
| **Ignoring edge cases** | Bugs in production | Test boundaries explicitly |

### AI-Specific Anti-Patterns

| Anti-Pattern | Problem | Solution |
|--------------|---------|----------|
| **Ask AI to write test + code** | AI tests pass its own bugs | Human writes test, AI implements |
| **Too much context** | AI gets confused | Focus on one function at a time |
| **Skip RED phase** | Don't know if test works | Always verify test fails first |
| **Skip test after AI change** | Assume AI did it right | Always run tests |
| **Copy-paste without review** | Subtle bugs sneak in | Review every AI output |
| **Large implementation requests** | Poor quality code | Small, focused requests |

### Bad vs Good Test Examples

```python
# BAD: Tests implementation details
def test_voice_clone_uses_uuid4():
    clone = create_voice_clone("Test")
    assert str(clone.id).version == 4  # Who cares about UUID version?

# GOOD: Tests behavior
def test_create_voice_clone_generates_unique_id():
    clone1 = create_voice_clone("Test1")
    clone2 = create_voice_clone("Test2")
    assert clone1.id != clone2.id

# BAD: No assertion
def test_create_voice_clone():
    create_voice_clone("Test")  # Test passes but verifies nothing!

# GOOD: Clear assertion
def test_create_voice_clone_returns_clone_with_name():
    clone = create_voice_clone("Test")
    assert clone.name == "Test"

# BAD: Magic numbers
def test_confidence_calculation():
    assert calculate_confidence(samples) == 73

# GOOD: Named expectations
def test_confidence_with_minimum_samples_returns_base_score():
    BASE_CONFIDENCE = 10
    samples = create_minimal_samples()
    assert calculate_confidence(samples) == BASE_CONFIDENCE
```

---

## 9. Quick Reference

### pytest Fixtures Cheatsheet

```python
# Function scope (default) - fresh for each test
@pytest.fixture
def clean_state():
    return {"count": 0}

# Module scope - shared across test file
@pytest.fixture(scope="module")
def expensive_resource():
    return create_expensive_thing()

# Session scope - shared across all tests
@pytest.fixture(scope="session")
def database_engine():
    return create_engine()

# Autouse - automatically used by all tests
@pytest.fixture(autouse=True)
def reset_state():
    yield
    cleanup()

# Parametrized fixture
@pytest.fixture(params=["sqlite", "postgres"])
def db_type(request):
    return request.param
```

### Common Assertions

**Python (pytest)**:
```python
assert value == expected
assert value != other
assert value is None
assert value is not None
assert value in collection
assert isinstance(value, Type)

# pytest raises
with pytest.raises(ValueError) as exc_info:
    raise_error()
assert "message" in str(exc_info.value)

# pytest approx (floating point)
assert value == pytest.approx(3.14, rel=1e-3)
```

**TypeScript (Vitest)**:
```typescript
expect(value).toBe(expected)
expect(value).toEqual(expected)  // Deep equality
expect(value).toBeNull()
expect(value).toBeDefined()
expect(array).toContain(item)
expect(fn).toHaveBeenCalledWith(args)

// Async
await expect(promise).resolves.toBe(value)
await expect(promise).rejects.toThrow('error')
```

### RTL Query Priority Guide

Use queries in this order (most accessible first):

1. **getByRole** - Accessible to everyone
   ```typescript
   screen.getByRole('button', { name: /submit/i })
   ```

2. **getByLabelText** - Form fields
   ```typescript
   screen.getByLabelText(/email/i)
   ```

3. **getByPlaceholderText** - If no label
   ```typescript
   screen.getByPlaceholderText(/search/i)
   ```

4. **getByText** - Non-interactive content
   ```typescript
   screen.getByText(/welcome/i)
   ```

5. **getByTestId** - Last resort
   ```typescript
   screen.getByTestId('custom-element')
   ```

### TDD Command Workflow

```bash
# Backend
cd backend

# Run single test (RED)
uv run pytest tests/test_feature.py::test_name -v

# Run with output (debugging)
uv run pytest tests/test_feature.py -v -s

# Run with coverage
uv run pytest --cov=voice_clone --cov-report=term-missing

# Run specific markers
uv run pytest -m "not slow" -v

# Frontend
cd frontend

# Run single test (RED)
npm test -- --run tests/feature.test.tsx

# Run with coverage
npm test -- --coverage

# Run in watch mode
npm test -- --watch
```

---

*End of Document*
