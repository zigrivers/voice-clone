"""Settings API routes."""

from typing import Annotated

from fastapi import APIRouter, Depends, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from voice_clone.database import get_db
from voice_clone.exceptions import NotFoundError
from voice_clone.schemas.settings import (
    SettingsResponse,
    SettingsHistoryResponse,
    PlatformSettingsResponse,
    PlatformSettingsCreate,
    PlatformSettingsUpdate,
    PlatformSettingsListResponse,
)
from voice_clone.services import SettingsService, PlatformSettingsService

router = APIRouter(prefix="/settings", tags=["settings"])

# TODO: Replace with actual auth dependency
MOCK_USER_ID = "00000000-0000-0000-0000-000000000001"


def get_current_user_id() -> str:
    """Get current user ID. TODO: Replace with auth."""
    return MOCK_USER_ID


class InstructionsUpdate(BaseModel):
    """Request body for updating instructions."""

    content: str


class GuidelinesUpdate(BaseModel):
    """Request body for updating guidelines."""

    content: str


@router.get("", response_model=SettingsResponse)
async def get_settings(
    db: Annotated[AsyncSession, Depends(get_db)],
    user_id: Annotated[str, Depends(get_current_user_id)],
) -> SettingsResponse:
    """Get all settings for the current user."""
    service = SettingsService(db)
    settings = await service.get_settings(user_id)
    return SettingsResponse(
        id=settings.id,
        user_id=settings.user_id,
        voice_cloning_instructions=settings.voice_cloning_instructions,
        anti_ai_guidelines=settings.anti_ai_guidelines,
        created_at=settings.created_at,
        updated_at=settings.updated_at,
    )


@router.put("/voice-cloning-instructions", response_model=SettingsResponse)
async def update_voice_cloning_instructions(
    data: InstructionsUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    user_id: Annotated[str, Depends(get_current_user_id)],
) -> SettingsResponse:
    """Update voice cloning instructions."""
    service = SettingsService(db)
    settings = await service.update_voice_cloning_instructions(user_id, data.content)
    return SettingsResponse(
        id=settings.id,
        user_id=settings.user_id,
        voice_cloning_instructions=settings.voice_cloning_instructions,
        anti_ai_guidelines=settings.anti_ai_guidelines,
        created_at=settings.created_at,
        updated_at=settings.updated_at,
    )


@router.put("/anti-ai-guidelines", response_model=SettingsResponse)
async def update_anti_ai_guidelines(
    data: GuidelinesUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    user_id: Annotated[str, Depends(get_current_user_id)],
) -> SettingsResponse:
    """Update anti-AI guidelines."""
    service = SettingsService(db)
    settings = await service.update_anti_ai_guidelines(user_id, data.content)
    return SettingsResponse(
        id=settings.id,
        user_id=settings.user_id,
        voice_cloning_instructions=settings.voice_cloning_instructions,
        anti_ai_guidelines=settings.anti_ai_guidelines,
        created_at=settings.created_at,
        updated_at=settings.updated_at,
    )


@router.get("/history/{setting_type}", response_model=list[SettingsHistoryResponse])
async def get_settings_history(
    setting_type: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    user_id: Annotated[str, Depends(get_current_user_id)],
) -> list[SettingsHistoryResponse]:
    """Get history for a setting type."""
    service = SettingsService(db)
    history = await service.get_settings_history(user_id, setting_type)
    return [
        SettingsHistoryResponse(
            id=h.id,
            settings_id=h.settings_id,
            setting_type=h.setting_type,
            content=h.content,
            version=h.version,
            created_at=h.created_at,
        )
        for h in history
    ]


@router.post("/revert/{history_id}", response_model=SettingsResponse)
async def revert_to_version(
    history_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    user_id: Annotated[str, Depends(get_current_user_id)],
) -> SettingsResponse:
    """Revert a setting to a historical version."""
    service = SettingsService(db)
    settings = await service.revert_to_version(user_id, history_id)
    return SettingsResponse(
        id=settings.id,
        user_id=settings.user_id,
        voice_cloning_instructions=settings.voice_cloning_instructions,
        anti_ai_guidelines=settings.anti_ai_guidelines,
        created_at=settings.created_at,
        updated_at=settings.updated_at,
    )


# Platform settings endpoints


@router.get("/platforms", response_model=PlatformSettingsListResponse)
async def list_platform_settings(
    db: Annotated[AsyncSession, Depends(get_db)],
    user_id: Annotated[str, Depends(get_current_user_id)],
) -> PlatformSettingsListResponse:
    """List all platform settings."""
    service = PlatformSettingsService(db)
    settings = await service.get_all(user_id)
    return PlatformSettingsListResponse(
        items=[
            PlatformSettingsResponse(
                id=s.id,
                user_id=s.user_id,
                platform=s.platform,
                display_name=s.display_name,
                best_practices=s.best_practices,
                is_default=s.is_default,
                created_at=s.created_at,
                updated_at=s.updated_at,
            )
            for s in settings
        ]
    )


@router.get("/platforms/{platform}", response_model=PlatformSettingsResponse)
async def get_platform_settings(
    platform: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    user_id: Annotated[str, Depends(get_current_user_id)],
) -> PlatformSettingsResponse:
    """Get settings for a specific platform."""
    service = PlatformSettingsService(db)
    settings = await service.get_by_platform(user_id, platform)
    if not settings:
        raise NotFoundError("PlatformSettings", platform)

    return PlatformSettingsResponse(
        id=settings.id,
        user_id=settings.user_id,
        platform=settings.platform,
        display_name=settings.display_name,
        best_practices=settings.best_practices,
        is_default=settings.is_default,
        created_at=settings.created_at,
        updated_at=settings.updated_at,
    )


@router.put("/platforms/{platform}", response_model=PlatformSettingsResponse)
async def update_platform_settings(
    platform: str,
    data: PlatformSettingsUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    user_id: Annotated[str, Depends(get_current_user_id)],
) -> PlatformSettingsResponse:
    """Update platform settings."""
    service = PlatformSettingsService(db)
    settings = await service.update(user_id, platform, data)
    return PlatformSettingsResponse(
        id=settings.id,
        user_id=settings.user_id,
        platform=settings.platform,
        display_name=settings.display_name,
        best_practices=settings.best_practices,
        is_default=settings.is_default,
        created_at=settings.created_at,
        updated_at=settings.updated_at,
    )


@router.post(
    "/platforms",
    response_model=PlatformSettingsResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_custom_platform(
    data: PlatformSettingsCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    user_id: Annotated[str, Depends(get_current_user_id)],
) -> PlatformSettingsResponse:
    """Create a custom platform."""
    service = PlatformSettingsService(db)
    settings = await service.create_custom(user_id, data)
    return PlatformSettingsResponse(
        id=settings.id,
        user_id=settings.user_id,
        platform=settings.platform,
        display_name=settings.display_name,
        best_practices=settings.best_practices,
        is_default=settings.is_default,
        created_at=settings.created_at,
        updated_at=settings.updated_at,
    )


@router.delete("/platforms/{platform_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_custom_platform(
    platform_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    user_id: Annotated[str, Depends(get_current_user_id)],
) -> None:
    """Delete a custom platform."""
    service = PlatformSettingsService(db)
    deleted = await service.delete_custom(user_id, platform_id)
    if not deleted:
        raise NotFoundError("PlatformSettings", platform_id)
