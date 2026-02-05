"""Tests for ApiUsageLog model."""

import uuid

import pytest
from sqlalchemy import select

from voice_clone.models.usage import ApiUsageLog

from tests.conftest import requires_postgres
from tests.factories import ApiUsageLogFactory


class TestApiUsageLogModelUnit:
    """Unit tests for ApiUsageLog model that don't require database."""

    def test_api_usage_log_factory_build(self):
        """Test ApiUsageLogFactory builds valid instances."""
        log = ApiUsageLogFactory.build()

        assert log.id is not None
        assert log.user_id is not None
        assert log.provider is not None
        assert log.operation is not None
        assert log.model is not None
        assert log.input_tokens is not None
        assert log.output_tokens is not None
        assert log.created_at is not None

    def test_token_counts(self):
        """Test ApiUsageLog token counts."""
        log = ApiUsageLogFactory.build(input_tokens=1000, output_tokens=500)
        assert log.input_tokens == 1000
        assert log.output_tokens == 500
        assert log.input_tokens + log.output_tokens == 1500

    def test_provider_openai(self):
        """Test ApiUsageLog with OpenAI provider."""
        log = ApiUsageLogFactory.build(provider="openai")
        assert log.provider == "openai"

    def test_provider_anthropic(self):
        """Test ApiUsageLog with Anthropic provider."""
        log = ApiUsageLogFactory.build(provider="anthropic")
        assert log.provider == "anthropic"

    def test_operation_analyze(self):
        """Test ApiUsageLog with analyze operation."""
        log = ApiUsageLogFactory.build(operation="analyze")
        assert log.operation == "analyze"

    def test_operation_generate(self):
        """Test ApiUsageLog with generate operation."""
        log = ApiUsageLogFactory.build(operation="generate")
        assert log.operation == "generate"

    def test_operation_merge(self):
        """Test ApiUsageLog with merge operation."""
        log = ApiUsageLogFactory.build(operation="merge")
        assert log.operation == "merge"

    def test_model_string(self):
        """Test ApiUsageLog with model strings."""
        gpt4_log = ApiUsageLogFactory.build(model="gpt-4-turbo")
        claude_log = ApiUsageLogFactory.build(model="claude-3-opus")

        assert gpt4_log.model == "gpt-4-turbo"
        assert claude_log.model == "claude-3-opus"

    def test_voice_clone_id_optional(self):
        """Test ApiUsageLog voice_clone_id is optional."""
        log = ApiUsageLogFactory.build(voice_clone_id=None)
        assert log.voice_clone_id is None

    def test_voice_clone_id_set(self):
        """Test ApiUsageLog voice_clone_id can be set."""
        clone_id = str(uuid.uuid4())
        log = ApiUsageLogFactory.build(voice_clone_id=clone_id)
        assert log.voice_clone_id == clone_id

    def test_api_usage_log_repr(self):
        """Test ApiUsageLog model __repr__ method."""
        log = ApiUsageLogFactory.build(
            operation="generate",
            input_tokens=500,
            output_tokens=200,
        )
        assert log.id in repr(log)
        assert "generate" in repr(log)
        assert "700" in repr(log)  # Total tokens

    def test_uuid_generation(self):
        """Test that ApiUsageLog id is a valid UUID."""
        log = ApiUsageLogFactory.build()
        parsed = uuid.UUID(log.id)
        assert str(parsed) == log.id


@pytest.mark.usefixtures("db_session")
@requires_postgres
class TestApiUsageLogModelIntegration:
    """Integration tests for ApiUsageLog model requiring database."""

    async def test_api_usage_log_instantiation(self, user_factory, api_usage_log_factory):
        """Test ApiUsageLog model can be created."""
        user = await user_factory()
        log = await api_usage_log_factory(
            user_id=user.id,
            provider="openai",
            operation="generate",
            model="gpt-4",
            input_tokens=500,
            output_tokens=200,
        )

        assert log.id is not None
        assert log.user_id == user.id
        assert log.provider == "openai"
        assert log.operation == "generate"
        assert log.model == "gpt-4"
        assert log.input_tokens == 500
        assert log.output_tokens == 200
        assert log.created_at is not None


@pytest.mark.usefixtures("db_session")
@requires_postgres
class TestApiUsageLogRelationships:
    """Tests for ApiUsageLog model relationships."""

    async def test_relationship_to_user(
        self, db_session, user_factory, api_usage_log_factory
    ):
        """Test ApiUsageLog relationship to User."""
        user = await user_factory(email="usage-user@example.com")
        log = await api_usage_log_factory(user_id=user.id)

        await db_session.refresh(log)

        assert log.user is not None
        assert log.user.email == "usage-user@example.com"

    async def test_cascade_delete_with_user(
        self, db_session, user_factory, api_usage_log_factory
    ):
        """Test ApiUsageLog is deleted when parent User is deleted."""
        user = await user_factory()
        log = await api_usage_log_factory(user_id=user.id)
        log_id = log.id

        await db_session.delete(user)
        await db_session.commit()

        result = await db_session.execute(
            select(ApiUsageLog).where(ApiUsageLog.id == log_id)
        )
        assert result.scalar_one_or_none() is None

    async def test_multiple_logs_per_user(self, user_factory, api_usage_log_factory):
        """Test a user can have multiple usage logs."""
        user = await user_factory()

        log1 = await api_usage_log_factory(user_id=user.id, operation="analyze")
        log2 = await api_usage_log_factory(user_id=user.id, operation="generate")
        log3 = await api_usage_log_factory(user_id=user.id, operation="merge")

        assert log1.user_id == log2.user_id == log3.user_id
