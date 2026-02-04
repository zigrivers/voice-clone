# Voice Clone

AI-powered voice cloning and content generation application. Create authentic content that matches your unique writing style while evading AI detection.

## Features

- **Voice Cloning**: Analyze writing samples to create a "Voice DNA" profile
- **Content Generation**: Generate platform-optimized content in your voice
- **AI Detection Avoidance**: Built-in scoring to ensure human-like output
- **Multi-Platform Support**: LinkedIn, Twitter/X, Email, Blog, and more
- **Voice Merging**: Combine multiple voice profiles with custom weights

## Tech Stack

### Backend
- **Framework**: FastAPI (Python 3.11+)
- **Database**: PostgreSQL with SQLAlchemy 2.0 (async)
- **AI Providers**: OpenAI, Anthropic (Claude)
- **Package Manager**: uv

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: TanStack Query + Zustand
- **Authentication**: Auth.js (NextAuth)

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 16+
- Docker (optional, for local database)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd voice-clone
```

### 2. Set Up Environment Variables

```bash
cp .env.example .env
# Edit .env with your API keys and configuration
```

### 3. Start the Database

Using Docker:
```bash
docker compose up -d db
```

Or use your own PostgreSQL instance.

### 4. Set Up the Backend

```bash
cd backend
uv sync --extra dev
uv run alembic upgrade head
uv run uvicorn voice_clone.main:app --reload
```

The API will be available at http://localhost:8000

### 5. Set Up the Frontend

```bash
cd frontend
npm install
npm run dev
```

The app will be available at http://localhost:3000

## Development Commands

### Backend

```bash
cd backend

# Install dependencies
uv sync --extra dev

# Run development server
uv run uvicorn voice_clone.main:app --reload

# Run tests
uv run pytest

# Run tests with coverage
uv run pytest --cov=voice_clone

# Run linter
uv run ruff check .

# Run type checker
uv run mypy src/
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test

# Run linter
npm run lint

# Build for production
npm run build
```

### Database

```bash
cd backend

# Create a new migration
uv run alembic revision --autogenerate -m "description"

# Apply migrations
uv run alembic upgrade head

# Rollback one migration
uv run alembic downgrade -1
```

## Project Structure

```
voice-clone/
├── backend/                 # FastAPI backend
│   ├── src/voice_clone/    # Application code
│   │   ├── api/            # API routes
│   │   ├── models/         # SQLAlchemy models
│   │   ├── schemas/        # Pydantic schemas
│   │   ├── services/       # Business logic
│   │   └── ai/             # AI provider integrations
│   ├── alembic/            # Database migrations
│   └── tests/              # Backend tests
├── frontend/               # Next.js frontend
│   ├── src/
│   │   ├── app/            # App Router pages
│   │   ├── components/     # React components
│   │   ├── hooks/          # Custom hooks
│   │   ├── lib/            # Utilities
│   │   └── stores/         # Zustand stores
│   └── tests/              # Frontend tests
├── docs/                   # Documentation
└── docker-compose.yml      # Local development services
```

## API Documentation

When the backend is running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Contributing

See [CLAUDE.md](./CLAUDE.md) for development guidelines and git workflow.

## License

[License details here]
