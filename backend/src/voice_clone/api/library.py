"""Content library API routes."""

from typing import Annotated

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy import select, or_, func
from sqlalchemy.ext.asyncio import AsyncSession

from voice_clone.database import get_db
from voice_clone.exceptions import NotFoundError
from voice_clone.models import Content, ContentStatus
from voice_clone.schemas.content import ContentResponse, ContentUpdate, ContentListResponse

router = APIRouter(prefix="/library", tags=["library"])

# TODO: Replace with actual auth dependency
MOCK_USER_ID = "00000000-0000-0000-0000-000000000001"


def get_current_user_id() -> str:
    """Get current user ID. TODO: Replace with auth."""
    return MOCK_USER_ID


@router.get("", response_model=ContentListResponse)
async def list_library_content(
    db: Annotated[AsyncSession, Depends(get_db)],
    user_id: Annotated[str, Depends(get_current_user_id)],
    voice_clone_id: Annotated[str | None, Query()] = None,
    platform: Annotated[str | None, Query()] = None,
    content_status: Annotated[ContentStatus | None, Query(alias="status")] = None,
    search: Annotated[str | None, Query()] = None,
    sort: Annotated[str, Query()] = "created_at",
    order: Annotated[str, Query()] = "desc",
    page: Annotated[int, Query(ge=1)] = 1,
    per_page: Annotated[int, Query(ge=1, le=100)] = 20,
) -> ContentListResponse:
    """List content library with filters."""
    # Build base query
    query = select(Content).where(Content.user_id == user_id)

    # Apply filters
    if voice_clone_id:
        query = query.where(Content.voice_clone_id == voice_clone_id)

    if platform:
        query = query.where(Content.platform == platform)

    if content_status:
        query = query.where(Content.status == content_status)

    if search:
        search_pattern = f"%{search}%"
        query = query.where(
            or_(
                Content.content_text.ilike(search_pattern),
                Content.input_text.ilike(search_pattern),
            )
        )

    # Get total count
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    # Apply sorting
    sort_column = getattr(Content, sort, Content.created_at)
    if order == "desc":
        query = query.order_by(sort_column.desc())
    else:
        query = query.order_by(sort_column.asc())

    # Apply pagination
    offset = (page - 1) * per_page
    query = query.offset(offset).limit(per_page)

    result = await db.execute(query)
    items = result.scalars().all()

    pages = (total + per_page - 1) // per_page if total > 0 else 1

    return ContentListResponse(
        items=[
            ContentResponse(
                id=item.id,
                user_id=item.user_id,
                voice_clone_id=item.voice_clone_id,
                platform=item.platform,
                content_text=item.content_text,
                input_text=item.input_text,
                properties_used=item.properties_used,
                detection_score=item.detection_score,
                detection_breakdown=item.detection_breakdown,
                status=item.status,
                tags=item.tags or [],
                created_at=item.created_at,
                updated_at=item.updated_at,
            )
            for item in items
        ],
        total=total,
        page=page,
        per_page=per_page,
        pages=pages,
    )


@router.get("/{content_id}", response_model=ContentResponse)
async def get_library_content(
    content_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    user_id: Annotated[str, Depends(get_current_user_id)],
) -> ContentResponse:
    """Get content by ID."""
    result = await db.execute(
        select(Content).where(
            Content.id == content_id,
            Content.user_id == user_id,
        )
    )
    content = result.scalar_one_or_none()

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
async def update_library_content(
    content_id: str,
    data: ContentUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    user_id: Annotated[str, Depends(get_current_user_id)],
) -> ContentResponse:
    """Update content."""
    result = await db.execute(
        select(Content).where(
            Content.id == content_id,
            Content.user_id == user_id,
        )
    )
    content = result.scalar_one_or_none()

    if not content:
        raise NotFoundError("Content", content_id)

    if data.content_text is not None:
        content.content_text = data.content_text

    if data.status is not None:
        content.status = data.status

    if data.tags is not None:
        content.tags = data.tags

    await db.flush()

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


@router.put("/{content_id}/archive", response_model=ContentResponse)
async def toggle_archive_content(
    content_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    user_id: Annotated[str, Depends(get_current_user_id)],
    archive: Annotated[bool, Query()] = True,
) -> ContentResponse:
    """Archive or unarchive content."""
    result = await db.execute(
        select(Content).where(
            Content.id == content_id,
            Content.user_id == user_id,
        )
    )
    content = result.scalar_one_or_none()

    if not content:
        raise NotFoundError("Content", content_id)

    if archive:
        content.status = ContentStatus.ARCHIVED
    else:
        content.status = ContentStatus.DRAFT

    await db.flush()

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
async def delete_library_content(
    content_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    user_id: Annotated[str, Depends(get_current_user_id)],
) -> None:
    """Delete content."""
    result = await db.execute(
        select(Content).where(
            Content.id == content_id,
            Content.user_id == user_id,
        )
    )
    content = result.scalar_one_or_none()

    if not content:
        raise NotFoundError("Content", content_id)

    await db.delete(content)
    await db.flush()
