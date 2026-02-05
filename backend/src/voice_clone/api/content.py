"""Content generation and management API routes."""

from typing import Annotated

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from voice_clone.database import get_db
from voice_clone.exceptions import NotFoundError
from voice_clone.models import ContentStatus
from voice_clone.schemas.content import (
    GenerationRequest,
    GenerationResponse,
    ContentUpdate,
    ContentResponse,
)
from voice_clone.services import GenerationService

router = APIRouter(prefix="/content", tags=["content"])

# TODO: Replace with actual auth dependency
MOCK_USER_ID = "00000000-0000-0000-0000-000000000001"


def get_current_user_id() -> str:
    """Get current user ID. TODO: Replace with auth."""
    return MOCK_USER_ID


@router.post("/generate", response_model=GenerationResponse, status_code=status.HTTP_201_CREATED)
async def generate_content(
    request: GenerationRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    user_id: Annotated[str, Depends(get_current_user_id)],
    provider: Annotated[str | None, Query()] = None,
) -> GenerationResponse:
    """Generate content using a voice clone."""
    service = GenerationService(db)
    return await service.generate_content(request, user_id, provider)


@router.post("/{content_id}/regenerate", response_model=GenerationResponse)
async def regenerate_content(
    content_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    user_id: Annotated[str, Depends(get_current_user_id)],
    feedback: Annotated[str | None, Query()] = None,
    provider: Annotated[str | None, Query()] = None,
) -> GenerationResponse:
    """Regenerate content with optional feedback."""
    service = GenerationService(db)
    return await service.regenerate_content(content_id, user_id, feedback, provider)


@router.get("/{content_id}", response_model=ContentResponse)
async def get_content(
    content_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    user_id: Annotated[str, Depends(get_current_user_id)],
) -> ContentResponse:
    """Get content by ID."""
    service = GenerationService(db)
    content = await service.get_content(content_id, user_id)
    if not content:
        raise NotFoundError("Content", content_id)

    return ContentResponse(
        id=content.id,
        user_id=content.user_id,
        voice_clone_id=content.voice_clone_id,
        platform=content.platform,
        content_text=content.content_text,
        input_text=content.input_text,
        properties_used=content.properties_used,
        detection_score=content.detection_score,
        detection_breakdown=content.detection_breakdown,
        status=content.status,
        tags=content.tags or [],
        created_at=content.created_at,
        updated_at=content.updated_at,
    )


@router.put("/{content_id}", response_model=ContentResponse)
async def update_content(
    content_id: str,
    data: ContentUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    user_id: Annotated[str, Depends(get_current_user_id)],
) -> ContentResponse:
    """Update content."""
    service = GenerationService(db)
    content = await service.update_content(
        content_id,
        user_id,
        content_text=data.content_text,
        status=data.status,
        tags=data.tags,
    )

    return ContentResponse(
        id=content.id,
        user_id=content.user_id,
        voice_clone_id=content.voice_clone_id,
        platform=content.platform,
        content_text=content.content_text,
        input_text=content.input_text,
        properties_used=content.properties_used,
        detection_score=content.detection_score,
        detection_breakdown=content.detection_breakdown,
        status=content.status,
        tags=content.tags or [],
        created_at=content.created_at,
        updated_at=content.updated_at,
    )


@router.delete("/{content_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_content(
    content_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    user_id: Annotated[str, Depends(get_current_user_id)],
) -> None:
    """Delete content."""
    service = GenerationService(db)
    deleted = await service.delete_content(content_id, user_id)
    if not deleted:
        raise NotFoundError("Content", content_id)
