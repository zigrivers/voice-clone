"""Main API router combining all route modules."""

from fastapi import APIRouter

from voice_clone.api.health import router as health_router
from voice_clone.api.voice_clones import router as voice_clones_router
from voice_clone.api.content import router as content_router
from voice_clone.api.settings import router as settings_router
from voice_clone.api.library import router as library_router
from voice_clone.api.export import router as export_router

# Create main API router with v1 prefix
api_router = APIRouter(prefix="/api/v1")

# Include all routers
api_router.include_router(health_router)
api_router.include_router(voice_clones_router)
api_router.include_router(content_router)
api_router.include_router(settings_router)
api_router.include_router(library_router)
api_router.include_router(export_router)
