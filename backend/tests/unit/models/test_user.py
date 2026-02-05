"""Tests for User model."""

import uuid

import pytest
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from voice_clone.models.user import User, UserApiKey

from tests.conftest import requires_postgres
from tests.factories import UserFactory, UserApiKeyFactory


class TestUserModelUnit:
    """Unit tests for User model that don't require database."""

    def test_user_factory_build(self):
        """Test UserFactory builds valid User instances."""
        user = UserFactory.build()

        assert user.id is not None
        assert user.email is not None
        assert "@" in user.email
        assert user.oauth_provider is not None
        assert user.oauth_id is not None

    def test_user_factory_sequence(self):
        """Test UserFactory creates unique emails."""
        user1 = UserFactory.build()
        user2 = UserFactory.build()

        assert user1.email != user2.email

    def test_user_to_dict_method(self):
        """Test User model to_dict method."""
        user = UserFactory.build(
            email="dict@example.com",
            name="Dict User",
        )
        user_dict = user.to_dict()

        assert user_dict["email"] == "dict@example.com"
        assert user_dict["name"] == "Dict User"
        assert "id" in user_dict

    def test_user_repr_contains_email(self):
        """Test User model __repr__ includes email."""
        user = UserFactory.build(email="repr@example.com")
        assert "repr@example.com" in repr(user)

    def test_user_repr_contains_id(self):
        """Test User model __repr__ includes id."""
        user = UserFactory.build()
        assert user.id in repr(user)

    def test_uuid_generation(self):
        """Test that User id is a valid UUID."""
        user = UserFactory.build()
        # Verify it's a valid UUID string
        parsed = uuid.UUID(user.id)
        assert str(parsed) == user.id


@pytest.mark.usefixtures("db_session")
@requires_postgres
class TestUserModelIntegration:
    """Integration tests for User model requiring database."""

    async def test_user_instantiation_with_required_fields(self, user_factory):
        """Test User model can be created with only required fields."""
        user = await user_factory(
            email="test@example.com",
            oauth_provider="google",
            oauth_id="google-123",
            name=None,
            avatar_url=None,
        )

        assert user.id is not None
        assert user.email == "test@example.com"
        assert user.oauth_provider == "google"
        assert user.oauth_id == "google-123"
        assert user.name is None
        assert user.avatar_url is None
        assert user.created_at is not None

    async def test_user_instantiation_with_optional_fields(self, user_factory):
        """Test User model can be created with all fields."""
        user = await user_factory(
            email="full@example.com",
            name="Full User",
            avatar_url="https://example.com/avatar.jpg",
            oauth_provider="github",
            oauth_id="github-456",
        )

        assert user.name == "Full User"
        assert user.avatar_url == "https://example.com/avatar.jpg"

    async def test_unique_email_constraint(self, db_session, user_factory):
        """Test that duplicate emails raise IntegrityError."""
        await user_factory(email="duplicate@example.com", oauth_provider="google", oauth_id="id1")

        with pytest.raises(IntegrityError):
            await user_factory(
                email="duplicate@example.com", oauth_provider="google", oauth_id="id2"
            )
        await db_session.rollback()

    async def test_timestamp_mixin_created_at(self, user_factory):
        """Test that created_at is automatically set."""
        user = await user_factory()
        assert user.created_at is not None

    async def test_timestamp_mixin_updated_at_default_none(self, user_factory):
        """Test that updated_at starts as None."""
        user = await user_factory()
        assert user.updated_at is None


@pytest.mark.usefixtures("db_session")
@requires_postgres
class TestUserRelationships:
    """Tests for User model relationships."""

    async def test_relationship_to_api_keys(self, db_session, user_factory, api_key_factory):
        """Test User relationship to api_keys."""
        user = await user_factory()
        await api_key_factory(user_id=user.id, provider="openai")
        await api_key_factory(user_id=user.id, provider="anthropic")

        await db_session.refresh(user)

        assert len(user.api_keys) == 2
        assert user.api_keys[0].user_id == user.id

    async def test_relationship_to_voice_clones(
        self, db_session, user_factory, voice_clone_factory
    ):
        """Test User relationship to voice_clones."""
        user = await user_factory()
        await voice_clone_factory(user_id=user.id, name="Clone 1")
        await voice_clone_factory(user_id=user.id, name="Clone 2")

        await db_session.refresh(user)

        assert len(user.voice_clones) == 2

    async def test_relationship_to_settings(self, db_session, user_factory, settings_factory):
        """Test User relationship to settings (one-to-one)."""
        user = await user_factory()
        settings = await settings_factory(user_id=user.id)

        await db_session.refresh(user)

        assert user.settings is not None
        assert user.settings.id == settings.id

    async def test_cascade_delete_removes_api_keys(
        self, db_session, user_factory, api_key_factory
    ):
        """Test that deleting user cascades to api_keys."""
        user = await user_factory()
        api_key = await api_key_factory(user_id=user.id, provider="openai")
        api_key_id = api_key.id

        await db_session.delete(user)
        await db_session.commit()

        # Verify api_key is deleted
        result = await db_session.execute(
            select(UserApiKey).where(UserApiKey.id == api_key_id)
        )
        assert result.scalar_one_or_none() is None
