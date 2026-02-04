"""Writing sample model."""

from datetime import datetime
from enum import Enum
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy import Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from voice_clone.models.base import Base, UUIDMixin

if TYPE_CHECKING:
    from voice_clone.models.voice_clone import VoiceClone


class SourceType(str, Enum):
    """Source type for writing samples."""

    PASTE = "paste"
    FILE = "file"
    URL = "url"


class WritingSample(Base, UUIDMixin):
    """Writing sample model for voice clone training data."""

    __tablename__ = "writing_samples"

    voice_clone_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        ForeignKey("voice_clones.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    source_type: Mapped[SourceType] = mapped_column(
        SQLEnum(SourceType, name="source_type", create_constraint=True),
        nullable=False,
    )
    content: Mapped[str] = mapped_column(Text, nullable=False)
    source_url: Mapped[str | None] = mapped_column(String(2000), nullable=True)
    original_filename: Mapped[str | None] = mapped_column(String(255), nullable=True)
    word_count: Mapped[int] = mapped_column(Integer, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    voice_clone: Mapped["VoiceClone"] = relationship("VoiceClone", back_populates="samples")

    def __repr__(self) -> str:
        return f"<WritingSample(id={self.id}, source={self.source_type.value}, words={self.word_count})>"
