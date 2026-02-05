"""Pytest configuration and fixtures."""

import asyncio
import os
from collections.abc import AsyncGenerator, Generator
from unittest.mock import AsyncMock, patch

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from voice_clone.database import get_db
from voice_clone.main import app
from voice_clone.models import Base

from .factories import (
    ApiUsageLogFactory,
    ContentFactory,
    PlatformSettingsFactory,
    SettingsFactory,
    SettingsHistoryFactory,
    UserApiKeyFactory,
    UserFactory,
    VoiceCloneFactory,
    VoiceCloneMergeSourceFactory,
    VoiceDnaVersionFactory,
    WritingSampleFactory,
)

# Test database URL - requires PostgreSQL
# For local development, run: docker-compose up db-test
TEST_DATABASE_URL = os.environ.get(
    "TEST_DATABASE_URL",
    "postgresql+asyncpg://voice_clone:localdev@localhost:5433/voice_clone_test",
)


def _is_postgres_available() -> bool:
    """Check if PostgreSQL test database is available."""
    import asyncio
    from sqlalchemy import text

    async def _check():
        try:
            engine = create_async_engine(TEST_DATABASE_URL, echo=False)
            async with engine.connect() as conn:
                await conn.execute(text("SELECT 1"))
            await engine.dispose()
            return True
        except Exception:
            return False

    return asyncio.get_event_loop_policy().new_event_loop().run_until_complete(_check())


# Check if PostgreSQL is available
POSTGRES_AVAILABLE = _is_postgres_available()

# Marker for tests requiring PostgreSQL
requires_postgres = pytest.mark.skipif(
    not POSTGRES_AVAILABLE,
    reason="PostgreSQL test database is not available. Run: docker-compose up db-test",
)

# Create test engine if PostgreSQL is available
if POSTGRES_AVAILABLE:
    test_engine = create_async_engine(TEST_DATABASE_URL, echo=False)

    test_session_maker = async_sessionmaker(
        test_engine,
        class_=AsyncSession,
        expire_on_commit=False,
        autocommit=False,
        autoflush=False,
    )
else:
    test_engine = None
    test_session_maker = None


