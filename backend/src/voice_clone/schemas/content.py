"""Content generation and library schemas."""

from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field

from voice_clone.models.content import ContentStatus


class GenerationRequest(BaseModel):
    """Schema for content generation request."""

    voice_clone_id: str
    platform: str
    input_text: str = Field(..., min_length=1)

    # Optional properties
    length: str | None = Field(None, pattern="^(short|medium|long)$")
    tone_override: str | None = None
    target_audience: str | None = None
    cta_style: str | None = None


class GenerationResponse(BaseModel):
    """Schema for content generation response."""

    id: str
    content_text: str
    platform: str
    detection_score: int | None
    detection_breakdown: dict[str, int] | None
    properties_used: dict[str, Any]


class ContentCreate(BaseModel):
    """Schema for creating content directly."""

    voice_clone_id: str | None = None
    platform: str
    content_text: str
    input_text: str
    properties_used: dict[str, Any] = Field(default_factory=dict)
    detection_score: int | None = None
    detection_breakdown: dict[str, Any] | None = None
    tags: list[str] = Field(default_factory=list)


class ContentUpdate(BaseModel):
    """Schema for updating content."""

    content_text: str | None = None
    status: ContentStatus | None = None
    tags: list[str] | None = None


class ContentResponse(BaseModel):
    """Schema for content response."""

    id: str
    user_id: str
    voice_clone_id: str | None
    platform: str
    content_text: str
    input_text: str
    properties_used: dict[str, Any]
    detection_score: int | None
    detection_breakdown: dict[str, Any] | None
    status: ContentStatus
    tags: list[str]
    created_at: datetime
    updated_at: datetime | None

    # Include voice clone name for display
    voice_clone_name: str | None = None

    model_config = {"from_attributes": True}


class ContentListResponse(BaseModel):
    """Schema for paginated content list response."""

    items: list[ContentResponse]
    total: int
    page: int
    per_page: int
    pages: int


class ContentFilterParams(BaseModel):
    """Schema for content filter parameters."""

    voice_clone_id: str | None = None
    platform: str | None = None
    status: ContentStatus | None = None
    search: str | None = None
    sort: str = "created_at"
    sort_order: str = "desc"
    page: int = 1
    per_page: int = 20
