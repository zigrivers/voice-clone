"""Health check endpoints."""

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from voice_clone.config import settings
from voice_clone.database import get_db

router = APIRouter(prefix="/health", tags=["health"])


class HealthResponse(BaseModel):
    """Basic health check response."""

    status: str


class DetailedHealthResponse(BaseModel):
    """Detailed health check response."""

    status: str
    version: str
    database: str
    database_latency_ms: float | None = None


@router.get("", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    """Basic health check endpoint."""
    return HealthResponse(status="healthy")


@router.get("/detail", response_model=DetailedHealthResponse)
async def detailed_health_check(
    db: AsyncSession = Depends(get_db),
) -> DetailedHealthResponse:
    """Detailed health check with database connectivity test."""
    import time

    db_status = "disconnected"
    latency_ms: float | None = None

    try:
        start = time.perf_counter()
        await db.execute(text("SELECT 1"))
        latency_ms = (time.perf_counter() - start) * 1000
        db_status = "connected"
    except Exception:
        db_status = "error"

    overall_status = "healthy" if db_status == "connected" else "degraded"

    return DetailedHealthResponse(
        status=overall_status,
        version=settings.app_version,
        database=db_status,
        database_latency_ms=round(latency_ms, 2) if latency_ms else None,
    )
