"""Tests for Settings, SettingsHistory, and PlatformSettings models."""

import uuid

import pytest
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from voice_clone.models.settings import (
    DEFAULT_ANTI_AI_GUIDELINES,
    DEFAULT_VOICE_CLONING_INSTRUCTIONS,
    Platform,
    PlatformSettings,
    Settings,
    SettingsHistory,
)

from tests.conftest import requires_postgres
from tests.factories import (
    PlatformSettingsFactory,
    SettingsFactory,
    SettingsHistoryFactory,
)


class TestSettingsModelUnit:
    """Unit tests for Settings model that don't require database."""

    def test_settings_factory_build(self):
        """Test SettingsFactory builds valid instances."""
        settings = SettingsFactory.build()

        assert settings.id is not None
        assert settings.user_id is not None
        assert settings.voice_cloning_instructions is not None
        assert settings.anti_ai_guidelines is not None
        assert settings.created_at is not None

    def test_default_voice_cloning_instructions(self):
        """Test Settings default voice_cloning_instructions."""
        settings = SettingsFactory.build(
            voice_cloning_instructions=DEFAULT_VOICE_CLONING_INSTRUCTIONS
        )
        assert settings.voice_cloning_instructions == DEFAULT_VOICE_CLONING_INSTRUCTIONS

    def test_default_anti_ai_guidelines(self):
        """Test Settings default anti_ai_guidelines."""
        settings = SettingsFactory.build(anti_ai_guidelines=DEFAULT_ANTI_AI_GUIDELINES)
        assert settings.anti_ai_guidelines == DEFAULT_ANTI_AI_GUIDELINES

    def test_custom_instructions(self):
        """Test Settings with custom instructions."""
        custom = "Custom voice cloning instructions."
        settings = SettingsFactory.build(voice_cloning_instructions=custom)
        assert settings.voice_cloning_instructions == custom

    def test_settings_repr(self):
        """Test Settings model __repr__ method."""
        settings = SettingsFactory.build()
        assert settings.id in repr(settings)
        assert settings.user_id in repr(settings)

    def test_uuid_generation(self):
        """Test that Settings id is a valid UUID."""
        settings = SettingsFactory.build()
        parsed = uuid.UUID(settings.id)
        assert str(parsed) == settings.id


class TestSettingsHistoryModelUnit:
    """Unit tests for SettingsHistory model."""

    def test_settings_history_factory_build(self):
        """Test SettingsHistoryFactory builds valid instances."""
        history = SettingsHistoryFactory.build()

        assert history.id is not None
        assert history.settings_id is not None
        assert history.setting_type is not None
        assert history.content is not None
        assert history.version is not None
        assert history.created_at is not None

    def test_setting_type_voice_cloning(self):
        """Test SettingsHistory for voice_cloning_instructions type."""
        history = SettingsHistoryFactory.build(setting_type="voice_cloning_instructions")
        assert history.setting_type == "voice_cloning_instructions"

    def test_setting_type_anti_ai(self):
        """Test SettingsHistory for anti_ai_guidelines type."""
        history = SettingsHistoryFactory.build(setting_type="anti_ai_guidelines")
        assert history.setting_type == "anti_ai_guidelines"

    def test_history_version_numbering(self):
        """Test SettingsHistory version numbering."""
        h1 = SettingsHistoryFactory.build(version=1)
        h2 = SettingsHistoryFactory.build(version=2)
        h3 = SettingsHistoryFactory.build(version=3)

        assert h1.version == 1
        assert h2.version == 2
        assert h3.version == 3

    def test_settings_history_repr(self):
        """Test SettingsHistory model __repr__ method."""
        history = SettingsHistoryFactory.build(
            setting_type="voice_cloning_instructions",
            version=5,
        )
        assert history.id in repr(history)
        assert "voice_cloning_instructions" in repr(history)
        assert "5" in repr(history)


