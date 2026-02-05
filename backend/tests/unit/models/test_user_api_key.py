"""Tests for UserApiKey model."""

import uuid

import pytest
from sqlalchemy import select

from voice_clone.models.user import UserApiKey

from tests.conftest import requires_postgres
from tests.factories import UserApiKeyFactory, UserFactory


class TestUserApiKeyModelUnit:
    """Unit tests for UserApiKey model that don't require database."""

    def test_api_key_factory_build(self):
        """Test UserApiKeyFactory builds valid instances."""
        api_key = UserApiKeyFactory.build()

        assert api_key.id is not None
        assert api_key.user_id is not None
        assert api_key.provider in ["openai", "anthropic"]
        assert api_key.encrypted_api_key is not None
        assert api_key.created_at is not None

    def test_api_key_is_valid_default_true(self):
        """Test UserApiKey is_valid defaults to True."""
        api_key = UserApiKeyFactory.build()
        assert api_key.is_valid is True

    def test_api_key_provider_openai(self):
        """Test UserApiKey with OpenAI provider."""
        api_key = UserApiKeyFactory.build(provider="openai")
        assert api_key.provider == "openai"

    def test_api_key_provider_anthropic(self):
        """Test UserApiKey with Anthropic provider."""
        api_key = UserApiKeyFactory.build(provider="anthropic")
        assert api_key.provider == "anthropic"

    def test_api_key_repr(self):
        """Test UserApiKey model __repr__ method."""
        api_key = UserApiKeyFactory.build(provider="openai")
        assert "openai" in repr(api_key)
        assert api_key.id in repr(api_key)

    def test_uuid_generation(self):
        """Test that UserApiKey id is a valid UUID."""
        api_key = UserApiKeyFactory.build()
        parsed = uuid.UUID(api_key.id)
        assert str(parsed) == api_key.id


@pytest.mark.usefixtures("db_session")
@requires_postgres
class TestUserApiKeyModelIntegration:
    """Integration tests for UserApiKey model requiring database."""

    async def test_api_key_instantiation(self, user_factory, api_key_factory):
        """Test UserApiKey model can be created."""
        user = await user_factory()
        api_key = await api_key_factory(
            user_id=user.id,
            provider="openai",
            encrypted_api_key="encrypted_sk_test_12345",
        )

        assert api_key.id is not None
        assert api_key.user_id == user.id
        assert api_key.provider == "openai"
        assert api_key.encrypted_api_key == "encrypted_sk_test_12345"
        assert api_key.created_at is not None


@pytest.mark.usefixtures("db_session")
@requires_postgres
class TestUserApiKeyRelationships:
    """Tests for UserApiKey model relationships."""

    async def test_relationship_to_user(self, db_session, user_factory, api_key_factory):
        """Test UserApiKey relationship to User (foreign key)."""
        user = await user_factory(email="apikey-user@example.com")
        api_key = await api_key_factory(user_id=user.id, provider="openai")

        await db_session.refresh(api_key)

        assert api_key.user is not None
        assert api_key.user.id == user.id
        assert api_key.user.email == "apikey-user@example.com"

    async def test_cascade_delete_with_user(self, db_session, user_factory, api_key_factory):
        """Test UserApiKey is deleted when parent User is deleted."""
        user = await user_factory()
        api_key = await api_key_factory(user_id=user.id, provider="openai")
        api_key_id = api_key.id

        await db_session.delete(user)
        await db_session.commit()

        result = await db_session.execute(
            select(UserApiKey).where(UserApiKey.id == api_key_id)
        )
        assert result.scalar_one_or_none() is None

    async def test_multiple_api_keys_per_user(self, user_factory, api_key_factory):
        """Test a user can have multiple API keys for different providers."""
        user = await user_factory()
        openai_key = await api_key_factory(user_id=user.id, provider="openai")
        anthropic_key = await api_key_factory(user_id=user.id, provider="anthropic")

        assert openai_key.user_id == anthropic_key.user_id
        assert openai_key.provider != anthropic_key.provider
