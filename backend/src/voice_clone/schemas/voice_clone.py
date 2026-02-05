"""Voice clone schemas."""

from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field, HttpUrl

from voice_clone.models.writing_sample import SourceType


class VoiceCloneCreate(BaseModel):
    """Schema for creating a voice clone."""

    name: str = Field(..., min_length=1, max_length=255)
    description: str | None = None
    tags: list[str] = Field(default_factory=list)


class VoiceCloneUpdate(BaseModel):
    """Schema for updating a voice clone."""

    name: str | None = Field(None, min_length=1, max_length=255)
    description: str | None = None
    tags: list[str] | None = None


class WritingSampleCreate(BaseModel):
    """Schema for creating a writing sample."""

    source_type: SourceType
    content: str | None = None  # For paste
    source_url: HttpUrl | None = None  # For URL
    # File uploads handled separately via multipart form


class WritingSampleResponse(BaseModel):
    """Schema for writing sample response."""

    id: str
    voice_clone_id: str
    source_type: SourceType
    content: str
    source_url: str | None
    original_filename: str | None
    word_count: int
    created_at: datetime

    model_config = {"from_attributes": True}


class VoiceDnaResponse(BaseModel):
    """Schema for Voice DNA response."""

    id: str
    voice_clone_id: str
    version: int
    dna_data: dict[str, Any]
    analysis_metadata: dict[str, Any] | None
    created_at: datetime

    model_config = {"from_attributes": True}


class ConfidenceScoreResponse(BaseModel):
    """Schema for confidence score response."""

    score: int = Field(..., ge=0, le=100)
    breakdown: dict[str, int]


class VoiceCloneResponse(BaseModel):
    """Schema for voice clone response."""

    id: str
    user_id: str
    name: str
    description: str | None
    tags: list[str]
    is_merged: bool
    confidence_score: int
    current_dna_id: str | None
    created_at: datetime
    updated_at: datetime | None
    sample_count: int = 0
    total_word_count: int = 0

    model_config = {"from_attributes": True}


class VoiceCloneListResponse(BaseModel):
    """Schema for paginated voice clone list response."""

    items: list[VoiceCloneResponse]
    total: int
    page: int
    per_page: int
    pages: int


class VoiceCloneDetailResponse(VoiceCloneResponse):
    """Schema for detailed voice clone response including samples and DNA."""

    samples: list[WritingSampleResponse] = Field(default_factory=list)
    current_dna: VoiceDnaResponse | None = None


class MergeSourceConfig(BaseModel):
    """Schema for merge source configuration."""

    voice_clone_id: str
    element_weights: dict[str, int] = Field(
        ...,
        description="Weights for each DNA element (0-100)",
    )


class MergeCloneRequest(BaseModel):
    """Schema for merge clone request."""

    name: str = Field(..., min_length=1, max_length=255)
    description: str | None = None
    sources: list[MergeSourceConfig] = Field(
        ...,
        min_length=2,
        max_length=5,
        description="2-5 source voice clones with element weights",
    )