class TestPlatformSettingsModelUnit:
    """Unit tests for PlatformSettings model."""

    def test_platform_settings_factory_build(self):
        """Test PlatformSettingsFactory builds valid instances."""
        platform = PlatformSettingsFactory.build()

        assert platform.id is not None
        assert platform.user_id is not None
        assert platform.platform is not None
        assert platform.display_name is not None
        assert platform.best_practices is not None
        assert platform.created_at is not None

    def test_platform_enum_values(self):
        """Test Platform enum has expected values."""
        assert Platform.LINKEDIN.value == "linkedin"
        assert Platform.TWITTER.value == "twitter"
        assert Platform.FACEBOOK.value == "facebook"
        assert Platform.INSTAGRAM.value == "instagram"
        assert Platform.EMAIL.value == "email"
        assert Platform.BLOG.value == "blog"
        assert Platform.SMS.value == "sms"
        assert Platform.CUSTOM.value == "custom"

    def test_is_default_flag_true(self):
        """Test PlatformSettings is_default flag set to True."""
        platform = PlatformSettingsFactory.build(is_default=True)
        assert platform.is_default is True

    def test_is_default_flag_false(self):
        """Test PlatformSettings is_default flag set to False."""
        platform = PlatformSettingsFactory.build(is_default=False)
        assert platform.is_default is False

    def test_platform_settings_repr(self):
        """Test PlatformSettings model __repr__ method."""
        platform = PlatformSettingsFactory.build(platform=Platform.TWITTER.value)
        assert platform.id in repr(platform)
        assert "twitter" in repr(platform)

    def test_uuid_generation(self):
        """Test that PlatformSettings id is a valid UUID."""
        platform = PlatformSettingsFactory.build()
        parsed = uuid.UUID(platform.id)
        assert str(parsed) == platform.id


@pytest.mark.usefixtures("db_session")
@requires_postgres
class TestSettingsModelIntegration:
    """Integration tests for Settings model requiring database."""

    async def test_settings_instantiation(self, user_factory, settings_factory):
        """Test Settings model can be created."""
        user = await user_factory()
        settings = await settings_factory(user_id=user.id)

        assert settings.id is not None
        assert settings.user_id == user.id
        assert settings.created_at is not None

    async def test_unique_user_constraint(self, db_session, user_factory, settings_factory):
        """Test one settings per user (unique constraint)."""
        user = await user_factory()
        await settings_factory(user_id=user.id)

        with pytest.raises(IntegrityError):
            await settings_factory(user_id=user.id)
        await db_session.rollback()


@pytest.mark.usefixtures("db_session")
@requires_postgres
class TestSettingsRelationships:
    """Tests for Settings model relationships."""

    async def test_relationship_to_user(self, db_session, user_factory, settings_factory):
        """Test Settings relationship to User."""
        user = await user_factory(email="settings-user@example.com")
        settings = await settings_factory(user_id=user.id)

        await db_session.refresh(settings)

        assert settings.user is not None
        assert settings.user.email == "settings-user@example.com"

    async def test_relationship_to_history(
        self, db_session, user_factory, settings_factory, settings_history_factory
    ):
        """Test Settings relationship to history."""
        user = await user_factory()
        settings = await settings_factory(user_id=user.id)

        await settings_history_factory(settings_id=settings.id, version=1)
        await settings_history_factory(settings_id=settings.id, version=2)

        await db_session.refresh(settings)

        assert len(settings.history) == 2

    async def test_cascade_delete_with_user(self, db_session, user_factory, settings_factory):
        """Test Settings is deleted when parent User is deleted."""
        user = await user_factory()
        settings = await settings_factory(user_id=user.id)
        settings_id = settings.id

        await db_session.delete(user)
        await db_session.commit()

        result = await db_session.execute(
            select(Settings).where(Settings.id == settings_id)
        )
        assert result.scalar_one_or_none() is None


@pytest.mark.usefixtures("db_session")
@requires_postgres
class TestPlatformSettingsIntegration:
    """Integration tests for PlatformSettings model."""

    async def test_platform_settings_instantiation(
        self, user_factory, platform_settings_factory
    ):
        """Test PlatformSettings model can be created."""
        user = await user_factory()
        platform = await platform_settings_factory(
            user_id=user.id,
            platform=Platform.LINKEDIN.value,
            display_name="LinkedIn",
            best_practices="LinkedIn best practices here.",
        )

        assert platform.id is not None
        assert platform.user_id == user.id
        assert platform.platform == Platform.LINKEDIN.value
        assert platform.display_name == "LinkedIn"

    async def test_cascade_delete_with_user(
        self, db_session, user_factory, platform_settings_factory
    ):
        """Test PlatformSettings is deleted when parent User is deleted."""
        user = await user_factory()
        platform = await platform_settings_factory(user_id=user.id)
        platform_id = platform.id

        await db_session.delete(user)
        await db_session.commit()

        result = await db_session.execute(
            select(PlatformSettings).where(PlatformSettings.id == platform_id)
        )
        assert result.scalar_one_or_none() is None

    async def test_multiple_platforms_per_user(
        self, user_factory, platform_settings_factory
    ):
        """Test a user can have multiple platform settings."""
        user = await user_factory()

        linkedin = await platform_settings_factory(
            user_id=user.id, platform=Platform.LINKEDIN.value
        )
        twitter = await platform_settings_factory(
            user_id=user.id, platform=Platform.TWITTER.value
        )

        assert linkedin.user_id == twitter.user_id
        assert linkedin.platform != twitter.platform
