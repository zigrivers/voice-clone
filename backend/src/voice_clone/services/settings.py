"""Settings and platform settings services."""

from uuid import uuid4

from sqlalchemy import select, func, delete
from sqlalchemy.ext.asyncio import AsyncSession

from voice_clone.exceptions import NotFoundError, BadRequestError
from voice_clone.models import (
    Settings,
    SettingsHistory,
    PlatformSettings,
    Platform,
    DEFAULT_VOICE_CLONING_INSTRUCTIONS,
    DEFAULT_ANTI_AI_GUIDELINES,
    DEFAULT_PLATFORM_PRACTICES,
)
from voice_clone.schemas.settings import (
    SettingsUpdate,
    SettingsResponse,
    SettingsHistoryResponse,
    PlatformSettingsCreate,
    PlatformSettingsUpdate,
    PlatformSettingsResponse,
)


class SettingsService:
    """Service for managing user methodology settings."""

    MAX_HISTORY_VERSIONS = 10

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_settings(self, user_id: str) -> Settings:
        """Get settings for a user, creating defaults if needed."""
        result = await self.db.execute(
            select(Settings).where(Settings.user_id == user_id)
        )
        settings = result.scalar_one_or_none()

        if not settings:
            settings = await self._create_default_settings(user_id)

        return settings

    async def _create_default_settings(self, user_id: str) -> Settings:
        """Create default settings for a user."""
        settings = Settings(
            id=str(uuid4()),
            user_id=user_id,
            voice_cloning_instructions=DEFAULT_VOICE_CLONING_INSTRUCTIONS,
            anti_ai_guidelines=DEFAULT_ANTI_AI_GUIDELINES,
        )
        self.db.add(settings)
        await self.db.flush()
        return settings

    async def update_voice_cloning_instructions(
        self, user_id: str, content: str
    ) -> Settings:
        """Update voice cloning instructions and save history."""
        settings = await self.get_settings(user_id)

        # Save history before updating
        await self._save_history(
            settings.id,
            "voice_cloning_instructions",
            settings.voice_cloning_instructions,
        )

        settings.voice_cloning_instructions = content
        await self.db.flush()
        return settings

    async def update_anti_ai_guidelines(self, user_id: str, content: str) -> Settings:
        """Update anti-AI guidelines and save history."""
        settings = await self.get_settings(user_id)

        # Save history before updating
        await self._save_history(
            settings.id,
            "anti_ai_guidelines",
            settings.anti_ai_guidelines,
        )

        settings.anti_ai_guidelines = content
        await self.db.flush()
        return settings

    async def _save_history(
        self, settings_id: str, setting_type: str, content: str
    ) -> None:
        """Save a settings version to history, enforcing max limit."""
        # Get current version count
        result = await self.db.execute(
            select(func.max(SettingsHistory.version)).where(
                SettingsHistory.settings_id == settings_id,
                SettingsHistory.setting_type == setting_type,
            )
        )
        max_version = result.scalar() or 0
        new_version = max_version + 1

        # Create history entry
        history = SettingsHistory(
            id=str(uuid4()),
            settings_id=settings_id,
            setting_type=setting_type,
            content=content,
            version=new_version,
        )
        self.db.add(history)

        # Delete old versions beyond the limit
        if new_version > self.MAX_HISTORY_VERSIONS:
            delete_before = new_version - self.MAX_HISTORY_VERSIONS
            await self.db.execute(
                delete(SettingsHistory).where(
                    SettingsHistory.settings_id == settings_id,
                    SettingsHistory.setting_type == setting_type,
                    SettingsHistory.version <= delete_before,
                )
            )

        await self.db.flush()

    async def get_settings_history(
        self, user_id: str, setting_type: str
    ) -> list[SettingsHistory]:
        """Get history for a setting type."""
        settings = await self.get_settings(user_id)

        result = await self.db.execute(
            select(SettingsHistory)
            .where(
                SettingsHistory.settings_id == settings.id,
                SettingsHistory.setting_type == setting_type,
            )
            .order_by(SettingsHistory.version.desc())
        )
        return list(result.scalars().all())

    async def revert_to_version(self, user_id: str, history_id: str) -> Settings:
        """Revert a setting to a historical version."""
        settings = await self.get_settings(user_id)

        # Get the history entry
        result = await self.db.execute(
            select(SettingsHistory).where(
                SettingsHistory.id == history_id,
                SettingsHistory.settings_id == settings.id,
            )
        )
        history = result.scalar_one_or_none()

        if not history:
            raise NotFoundError("SettingsHistory", history_id)

        # Revert based on type
        if history.setting_type == "voice_cloning_instructions":
            return await self.update_voice_cloning_instructions(user_id, history.content)
        elif history.setting_type == "anti_ai_guidelines":
            return await self.update_anti_ai_guidelines(user_id, history.content)
        else:
            raise BadRequestError(f"Unknown setting type: {history.setting_type}")


