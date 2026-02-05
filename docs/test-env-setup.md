# Voice Clone - Test Environment Setup Guide

**Version**: 1.0
**Created**: February 4, 2026
**Updated**: February 4, 2026
**Purpose**: Comprehensive setup instructions for the complete test environment, including Docker, PostgreSQL, and all tooling required for backend and frontend testing.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Docker Installation](#2-docker-installation)
3. [PostgreSQL Setup via Docker](#3-postgresql-setup-via-docker)
4. [Backend Environment Setup](#4-backend-environment-setup)
5. [Frontend Environment Setup](#5-frontend-environment-setup)
6. [Live Development Workflow](#6-live-development-workflow)
7. [Troubleshooting Guide](#7-troubleshooting-guide)

---

## 1. Prerequisites

### Operating System Requirements

| OS | Supported Versions | Notes |
|----|-------------------|-------|
| macOS | 12.0+ (Monterey or newer) | Intel or Apple Silicon |
| Linux | Ubuntu 20.04+, Debian 11+, Fedora 35+ | x86_64 or ARM64 |
| Windows | Windows 10/11 with WSL2 | Native Docker Desktop or WSL2 |

### Hardware Recommendations

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| RAM | 8 GB | 16 GB |
| Disk Space | 10 GB free | 20 GB free |
| CPU | 4 cores | 8 cores |

### Required Software Summary

| Software | Version | Purpose |
|----------|---------|---------|
| Docker | 24.0+ | Container runtime |
| Docker Compose | v2.20+ | Multi-container orchestration |
| Python | 3.11+ | Backend runtime |
| uv | Latest | Python package manager |
| Node.js | 18+ | Frontend runtime |
| npm | 9+ | JavaScript package manager |

### Account Requirements

No external accounts are required for local development. AI providers (OpenAI, Anthropic) are optional and only needed for testing AI features.

---

## 2. Docker Installation

### macOS Installation

1. **Download Docker Desktop**

   Visit [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop/) and download Docker Desktop for Mac.

2. **Install Docker Desktop**

   - Open the downloaded `.dmg` file
   - Drag Docker to the Applications folder
   - Launch Docker from Applications

3. **Configure Resources** (Optional)

   Open Docker Desktop → Settings → Resources:
   - Memory: 4 GB minimum (8 GB recommended)
   - CPUs: 4 minimum
   - Disk: 20 GB minimum

4. **Verify Installation**

   ```bash
   # Check Docker version
   docker --version
   # Expected: Docker version 24.x.x or higher

   # Check Docker Compose version
   docker compose version
   # Expected: Docker Compose version v2.x.x

   # Test Docker is running
   docker run hello-world
   # Expected: "Hello from Docker!" message
   ```

### Linux Installation

For Ubuntu/Debian:

```bash
# Update package index
sudo apt-get update

# Install prerequisites
sudo apt-get install ca-certificates curl gnupg

# Add Docker's official GPG key
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Add Docker repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Add user to docker group (avoids needing sudo)
sudo usermod -aG docker $USER

# Log out and back in for group changes to take effect
```

Verify installation:

```bash
docker --version
docker compose version
docker run hello-world
```

### Windows Installation (WSL2)

1. Enable WSL2 following [Microsoft's guide](https://docs.microsoft.com/en-us/windows/wsl/install)
2. Download and install Docker Desktop for Windows
3. In Docker Desktop settings, enable "Use WSL 2 based engine"
4. Verify from PowerShell or WSL terminal: `docker --version`

---

## 3. PostgreSQL Setup via Docker

### Understanding docker-compose.yml

The project uses two PostgreSQL containers for development and testing:

```yaml
# docker-compose.yml
version: "3.9"

services:
  db:                                  # Development database
    image: postgres:16-alpine
    container_name: voice-clone-db
    environment:
      POSTGRES_USER: voice_clone
      POSTGRES_PASSWORD: localdev
      POSTGRES_DB: voice_clone
    ports:
      - "5432:5432"                    # Development: localhost:5432
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U voice_clone -d voice_clone"]
      interval: 5s
      timeout: 5s
      retries: 5

  db-test:                             # Test database
    image: postgres:16-alpine
    container_name: voice-clone-db-test
    environment:
      POSTGRES_USER: voice_clone
      POSTGRES_PASSWORD: localdev
      POSTGRES_DB: voice_clone_test
    ports:
      - "5433:5432"                    # Testing: localhost:5433
    volumes:
      - pgdata-test:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U voice_clone -d voice_clone_test"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  pgdata:
  pgdata-test:
```

| Container | Purpose | Port | Database Name |
|-----------|---------|------|---------------|
| `db` | Development | 5432 | voice_clone |
| `db-test` | Testing (integration tests) | 5433 | voice_clone_test |

### Starting the Containers

```bash
# Navigate to project root
cd voice-clone

# Start all containers in detached mode
docker compose up -d

# Verify containers are running
docker compose ps
```

Expected output:

```
NAME                   STATUS                   PORTS
voice-clone-db         running (healthy)        0.0.0.0:5432->5432/tcp
voice-clone-db-test    running (healthy)        0.0.0.0:5433->5432/tcp
```

### Verifying Database Connectivity

Test connectivity to both databases:

```bash
# Development database (port 5432)
docker exec -it voice-clone-db psql -U voice_clone -d voice_clone -c "SELECT version();"

# Test database (port 5433)
docker exec -it voice-clone-db-test psql -U voice_clone -d voice_clone_test -c "SELECT version();"
```

Both commands should display PostgreSQL version 16.x.

### Managing Containers

```bash
# View logs
docker compose logs db         # Development database logs
docker compose logs db-test    # Test database logs
docker compose logs -f         # Follow all logs

# Stop containers (preserves data)
docker compose stop

# Stop and remove containers (preserves volumes)
docker compose down

# Stop and remove containers AND data (full reset)
docker compose down -v

# Restart containers
docker compose restart
```

### Resetting Test Database

For a clean slate on the test database only:

```bash
# Stop test container
docker compose stop db-test

# Remove test volume
docker volume rm voice-clone_pgdata-test

# Restart test container (creates fresh database)
docker compose up -d db-test
```

---

## 4. Backend Environment Setup

### Python Installation

#### Using pyenv (Recommended)

```bash
# Install pyenv (macOS)
brew install pyenv

# Install pyenv (Linux)
curl https://pyenv.run | bash

# Add to shell profile (.zshrc or .bashrc)
echo 'export PYENV_ROOT="$HOME/.pyenv"' >> ~/.zshrc
echo 'command -v pyenv >/dev/null || export PATH="$PYENV_ROOT/bin:$PATH"' >> ~/.zshrc
echo 'eval "$(pyenv init -)"' >> ~/.zshrc

# Reload shell
source ~/.zshrc

# Install Python 3.11
pyenv install 3.11.8
pyenv global 3.11.8

# Verify
python --version
# Expected: Python 3.11.8
```

#### Using Homebrew (macOS alternative)

```bash
brew install python@3.11
python3.11 --version
```

### uv Package Manager Installation

uv is a fast Python package manager used by this project.

```bash
# Install uv
curl -LsSf https://astral.sh/uv/install.sh | sh

# Verify installation
uv --version
# Expected: uv 0.x.x
```

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment and install dependencies
uv sync

# This creates .venv and installs all dependencies from pyproject.toml
# including development dependencies
```

### Environment Configuration

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your settings
```

Configure the `.env` file:

```bash
# Database - Development
DATABASE_URL=postgresql+asyncpg://voice_clone:localdev@localhost:5432/voice_clone

# AI Providers (optional for testing)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
DEFAULT_AI_PROVIDER=anthropic

# Security - Generate encryption key
ENCRYPTION_KEY=

# Application
DEBUG=false
CORS_ORIGINS=["http://localhost:3000"]
```

Generate the encryption key:

```bash
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

Copy the output to `ENCRYPTION_KEY` in your `.env` file.

### Running Backend Tests

The test database URL is automatically configured for tests. Tests use port 5433 (the `db-test` container).

```bash
cd backend

# Run all tests
uv run pytest tests/ -v

# Run with coverage
uv run pytest tests/ --cov=voice_clone --cov-report=term-missing

# Run only unit tests (skip integration tests requiring PostgreSQL)
uv run pytest tests/ -v -m "not requires_postgres"

# Run a single test file
uv run pytest tests/test_file.py -v

# Run a specific test
uv run pytest tests/test_file.py::TestClass::test_method -v

# Run with verbose output (shows print statements)
uv run pytest tests/ -v -s
```

### Verify Backend Setup

Run a quick verification:

```bash
cd backend

# 1. Ensure containers are running
docker compose ps

# 2. Run tests
uv run pytest tests/ -v

# 3. Start development server (optional)
uv run uvicorn voice_clone.main:app --reload
```

---

## 5. Frontend Environment Setup

### Node.js Installation

#### Using nvm (Recommended)

```bash
# Install nvm (macOS/Linux)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Reload shell
source ~/.zshrc  # or ~/.bashrc

# Install Node.js 18 LTS
nvm install 18
nvm use 18
nvm alias default 18

# Verify
node --version
# Expected: v18.x.x

npm --version
# Expected: 9.x.x or 10.x.x
```

#### Using Homebrew (macOS alternative)

```bash
brew install node@18
node --version
```

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install
```

### Running Frontend Tests

The frontend uses Jest with JSDOM for testing, along with MSW (Mock Service Worker) for API mocking.

```bash
cd frontend

# Run all tests
npm test

# Run tests in watch mode (re-runs on file changes)
npm run test:watch

# Run with coverage report
npm run test:coverage

# Run a specific test file
npm test -- tests/lib/validations.test.ts

# Run tests matching a pattern
npm test -- --testNamePattern="validation"
```

### MSW (Mock Service Worker) Notes

The project uses MSW 2.x for API mocking in tests. Key configuration details:

1. **Jest Configuration** (`jest.config.js`) includes special module mappings for MSW's ESM modules
2. **Jest Setup** (`jest.setup.js`) configures:
   - Text encoding polyfills for JSDOM
   - next/navigation mocks
   - next-auth mocks

MSW handlers are defined in `tests/mocks/handlers.ts`. The server setup is in `tests/mocks/server.ts`.

For tests requiring API mocking:

```typescript
// In your test file
import { server } from '../mocks/server';
import { http, HttpResponse } from 'msw';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Override handlers for specific tests
it('handles error response', async () => {
  server.use(
    http.get('/api/endpoint', () => {
      return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    })
  );
  // ... test code
});
```

### Verify Frontend Setup

```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Run tests
npm test

# 3. Start development server (optional)
npm run dev
```

---

## 6. Live Development Workflow

### Starting All Services

Open multiple terminal windows/tabs for full-stack development:

**Terminal 1: Docker (databases)**
```bash
cd voice-clone
docker compose up -d
docker compose logs -f  # Optional: watch logs
```

**Terminal 2: Backend**
```bash
cd voice-clone/backend
uv run uvicorn voice_clone.main:app --reload --port 8000
```

**Terminal 3: Frontend**
```bash
cd voice-clone/frontend
npm run dev
```

### Service URLs

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | Next.js development server |
| Backend API | http://localhost:8000 | FastAPI backend |
| API Docs | http://localhost:8000/docs | Swagger/OpenAPI documentation |
| Dev Database | localhost:5432 | PostgreSQL development |
| Test Database | localhost:5433 | PostgreSQL testing |

### Hot Reloading

Both frontend and backend support hot reloading:

- **Frontend**: Next.js automatically reloads when files in `src/` change
- **Backend**: uvicorn `--reload` flag watches for Python file changes

### Running Tests During Development

Keep test runners active in separate terminals:

**Terminal 4: Backend tests (watch mode)**
```bash
cd voice-clone/backend
uv run pytest tests/ -v --watch  # If pytest-watch is installed
# Or run manually after changes:
uv run pytest tests/ -v
```

**Terminal 5: Frontend tests (watch mode)**
```bash
cd voice-clone/frontend
npm run test:watch
```

### Full Stack Development Commands Summary

```bash
# Start everything from scratch
cd voice-clone
docker compose up -d                                  # Start databases
cd backend && uv run uvicorn voice_clone.main:app --reload &  # Start backend
cd frontend && npm run dev &                          # Start frontend

# Stop everything
docker compose down
# Kill background processes (Ctrl+C in terminals or pkill)
```

---

## 7. Troubleshooting Guide

### Docker Issues

#### Container Won't Start

**Symptom**: `docker compose up` hangs or exits immediately

**Solutions**:
1. Check Docker Desktop is running
2. Check for port conflicts:
   ```bash
   lsof -i :5432  # Check if port 5432 is in use
   lsof -i :5433  # Check if port 5433 is in use
   ```
3. Reset Docker:
   ```bash
   docker compose down -v
   docker system prune
   docker compose up -d
   ```

#### Permission Denied

**Symptom**: `permission denied while trying to connect to the Docker daemon`

**Solution** (Linux):
```bash
sudo usermod -aG docker $USER
newgrp docker  # Or log out and back in
```

### Database Connection Problems

#### Connection Refused

**Symptom**: `connection refused` when running tests or backend

**Solutions**:
1. Verify containers are running:
   ```bash
   docker compose ps
   # Both containers should show "running (healthy)"
   ```
2. Wait for health checks to pass:
   ```bash
   docker compose up -d
   sleep 10  # Wait for containers to be healthy
   ```
3. Check container logs:
   ```bash
   docker compose logs db
   docker compose logs db-test
   ```

#### Authentication Failed

**Symptom**: `password authentication failed for user`

**Solution**: Ensure `.env` credentials match `docker-compose.yml`:
```
User: voice_clone
Password: localdev
Database: voice_clone (dev) or voice_clone_test (test)
```

### Backend Test Failures

#### Module Not Found

**Symptom**: `ModuleNotFoundError: No module named 'voice_clone'`

**Solution**:
```bash
cd backend
uv sync  # Reinstall dependencies
```

#### Database Not Available

**Symptom**: Tests fail with database connection errors

**Solution**:
```bash
# Ensure test database is running
docker compose up -d db-test

# Verify connectivity
docker exec -it voice-clone-db-test psql -U voice_clone -d voice_clone_test -c "SELECT 1;"
```

#### pytest-asyncio Issues

**Symptom**: `ScopeMismatch` or asyncio event loop errors

**Solution**: Check `pyproject.toml` has correct asyncio mode:
```toml
[tool.pytest.ini_options]
asyncio_mode = "auto"
```

### Frontend Test Failures

#### MSW Module Errors

**Symptom**: `Cannot find module 'msw/node'` or similar

**Solutions**:
1. Ensure dependencies are installed:
   ```bash
   cd frontend
   rm -rf node_modules
   npm install
   ```
2. Check `jest.config.js` has MSW module mappings (already configured in this project)

#### TextEncoder Not Defined

**Symptom**: `ReferenceError: TextEncoder is not defined`

**Solution**: Verify `jest.setup.js` includes:
```javascript
import { TextEncoder, TextDecoder } from "util";
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
```

#### React Testing Library Issues

**Symptom**: `Unable to find an element with...`

**Solutions**:
1. Use `await waitFor()` for async operations:
   ```typescript
   await waitFor(() => {
     expect(screen.getByText('Expected')).toBeInTheDocument();
   });
   ```
2. Use `findBy` queries for elements that appear asynchronously:
   ```typescript
   const element = await screen.findByText('Expected');
   ```

### Environment Variable Issues

#### Missing Encryption Key

**Symptom**: `ENCRYPTION_KEY is required`

**Solution**:
```bash
cd backend
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
# Copy output to .env file as ENCRYPTION_KEY
```

#### Variables Not Loading

**Symptom**: Environment variables appear as `None` or undefined

**Solutions**:
1. Backend: Ensure you're in the `backend/` directory when running
2. Check `.env` file exists and is properly formatted (no spaces around `=`)
3. Restart the development server after `.env` changes

### General Tips

#### Clean Slate Reset

If all else fails, reset everything:

```bash
# Stop all containers and remove volumes
docker compose down -v

# Remove Python virtual environment
cd backend && rm -rf .venv

# Remove node_modules
cd frontend && rm -rf node_modules

# Reinstall everything
docker compose up -d
cd backend && uv sync
cd frontend && npm install
```

#### Checking Versions

Verify all tools are the correct versions:

```bash
docker --version            # Should be 24.x+
docker compose version      # Should be v2.x+
python --version            # Should be 3.11+
uv --version               # Latest
node --version             # Should be 18.x+
npm --version              # Should be 9.x+
```

---

## Verification Checklist

Use this checklist to confirm your test environment is fully set up:

- [ ] Docker is installed and running (`docker --version`)
- [ ] Docker Compose is available (`docker compose version`)
- [ ] PostgreSQL containers are running and healthy (`docker compose ps`)
- [ ] Can connect to development database (port 5432)
- [ ] Can connect to test database (port 5433)
- [ ] Python 3.11+ is installed (`python --version`)
- [ ] uv is installed (`uv --version`)
- [ ] Backend dependencies are installed (`cd backend && uv sync`)
- [ ] Backend `.env` file is configured
- [ ] Backend tests pass (`cd backend && uv run pytest tests/ -v`)
- [ ] Node.js 18+ is installed (`node --version`)
- [ ] Frontend dependencies are installed (`cd frontend && npm install`)
- [ ] Frontend tests pass (`cd frontend && npm test`)
- [ ] Development servers start without errors

---

*End of Document*
