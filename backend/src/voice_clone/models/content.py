"""Content model for generated content."""

from enum import Enum
from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, Integer, String, Text
from sqlalchemy import Enum as SQLEnum
from sqlalchemy.dialects.postgresql import ARRAY, JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from voice_clone.models.base import Base, TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from voice_clone.models.user import User
    from voice_clone.models.voice_clone import VoiceClone


class ContentStatus(str, Enum):
    """Status of generated content."""

    DRAFT = "draft"
    READY = "ready"
    PUBLISHED = "published"
    ARCHIVED = "archived"


class Content(Base, UUIDMixin, TimestampMixin):
    """Model for storing generated content."""

    __tablename__ = "content"

    user_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    voice_clone_id: Mapped[str | None] = mapped_column(
        UUID(as_uuid=False),
        ForeignKey("voice_clones.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    platform: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    content_text: Mapped[str] = mapped_column(Text, nullable=False)
    input_text: Mapped[str] = mapped_column(Text, nullable=False)
    properties_used: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)
    detection_score: Mapped[int | None] = mapped_column(Integer, nullable=True)
    detection_breakdown: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    status: Mapped[ContentStatus] = mapped_column(
        SQLEnum(ContentStatus, name="content_status", create_constraint=True),
        default=ContentStatus.DRAFT,
        nullable=False,
    )
    tags: Mapped[list[str]] = mapped_column(ARRAY(String), default=list, nullable=False)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="content")
    voice_clone: Mapped["VoiceClone | None"] = relationship("VoiceClone", back_populates="content")

    def __repr__(self) -> str:
        return f"<Content(id={self.id}, platform={self.platform}, status={self.status.value})>"
