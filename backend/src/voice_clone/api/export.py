"""Content export and platform preview API routes."""

from io import BytesIO
from typing import Annotated

from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from voice_clone.database import get_db
from voice_clone.exceptions import NotFoundError
from voice_clone.models import Content

router = APIRouter(tags=["export"])

# TODO: Replace with actual auth dependency
MOCK_USER_ID = "00000000-0000-0000-0000-000000000001"


def get_current_user_id() -> str:
    """Get current user ID. TODO: Replace with auth."""
    return MOCK_USER_ID


# Platform character limits
PLATFORM_LIMITS = {
    "twitter": {
        "name": "Twitter/X",
        "char_limit": 280,
        "supports_threads": True,
        "thread_limit": 25,
    },
    "linkedin": {
        "name": "LinkedIn",
        "char_limit": 3000,
        "supports_threads": False,
    },
    "facebook": {
        "name": "Facebook",
        "char_limit": 63206,
        "supports_threads": False,
    },
    "instagram": {
        "name": "Instagram",
        "char_limit": 2200,
        "supports_threads": False,
    },
    "email": {
        "name": "Email",
        "char_limit": None,
        "supports_threads": False,
    },
    "blog": {
        "name": "Blog",
        "char_limit": None,
        "supports_threads": False,
    },
    "sms": {
        "name": "SMS",
        "char_limit": 160,
        "supports_threads": False,
    },
}


class PlatformLimit(BaseModel):
    """Platform character limit info."""

    platform: str
    name: str
    char_limit: int | None
    supports_threads: bool
    thread_limit: int | None = None


class PlatformLimitsResponse(BaseModel):
    """Response with all platform limits."""

    platforms: list[PlatformLimit]


class PlatformPreview(BaseModel):
    """Platform-specific content preview."""

    platform: str
    content: str
    char_count: int
    char_limit: int | None
    is_within_limit: bool
    threads: list[str] | None = None


@router.get("/platforms/limits", response_model=PlatformLimitsResponse)
async def get_platform_limits() -> PlatformLimitsResponse:
    """Get character limits for all platforms."""
    return PlatformLimitsResponse(
        platforms=[
            PlatformLimit(
                platform=key,
                name=data["name"],
                char_limit=data["char_limit"],
                supports_threads=data["supports_threads"],
                thread_limit=data.get("thread_limit"),
            )
            for key, data in PLATFORM_LIMITS.items()
        ]
    )


@router.get("/content/{content_id}/preview/{platform}", response_model=PlatformPreview)
async def get_platform_preview(
    content_id: str,
    platform: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    user_id: Annotated[str, Depends(get_current_user_id)],
) -> PlatformPreview:
    """Get platform-specific preview of content."""
    result = await db.execute(
        select(Content).where(
            Content.id == content_id,
            Content.user_id == user_id,
        )
    )
    content = result.scalar_one_or_none()

    if not content:
        raise NotFoundError("Content", content_id)

    platform_info = PLATFORM_LIMITS.get(platform, {})
    char_limit = platform_info.get("char_limit")
    supports_threads = platform_info.get("supports_threads", False)

    content_text = content.content_text
    char_count = len(content_text)

    # Calculate if within limit
    is_within_limit = char_limit is None or char_count <= char_limit

    # Split into threads if needed for Twitter
    threads = None
    if platform == "twitter" and supports_threads and char_count > char_limit:
        threads = _split_into_threads(content_text, char_limit)

    return PlatformPreview(
        platform=platform,
        content=content_text,
        char_count=char_count,
        char_limit=char_limit,
        is_within_limit=is_within_limit,
        threads=threads,
    )


def _split_into_threads(text: str, char_limit: int) -> list[str]:
    """Split content into Twitter-style threads."""
    # Reserve space for thread numbering (e.g., "1/10 ")
    effective_limit = char_limit - 6

    words = text.split()
    threads = []
    current_thread = []
    current_length = 0

    for word in words:
        word_length = len(word) + (1 if current_thread else 0)  # +1 for space

        if current_length + word_length > effective_limit:
            if current_thread:
                threads.append(" ".join(current_thread))
            current_thread = [word]
            current_length = len(word)
        else:
            current_thread.append(word)
            current_length += word_length

    if current_thread:
        threads.append(" ".join(current_thread))

    # Add thread numbering
    total = len(threads)
    return [f"{i+1}/{total} {thread}" for i, thread in enumerate(threads)]


@router.get("/content/{content_id}/export")
async def export_content(
    content_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    user_id: Annotated[str, Depends(get_current_user_id)],
    format: Annotated[str, Query()] = "txt",
) -> StreamingResponse:
    """Export content as a file."""
    result = await db.execute(
        select(Content).where(
            Content.id == content_id,
            Content.user_id == user_id,
        )
    )
    content = result.scalar_one_or_none()

    if not content:
        raise NotFoundError("Content", content_id)

    if format == "txt":
        return _export_as_txt(content)
    elif format == "pdf":
        return _export_as_pdf(content)
    else:
        return _export_as_txt(content)


def _export_as_txt(content: Content) -> StreamingResponse:
    """Export content as plain text file."""
    text_content = f"""Voice Clone Content Export
========================

Platform: {content.platform}
Created: {content.created_at.isoformat()}
Detection Score: {content.detection_score or 'N/A'}

---

{content.content_text}

---

Original Input:
{content.input_text}
"""

    buffer = BytesIO(text_content.encode("utf-8"))
    buffer.seek(0)

    return StreamingResponse(
        buffer,
        media_type="text/plain",
        headers={
            "Content-Disposition": f'attachment; filename="content-{content.id[:8]}.txt"'
        },
    )


def _export_as_pdf(content: Content) -> StreamingResponse:
    """Export content as PDF file."""
    try:
        import fitz  # PyMuPDF

        doc = fitz.open()
        page = doc.new_page()

        # Add title
        title_rect = fitz.Rect(50, 50, 550, 80)
        page.insert_textbox(
            title_rect,
            "Voice Clone Content Export",
            fontsize=16,
            fontname="helv",
        )

        # Add metadata
        meta_rect = fitz.Rect(50, 90, 550, 150)
        meta_text = f"""Platform: {content.platform}
Created: {content.created_at.strftime('%Y-%m-%d %H:%M')}
Detection Score: {content.detection_score or 'N/A'}"""
        page.insert_textbox(
            meta_rect,
            meta_text,
            fontsize=10,
            fontname="helv",
        )

        # Add main content
        content_rect = fitz.Rect(50, 170, 550, 750)
        page.insert_textbox(
            content_rect,
            content.content_text,
            fontsize=11,
            fontname="helv",
        )

        # Save to bytes
        buffer = BytesIO()
        doc.save(buffer)
        doc.close()
        buffer.seek(0)

        return StreamingResponse(
            buffer,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="content-{content.id[:8]}.pdf"'
            },
        )

    except ImportError:
        # Fallback to text if PyMuPDF not available
        return _export_as_txt(content)
