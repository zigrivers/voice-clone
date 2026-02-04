"""Settings schemas."""

from datetime import datetime

from pydantic import BaseModel, Field


class SettingsUpdate(BaseModel):
    """Schema for updating settings."""

    voice_cloning_instructions: str | None = None
    anti_ai_guidelines: str | None = None


class SettingsHistoryResponse(BaseModel):
    """Schema for settings history response."""

    id: str
    settings_id: str
    setting_type: str
    content: str
    version: int
    created_at: datetime

    model_config = {"from_attributes": True}


class SettingsResponse(BaseModel):
    """Schema for settings response."""

    id: str
    user_id: str
    voice_cloning_instructions: str
    anti_ai_guidelines: str
    created_at: datetime
    updated_at: datetime | None

    model_config = {"from_attributes": True}


class PlatformSettingsCreate(BaseModel):
    """Schema for creating custom platform settings."""

    platform: str = Field(..., min_length=1, max_length=50)
    display_name: str = Field(..., min_length=1, max_length=100)
    best_practices: str = Field(..., min_length=1)


class PlatformSettingsUpdate(BaseModel):
    """Schema for updating platform settings."""

    display_name: str | None = Field(None, min_length=1, max_length=100)
    best_practices: str | None = Field(None, min_length=1)


class PlatformSettingsResponse(BaseModel):
    """Schema for platform settings response."""

    id: str
    user_id: str
    platform: str
    display_name: str
    best_practices: str
    is_default: bool
    created_at: datetime
    updated_at: datetime | None

    model_config = {"from_attributes": True}


class PlatformSettingsListResponse(BaseModel):
    """Schema for platform settings list response."""

    items: list[PlatformSettingsResponse]
