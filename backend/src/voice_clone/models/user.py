"""User and API key models."""

import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, DateTime, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from voice_clone.models.base import Base, TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from voice_clone.models.voice_clone import VoiceClone
    from voice_clone.models.settings import Settings, PlatformSettings
    from voice_clone.models.content import Content
    from voice_clone.models.usage import ApiUsageLog


class User(Base, UUIDMixin, TimestampMixin):
    """User model for OAuth-authenticated users."""

    __tablename__ = "users"

    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    avatar_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    oauth_provider: Mapped[str] = mapped_column(String(50), nullable=False)
    oauth_id: Mapped[str] = mapped_column(String(255), nullable=False)

    # Relationships
    api_keys: Mapped[list["UserApiKey"]] = relationship(
        "UserApiKey", back_populates="user", cascade="all, delete-orphan"
    )
    voice_clones: Mapped[list["VoiceClone"]] = relationship(
        "VoiceClone", back_populates="user", cascade="all, delete-orphan"
    )
    settings: Mapped["Settings | None"] = relationship(
        "Settings", back_populates="user", uselist=False, cascade="all, delete-orphan"
    )
    platform_settings: Mapped[list["PlatformSettings"]] = relationship(
        "PlatformSettings", back_populates="user", cascade="all, delete-orphan"
    )
    content: Mapped[list["Content"]] = relationship(
        "Content", back_populates="user", cascade="all, delete-orphan"
    )
    api_usage_logs: Mapped[list["ApiUsageLog"]] = relationship(
        "ApiUsageLog", back_populates="user", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<User(id={self.id}, email={self.email})>"


class UserApiKey(Base, UUIDMixin):
    """Model for storing encrypted user API keys for AI providers."""

    __tablename__ = "user_api_keys"

    user_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    provider: Mapped[str] = mapped_column(String(50), nullable=False)  # 'openai' or 'anthropic'
    encrypted_api_key: Mapped[str] = mapped_column(Text, nullable=False)
    is_valid: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="api_keys")

    def __repr__(self) -> str:
        return f"<UserApiKey(id={self.id}, provider={self.provider})>"
