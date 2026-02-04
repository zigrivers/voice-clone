"""Pydantic schemas package."""

from voice_clone.schemas.user import (
    UserResponse,
    UserCreate,
    ApiKeyCreate,
    ApiKeyResponse,
)
from voice_clone.schemas.voice_clone import (
    VoiceCloneCreate,
    VoiceCloneUpdate,
    VoiceCloneResponse,
    VoiceCloneListResponse,
    WritingSampleCreate,
    WritingSampleResponse,
    VoiceDnaResponse,
    ConfidenceScoreResponse,
    MergeSourceConfig,
    MergeCloneRequest,
)
from voice_clone.schemas.content import (
    ContentCreate,
    ContentUpdate,
    ContentResponse,
    ContentListResponse,
    GenerationRequest,
    GenerationResponse,
)
from voice_clone.schemas.settings import (
    SettingsResponse,
    SettingsUpdate,
    SettingsHistoryResponse,
    PlatformSettingsResponse,
    PlatformSettingsCreate,
    PlatformSettingsUpdate,
)

__all__ = [
    # User
    "UserResponse",
    "UserCreate",
    "ApiKeyCreate",
    "ApiKeyResponse",
    # Voice Clone
    "VoiceCloneCreate",
    "VoiceCloneUpdate",
    "VoiceCloneResponse",
    "VoiceCloneListResponse",
    "WritingSampleCreate",
    "WritingSampleResponse",
    "VoiceDnaResponse",
    "ConfidenceScoreResponse",
    "MergeSourceConfig",
    "MergeCloneRequest",
    # Content
    "ContentCreate",
    "ContentUpdate",
    "ContentResponse",
    "ContentListResponse",
    "GenerationRequest",
    "GenerationResponse",
    # Settings
    "SettingsResponse",
    "SettingsUpdate",
    "SettingsHistoryResponse",
    "PlatformSettingsResponse",
    "PlatformSettingsCreate",
    "PlatformSettingsUpdate",
]