class PlatformSettingsService:
    """Service for managing platform-specific settings."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all(self, user_id: str) -> list[PlatformSettings]:
        """Get all platform settings for a user, seeding defaults if needed."""
        result = await self.db.execute(
            select(PlatformSettings)
            .where(PlatformSettings.user_id == user_id)
            .order_by(PlatformSettings.is_default.desc(), PlatformSettings.display_name)
        )
        settings = list(result.scalars().all())

        if not settings:
            await self._seed_default_platforms(user_id)
            return await self.get_all(user_id)

        return settings

    async def get_by_platform(self, user_id: str, platform: str) -> PlatformSettings | None:
        """Get settings for a specific platform."""
        result = await self.db.execute(
            select(PlatformSettings).where(
                PlatformSettings.user_id == user_id,
                PlatformSettings.platform == platform,
            )
        )
        return result.scalar_one_or_none()

    async def _seed_default_platforms(self, user_id: str) -> None:
        """Seed default platform settings for a user."""
        for platform in [Platform.LINKEDIN, Platform.TWITTER, Platform.FACEBOOK,
                         Platform.INSTAGRAM, Platform.EMAIL, Platform.BLOG, Platform.SMS]:
            display_name = platform.value.title()
            best_practices = DEFAULT_PLATFORM_PRACTICES.get(
                platform,
                f"{display_name} best practices",
            )

            settings = PlatformSettings(
                id=str(uuid4()),
                user_id=user_id,
                platform=platform.value,
                display_name=display_name,
                best_practices=best_practices,
                is_default=True,
            )
            self.db.add(settings)

        await self.db.flush()

    async def update(
        self, user_id: str, platform: str, data: PlatformSettingsUpdate
    ) -> PlatformSettings:
        """Update platform settings."""
        settings = await self.get_by_platform(user_id, platform)
        if not settings:
            raise NotFoundError("PlatformSettings", platform)

        if data.display_name is not None:
            settings.display_name = data.display_name
        if data.best_practices is not None:
            settings.best_practices = data.best_practices

        await self.db.flush()
        return settings

    async def create_custom(
        self, user_id: str, data: PlatformSettingsCreate
    ) -> PlatformSettings:
        """Create a custom platform."""
        # Check if platform already exists
        existing = await self.get_by_platform(user_id, data.platform)
        if existing:
            raise BadRequestError(f"Platform '{data.platform}' already exists")

        settings = PlatformSettings(
            id=str(uuid4()),
            user_id=user_id,
            platform=data.platform,
            display_name=data.display_name,
            best_practices=data.best_practices,
            is_default=False,
        )
        self.db.add(settings)
        await self.db.flush()
        return settings

    async def delete_custom(self, user_id: str, platform_id: str) -> bool:
        """Delete a custom platform."""
        result = await self.db.execute(
            select(PlatformSettings).where(
                PlatformSettings.id == platform_id,
                PlatformSettings.user_id == user_id,
            )
        )
        settings = result.scalar_one_or_none()

        if not settings:
            return False

        if settings.is_default:
            raise BadRequestError("Cannot delete default platform settings")

        await self.db.delete(settings)
        await self.db.flush()
        return True
