"""API usage logging model."""

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from voice_clone.models.base import Base, UUIDMixin

if TYPE_CHECKING:
    from voice_clone.models.user import User


class ApiUsageLog(Base, UUIDMixin):
    """Model for tracking AI API usage."""

    __tablename__ = "api_usage_logs"

    user_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    provider: Mapped[str] = mapped_column(String(50), nullable=False)  # 'openai' or 'anthropic'
    operation: Mapped[str] = mapped_column(
        String(50), nullable=False
    )  # 'analyze', 'generate', 'merge'
    model: Mapped[str] = mapped_column(String(100), nullable=False)
    input_tokens: Mapped[int] = mapped_column(Integer, nullable=False)
    output_tokens: Mapped[int] = mapped_column(Integer, nullable=False)
    voice_clone_id: Mapped[str | None] = mapped_column(UUID(as_uuid=False), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False, index=True
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="api_usage_logs")

    def __repr__(self) -> str:
        return f"<ApiUsageLog(id={self.id}, op={self.operation}, tokens={self.input_tokens + self.output_tokens})>"