@pytest.fixture(scope="session")
def event_loop() -> Generator[asyncio.AbstractEventLoop, None, None]:
    """Create an event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="function")
async def setup_database() -> AsyncGenerator[None, None]:
    """Set up the test database."""
    if not POSTGRES_AVAILABLE:
        pytest.skip("PostgreSQL test database is not available")

    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest.fixture
async def db_session(
    setup_database: None,
) -> AsyncGenerator[AsyncSession, None]:
    """Get a test database session."""
    async with test_session_maker() as session:
        yield session
        await session.rollback()


@pytest.fixture
async def client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """Get an async test client with database session override."""

    async def override_get_db() -> AsyncGenerator[AsyncSession, None]:
        yield db_session

    app.dependency_overrides[get_db] = override_get_db

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

    app.dependency_overrides.clear()


# Factory fixtures that create instances and persist to database


@pytest.fixture
def user_factory(db_session: AsyncSession):
    """Factory fixture for creating User instances in the database."""

    async def _create_user(**kwargs):
        user = UserFactory.build(**kwargs)
        db_session.add(user)
        await db_session.commit()
        await db_session.refresh(user)
        return user

    return _create_user


@pytest.fixture
def api_key_factory(db_session: AsyncSession):
    """Factory fixture for creating UserApiKey instances in the database."""

    async def _create_api_key(**kwargs):
        api_key = UserApiKeyFactory.build(**kwargs)
        db_session.add(api_key)
        await db_session.commit()
        await db_session.refresh(api_key)
        return api_key

    return _create_api_key


@pytest.fixture
def voice_clone_factory(db_session: AsyncSession):
    """Factory fixture for creating VoiceClone instances in the database."""

    async def _create_voice_clone(**kwargs):
        voice_clone = VoiceCloneFactory.build(**kwargs)
        db_session.add(voice_clone)
        await db_session.commit()
        await db_session.refresh(voice_clone)
        return voice_clone

    return _create_voice_clone


@pytest.fixture
def writing_sample_factory(db_session: AsyncSession):
    """Factory fixture for creating WritingSample instances in the database."""

    async def _create_writing_sample(**kwargs):
        sample = WritingSampleFactory.build(**kwargs)
        db_session.add(sample)
        await db_session.commit()
        await db_session.refresh(sample)
        return sample

    return _create_writing_sample


@pytest.fixture
def voice_dna_version_factory(db_session: AsyncSession):
    """Factory fixture for creating VoiceDnaVersion instances in the database."""

    async def _create_voice_dna_version(**kwargs):
        dna_version = VoiceDnaVersionFactory.build(**kwargs)
        db_session.add(dna_version)
        await db_session.commit()
        await db_session.refresh(dna_version)
        return dna_version

    return _create_voice_dna_version


@pytest.fixture
def content_factory(db_session: AsyncSession):
    """Factory fixture for creating Content instances in the database."""

    async def _create_content(**kwargs):
        content = ContentFactory.build(**kwargs)
        db_session.add(content)
        await db_session.commit()
        await db_session.refresh(content)
        return content

    return _create_content


@pytest.fixture
def settings_factory(db_session: AsyncSession):
    """Factory fixture for creating Settings instances in the database."""

    async def _create_settings(**kwargs):
        settings = SettingsFactory.build(**kwargs)
        db_session.add(settings)
        await db_session.commit()
        await db_session.refresh(settings)
        return settings

    return _create_settings


@pytest.fixture
def settings_history_factory(db_session: AsyncSession):
    """Factory fixture for creating SettingsHistory instances in the database."""

    async def _create_settings_history(**kwargs):
        history = SettingsHistoryFactory.build(**kwargs)
        db_session.add(history)
        await db_session.commit()
        await db_session.refresh(history)
        return history

    return _create_settings_history


@pytest.fixture
def platform_settings_factory(db_session: AsyncSession):
    """Factory fixture for creating PlatformSettings instances in the database."""

    async def _create_platform_settings(**kwargs):
        platform_settings = PlatformSettingsFactory.build(**kwargs)
        db_session.add(platform_settings)
        await db_session.commit()
        await db_session.refresh(platform_settings)
        return platform_settings

    return _create_platform_settings


@pytest.fixture
def api_usage_log_factory(db_session: AsyncSession):
    """Factory fixture for creating ApiUsageLog instances in the database."""

    async def _create_api_usage_log(**kwargs):
        log = ApiUsageLogFactory.build(**kwargs)
        db_session.add(log)
        await db_session.commit()
        await db_session.refresh(log)
        return log

    return _create_api_usage_log


@pytest.fixture
def voice_clone_merge_source_factory(db_session: AsyncSession):
    """Factory fixture for creating VoiceCloneMergeSource instances in the database."""

    async def _create_merge_source(**kwargs):
        merge_source = VoiceCloneMergeSourceFactory.build(**kwargs)
        db_session.add(merge_source)
        await db_session.commit()
        await db_session.refresh(merge_source)
        return merge_source

    return _create_merge_source


# Authenticated client fixture


@pytest.fixture
async def test_user(user_factory) -> "User":
    """Create a test user for authenticated tests."""
    return await user_factory(
        email="testuser@example.com",
        name="Test User",
        oauth_provider="google",
    )


@pytest.fixture
async def authenticated_client(
    db_session: AsyncSession,
    test_user,
) -> AsyncGenerator[AsyncClient, None]:
    """Get an authenticated async test client.

    This patches the dependency that gets the current user ID to return our test user's ID.
    """

    async def override_get_db() -> AsyncGenerator[AsyncSession, None]:
        yield db_session

    # Import the get_current_user_id from each API module that uses it
    from voice_clone.api.voice_clones import get_current_user_id as vc_get_user_id
    from voice_clone.api.settings import get_current_user_id as settings_get_user_id
    from voice_clone.api.content import get_current_user_id as content_get_user_id
    from voice_clone.api.library import get_current_user_id as library_get_user_id
    from voice_clone.api.export import get_current_user_id as export_get_user_id

    def override_get_current_user_id():
        return test_user.id

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[vc_get_user_id] = override_get_current_user_id
    app.dependency_overrides[settings_get_user_id] = override_get_current_user_id
    app.dependency_overrides[content_get_user_id] = override_get_current_user_id
    app.dependency_overrides[library_get_user_id] = override_get_current_user_id
    app.dependency_overrides[export_get_user_id] = override_get_current_user_id

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

    app.dependency_overrides.clear()


# Mock AI provider fixtures


@pytest.fixture
def mock_openai_client():
    """Mock OpenAI client for testing."""
    with patch("openai.AsyncOpenAI") as mock:
        mock_instance = AsyncMock()
        mock.return_value = mock_instance

        # Mock chat completion
        mock_completion = AsyncMock()
        mock_completion.choices = [
            AsyncMock(message=AsyncMock(content="Mocked response"))
        ]
        mock_completion.usage = AsyncMock(
            prompt_tokens=100,
            completion_tokens=50,
        )
        mock_instance.chat.completions.create = AsyncMock(
            return_value=mock_completion
        )

        yield mock_instance


@pytest.fixture
def mock_anthropic_client():
    """Mock Anthropic client for testing."""
    with patch("anthropic.AsyncAnthropic") as mock:
        mock_instance = AsyncMock()
        mock.return_value = mock_instance

        # Mock message creation
        mock_message = AsyncMock()
        mock_message.content = [AsyncMock(text="Mocked response")]
        mock_message.usage = AsyncMock(
            input_tokens=100,
            output_tokens=50,
        )
        mock_instance.messages.create = AsyncMock(return_value=mock_message)

        yield mock_instance
