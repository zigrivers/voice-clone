"""Voice DNA version model."""

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from voice_clone.models.base import Base, UUIDMixin

if TYPE_CHECKING:
    from voice_clone.models.voice_clone import VoiceClone


class VoiceDnaVersion(Base, UUIDMixin):
    """Model for storing Voice DNA versions."""

    __tablename__ = "voice_dna_versions"

    voice_clone_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        ForeignKey("voice_clones.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    version: Mapped[int] = mapped_column(Integer, nullable=False)
    dna_data: Mapped[dict] = mapped_column(JSONB, nullable=False)
    analysis_metadata: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    voice_clone: Mapped["VoiceClone"] = relationship("VoiceClone", back_populates="dna_versions")

    def __repr__(self) -> str:
        return f"<VoiceDnaVersion(id={self.id}, clone={self.voice_clone_id}, v={self.version})>"
