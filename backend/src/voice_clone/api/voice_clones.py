"""Voice clone API routes."""

from typing import Annotated

from fastapi import APIRouter, Depends, File, Form, Query, UploadFile, status
from pydantic import HttpUrl
from sqlalchemy.ext.asyncio import AsyncSession

from voice_clone.database import get_db
from voice_clone.exceptions import NotFoundError
from voice_clone.models import SourceType
from voice_clone.schemas.voice_clone import (
    VoiceCloneCreate,
    VoiceCloneUpdate,
    VoiceCloneResponse,
    VoiceCloneListResponse,
    VoiceCloneDetailResponse,
    WritingSampleResponse,
    VoiceDnaResponse,
    ConfidenceScoreResponse,
    MergeCloneRequest,
)
from voice_clone.services import (
    VoiceCloneService,
    WritingSampleService,
    AnalysisService,
    MergeService,
)

router = APIRouter(prefix="/voice-clones", tags=["voice-clones"])

# TODO: Replace with actual auth dependency
MOCK_USER_ID = "00000000-0000-0000-0000-000000000001"


def get_current_user_id() -> str:
    """Get current user ID. TODO: Replace with auth."""
    return MOCK_USER_ID


@router.get("", response_model=VoiceCloneListResponse)
async def list_voice_clones(
    db: Annotated[AsyncSession, Depends(get_db)],
    user_id: Annotated[str, Depends(get_current_user_id)],
    tags: Annotated[list[str] | None, Query()] = None,
    search: Annotated[str | None, Query()] = None,
    page: Annotated[int, Query(ge=1)] = 1,
    per_page: Annotated[int, Query(ge=1, le=100)] = 20,
) -> VoiceCloneListResponse:
    """List all voice clones for the current user."""
    service = VoiceCloneService(db)
    clones, total = await service.get_all(
        user_id=user_id,
        tags=tags,
        search=search,
        page=page,
        per_page=per_page,
    )

    pages = (total + per_page - 1) // per_page if total > 0 else 1

    return VoiceCloneListResponse(
        items=[service.to_response(clone) for clone in clones],
        total=total,
        page=page,
        per_page=per_page,
        pages=pages,
    )


@router.post("", response_model=VoiceCloneResponse, status_code=status.HTTP_201_CREATED)
async def create_voice_clone(
    data: VoiceCloneCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    user_id: Annotated[str, Depends(get_current_user_id)],
) -> VoiceCloneResponse:
    """Create a new voice clone."""
    service = VoiceCloneService(db)
    clone = await service.create(user_id, data)
    return service.to_response(clone)


@router.get("/{clone_id}", response_model=VoiceCloneDetailResponse)
async def get_voice_clone(
    clone_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    user_id: Annotated[str, Depends(get_current_user_id)],
) -> VoiceCloneDetailResponse:
    """Get a voice clone by ID with samples and DNA."""
    vc_service = VoiceCloneService(db)
    analysis_service = AnalysisService(db)
    sample_service = WritingSampleService(db)

    clone = await vc_service.get_by_id(clone_id, user_id)
    if not clone:
        raise NotFoundError("VoiceClone", clone_id)

    # Get samples
    samples = await sample_service.get_samples(clone_id)

    # Get current DNA
    current_dna = await analysis_service.get_current_dna(clone_id) if clone.current_dna_id else None

    response = vc_service.to_response(clone)
    return VoiceCloneDetailResponse(
        **response.model_dump(),
        samples=[sample_service.to_response(s) for s in samples],
        current_dna=VoiceDnaResponse(
            id=current_dna.id,
            voice_clone_id=current_dna.voice_clone_id,
            version=current_dna.version,
            dna_data=current_dna.dna_data,
            analysis_metadata=current_dna.analysis_metadata,
            created_at=current_dna.created_at,
        ) if current_dna else None,
    )


@router.put("/{clone_id}", response_model=VoiceCloneResponse)
async def update_voice_clone(
    clone_id: str,
    data: VoiceCloneUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    user_id: Annotated[str, Depends(get_current_user_id)],
) -> VoiceCloneResponse:
    """Update a voice clone."""
    service = VoiceCloneService(db)
    clone = await service.update(clone_id, user_id, data)
    return service.to_response(clone)


@router.delete("/{clone_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_voice_clone(
    clone_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    user_id: Annotated[str, Depends(get_current_user_id)],
) -> None:
    """Delete a voice clone."""
    service = VoiceCloneService(db)
    deleted = await service.delete(clone_id, user_id)
    if not deleted:
        raise NotFoundError("VoiceClone", clone_id)


# Sample management endpoints


@router.get("/{clone_id}/samples", response_model=list[WritingSampleResponse])
async def list_samples(
    clone_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    user_id: Annotated[str, Depends(get_current_user_id)],
) -> list[WritingSampleResponse]:
    """List all writing samples for a voice clone."""
    # Verify clone ownership
    vc_service = VoiceCloneService(db)
    clone = await vc_service.get_by_id(clone_id, user_id)
    if not clone:
        raise NotFoundError("VoiceClone", clone_id)

    service = WritingSampleService(db)
    samples = await service.get_samples(clone_id)
    return [service.to_response(s) for s in samples]


