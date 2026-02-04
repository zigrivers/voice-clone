"""Voice clone models."""

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import ARRAY, JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from voice_clone.models.base import Base, TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from voice_clone.models.user import User
    from voice_clone.models.writing_sample import WritingSample
    from voice_clone.models.voice_dna import VoiceDnaVersion
    from voice_clone.models.content import Content


class VoiceClone(Base, UUIDMixin, TimestampMixin):
    """Voice clone model for storing voice profiles."""

    __tablename__ = "voice_clones"

    user_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    tags: Mapped[list[str]] = mapped_column(ARRAY(String), default=list, nullable=False)
    is_merged: Mapped[bool] = mapped_column(Boolean, default=False)
    confidence_score: Mapped[int] = mapped_column(Integer, default=0)
    current_dna_id: Mapped[str | None] = mapped_column(UUID(as_uuid=False), nullable=True)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="voice_clones")
    samples: Mapped[list["WritingSample"]] = relationship(
        "WritingSample", back_populates="voice_clone", cascade="all, delete-orphan"
    )
    dna_versions: Mapped[list["VoiceDnaVersion"]] = relationship(
        "VoiceDnaVersion", back_populates="voice_clone", cascade="all, delete-orphan"
    )
    content: Mapped[list["Content"]] = relationship(
        "Content", back_populates="voice_clone"
    )

    # Merge relationships
    merge_sources: Mapped[list["VoiceCloneMergeSource"]] = relationship(
        "VoiceCloneMergeSource",
        foreign_keys="VoiceCloneMergeSource.merged_clone_id",
        back_populates="merged_clone",
        cascade="all, delete-orphan",
    )
    used_in_merges: Mapped[list["VoiceCloneMergeSource"]] = relationship(
        "VoiceCloneMergeSource",
        foreign_keys="VoiceCloneMergeSource.source_clone_id",
        back_populates="source_clone",
    )

    def __repr__(self) -> str:
        return f"<VoiceClone(id={self.id}, name={self.name})>"


class VoiceCloneMergeSource(Base, UUIDMixin):
    """Model for tracking merge sources and weights."""

    __tablename__ = "voice_clone_merge_sources"

    merged_clone_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), ForeignKey("voice_clones.id", ondelete="CASCADE"), nullable=False
    )
    source_clone_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), ForeignKey("voice_clones.id", ondelete="CASCADE"), nullable=False
    )
    element_weights: Mapped[dict] = mapped_column(JSONB, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    merged_clone: Mapped["VoiceClone"] = relationship(
        "VoiceClone",
        foreign_keys=[merged_clone_id],
        back_populates="merge_sources",
    )
    source_clone: Mapped["VoiceClone"] = relationship(
        "VoiceClone",
        foreign_keys=[source_clone_id],
        back_populates="used_in_merges",
    )

    def __repr__(self) -> str:
        return f"<VoiceCloneMergeSource(merged={self.merged_clone_id}, source={self.source_clone_id})>"
