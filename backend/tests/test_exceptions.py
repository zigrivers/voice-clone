"""Tests for exception handling."""

import pytest
from httpx import AsyncClient

from voice_clone.exceptions import NotFoundError, ValidationError


@pytest.mark.asyncio
async def test_not_found_error_format() -> None:
    """Test NotFoundError creates correct error structure."""
    error = NotFoundError("VoiceClone", "123-456")

    assert error.status_code == 404
    assert error.code == "RESOURCE_NOT_FOUND"
    assert "VoiceClone" in error.message
    assert "123-456" in error.message
    assert error.details["resource"] == "VoiceClone"
    assert error.details["id"] == "123-456"


@pytest.mark.asyncio
async def test_validation_error_format() -> None:
    """Test ValidationError creates correct error structure."""
    error = ValidationError(
        "Invalid input",
        details={"field": "name", "reason": "too short"},
    )

    assert error.status_code == 422
    assert error.code == "VALIDATION_ERROR"
    assert error.message == "Invalid input"
    assert error.details["field"] == "name"