@router.post(
    "/{clone_id}/samples",
    response_model=WritingSampleResponse,
    status_code=status.HTTP_201_CREATED,
)
async def add_sample(
    clone_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    user_id: Annotated[str, Depends(get_current_user_id)],
    source_type: Annotated[SourceType, Form()],
    content: Annotated[str | None, Form()] = None,
    source_url: Annotated[str | None, Form()] = None,
    file: Annotated[UploadFile | None, File()] = None,
) -> WritingSampleResponse:
    """Add a writing sample to a voice clone."""
    # Verify clone ownership
    vc_service = VoiceCloneService(db)
    clone = await vc_service.get_by_id(clone_id, user_id)
    if not clone:
        raise NotFoundError("VoiceClone", clone_id)

    service = WritingSampleService(db)

    if source_type == SourceType.PASTE:
        if not content:
            raise NotFoundError("content", "Content is required for paste source type")
        sample = await service.add_sample_from_paste(clone_id, content)
    elif source_type == SourceType.FILE:
        if not file:
            raise NotFoundError("file", "File is required for file source type")
        sample = await service.add_sample_from_file(clone_id, file)
    elif source_type == SourceType.URL:
        if not source_url:
            raise NotFoundError("source_url", "URL is required for URL source type")
        sample = await service.add_sample_from_url(clone_id, source_url)
    else:
        raise NotFoundError("source_type", "Invalid source type")

    # Recalculate confidence score
    await vc_service.calculate_confidence_score(clone_id)

    return service.to_response(sample)


@router.delete("/{clone_id}/samples/{sample_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_sample(
    clone_id: str,
    sample_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    user_id: Annotated[str, Depends(get_current_user_id)],
) -> None:
    """Delete a writing sample."""
    # Verify clone ownership
    vc_service = VoiceCloneService(db)
    clone = await vc_service.get_by_id(clone_id, user_id)
    if not clone:
        raise NotFoundError("VoiceClone", clone_id)

    service = WritingSampleService(db)
    deleted = await service.delete_sample(sample_id, clone_id)
    if not deleted:
        raise NotFoundError("WritingSample", sample_id)

    # Recalculate confidence score
    await vc_service.calculate_confidence_score(clone_id)


# Analysis endpoints


@router.post("/{clone_id}/analyze", response_model=VoiceDnaResponse)
async def analyze_voice_clone(
    clone_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    user_id: Annotated[str, Depends(get_current_user_id)],
    provider: Annotated[str | None, Query()] = None,
) -> VoiceDnaResponse:
    """Trigger Voice DNA analysis for a voice clone."""
    service = AnalysisService(db)
    dna = await service.analyze_voice_dna(clone_id, user_id, provider)

    # Update confidence score after analysis
    vc_service = VoiceCloneService(db)
    await vc_service.calculate_confidence_score(clone_id)

    return VoiceDnaResponse(
        id=dna.id,
        voice_clone_id=dna.voice_clone_id,
        version=dna.version,
        dna_data=dna.dna_data,
        analysis_metadata=dna.analysis_metadata,
        created_at=dna.created_at,
    )


@router.get("/{clone_id}/dna", response_model=VoiceDnaResponse)
async def get_current_dna(
    clone_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    user_id: Annotated[str, Depends(get_current_user_id)],
) -> VoiceDnaResponse:
    """Get the current Voice DNA for a voice clone."""
    # Verify clone ownership
    vc_service = VoiceCloneService(db)
    clone = await vc_service.get_by_id(clone_id, user_id)
    if not clone:
        raise NotFoundError("VoiceClone", clone_id)

    service = AnalysisService(db)
    dna = await service.get_current_dna(clone_id)
    if not dna:
        raise NotFoundError("VoiceDNA", clone_id)

    return VoiceDnaResponse(
        id=dna.id,
        voice_clone_id=dna.voice_clone_id,
        version=dna.version,
        dna_data=dna.dna_data,
        analysis_metadata=dna.analysis_metadata,
        created_at=dna.created_at,
    )


@router.get("/{clone_id}/confidence", response_model=ConfidenceScoreResponse)
async def get_confidence_score(
    clone_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    user_id: Annotated[str, Depends(get_current_user_id)],
) -> ConfidenceScoreResponse:
    """Get and recalculate the confidence score for a voice clone."""
    # Verify clone ownership
    vc_service = VoiceCloneService(db)
    clone = await vc_service.get_by_id(clone_id, user_id)
    if not clone:
        raise NotFoundError("VoiceClone", clone_id)

    return await vc_service.calculate_confidence_score(clone_id)


# Merge endpoints


@router.post("/merge", response_model=VoiceCloneResponse, status_code=status.HTTP_201_CREATED)
async def merge_voice_clones(
    request: MergeCloneRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    user_id: Annotated[str, Depends(get_current_user_id)],
    provider: Annotated[str | None, Query()] = None,
) -> VoiceCloneResponse:
    """Merge multiple voice clones into a new one."""
    service = MergeService(db)
    vc_service = VoiceCloneService(db)

    merged_clone = await service.create_merged_clone(user_id, request, provider)
    return vc_service.to_response(merged_clone)
