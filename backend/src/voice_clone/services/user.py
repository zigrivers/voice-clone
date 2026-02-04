"""User and API key services."""

from uuid import uuid4

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from voice_clone.exceptions import NotFoundError, BadRequestError
from voice_clone.models import User, UserApiKey
from voice_clone.schemas.user import UserCreate, ApiKeyCreate, ApiKeyResponse
from voice_clone.utils.encryption import encrypt_api_key, decrypt_api_key, mask_api_key


class UserService:
    """Service for user management."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, user_id: str) -> User | None:
        """Get user by ID."""
        result = await self.db.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()

    async def get_by_email(self, email: str) -> User | None:
        """Get user by email."""
        result = await self.db.execute(select(User).where(User.email == email))
        return result.scalar_one_or_none()

    async def get_by_oauth(self, oauth_provider: str, oauth_id: str) -> User | None:
        """Get user by OAuth provider and ID."""
        result = await self.db.execute(
            select(User).where(
                User.oauth_provider == oauth_provider,
                User.oauth_id == oauth_id,
            )
        )
        return result.scalar_one_or_none()

    async def create(self, data: UserCreate) -> User:
        """Create a new user."""
        user = User(
            id=str(uuid4()),
            email=data.email,
            name=data.name,
            avatar_url=data.avatar_url,
            oauth_provider=data.oauth_provider,
            oauth_id=data.oauth_id,
        )
        self.db.add(user)
        await self.db.flush()
        return user

    async def get_or_create_oauth_user(self, data: UserCreate) -> tuple[User, bool]:
        """Get existing user or create new one from OAuth data.

        Returns:
            Tuple of (user, created) where created is True if user was created.
        """
        # Try to find by OAuth provider first
        user = await self.get_by_oauth(data.oauth_provider, data.oauth_id)
        if user:
            return user, False

        # Try to find by email
        user = await self.get_by_email(data.email)
        if user:
            # Link OAuth account to existing user
            user.oauth_provider = data.oauth_provider
            user.oauth_id = data.oauth_id
            if data.name and not user.name:
                user.name = data.name
            if data.avatar_url and not user.avatar_url:
                user.avatar_url = data.avatar_url
            await self.db.flush()
            return user, False

        # Create new user
        user = await self.create(data)
        return user, True

    async def update(self, user_id: str, name: str | None = None, avatar_url: str | None = None) -> User:
        """Update user profile."""
        user = await self.get_by_id(user_id)
        if not user:
            raise NotFoundError("User", user_id)

        if name is not None:
            user.name = name
        if avatar_url is not None:
            user.avatar_url = avatar_url

        await self.db.flush()
        return user


class ApiKeyService:
    """Service for managing user API keys."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_user_keys(self, user_id: str) -> list[UserApiKey]:
        """Get all API keys for a user."""
        result = await self.db.execute(
            select(UserApiKey).where(UserApiKey.user_id == user_id)
        )
        return list(result.scalars().all())

    async def get_key_by_provider(self, user_id: str, provider: str) -> UserApiKey | None:
        """Get API key for a specific provider."""
        result = await self.db.execute(
            select(UserApiKey).where(
                UserApiKey.user_id == user_id,
                UserApiKey.provider == provider,
            )
        )
        return result.scalar_one_or_none()

    async def save_key(self, user_id: str, data: ApiKeyCreate) -> ApiKeyResponse:
        """Save or update an API key for a user."""
        # Check if key already exists for this provider
        existing = await self.get_key_by_provider(user_id, data.provider)

        encrypted = encrypt_api_key(data.api_key)

        if existing:
            # Update existing key
            existing.encrypted_api_key = encrypted
            existing.is_valid = True
            await self.db.flush()
            key = existing
        else:
            # Create new key
            key = UserApiKey(
                id=str(uuid4()),
                user_id=user_id,
                provider=data.provider,
                encrypted_api_key=encrypted,
                is_valid=True,
            )
            self.db.add(key)
            await self.db.flush()

        return ApiKeyResponse(
            id=key.id,
            provider=key.provider,
            masked_key=mask_api_key(data.api_key),
            is_valid=key.is_valid,
            created_at=key.created_at,
        )

    async def get_decrypted_key(self, user_id: str, provider: str) -> str | None:
        """Get the decrypted API key for a provider."""
        key = await self.get_key_by_provider(user_id, provider)
        if not key:
            return None
        return decrypt_api_key(key.encrypted_api_key)

    async def delete_key(self, user_id: str, key_id: str) -> bool:
        """Delete an API key."""
        result = await self.db.execute(
            select(UserApiKey).where(
                UserApiKey.id == key_id,
                UserApiKey.user_id == user_id,
            )
        )
        key = result.scalar_one_or_none()
        if not key:
            return False

        await self.db.delete(key)
        await self.db.flush()
        return True

    async def mark_key_invalid(self, user_id: str, provider: str) -> None:
        """Mark an API key as invalid (e.g., after failed validation)."""
        key = await self.get_key_by_provider(user_id, provider)
        if key:
            key.is_valid = False
            await self.db.flush()

    async def validate_key_format(self, api_key: str, provider: str) -> bool:
        """Validate API key format (basic validation)."""
        if provider == "openai":
            return api_key.startswith("sk-") and len(api_key) > 20
        elif provider == "anthropic":
            return api_key.startswith("sk-ant-") and len(api_key) > 20
        return False

    def format_key_response(self, key: UserApiKey, original_key: str | None = None) -> ApiKeyResponse:
        """Format API key for response."""
        if original_key:
            masked = mask_api_key(original_key)
        else:
            # We don't have the original key, just show provider prefix
            masked = f"{key.provider}:***"

        return ApiKeyResponse(
            id=key.id,
            provider=key.provider,
            masked_key=masked,
            is_valid=key.is_valid,
            created_at=key.created_at,
        )
