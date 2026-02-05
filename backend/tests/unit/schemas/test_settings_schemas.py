"""Tests for Settings schemas."""

from datetime import datetime

import pytest
from pydantic import ValidationError

from voice_clone.schemas.settings import (
    PlatformSettingsCreate,
    PlatformSettingsListResponse,
    PlatformSettingsResponse,
    PlatformSettingsUpdate,
    SettingsHistoryResponse,
    SettingsResponse,
    SettingsUpdate,
)


class TestSettingsUpdateSchema:
    """Tests for SettingsUpdate schema validation."""

    def test_settings_update_partial(self):
        """Test SettingsUpdate allows partial updates."""
        data = {"voice_cloning_instructions": "New instructions here."}
        update = SettingsUpdate(**data)

        assert update.voice_cloning_instructions == "New instructions here."
        assert update.anti_ai_guidelines is None

    def test_settings_update_both_fields(self):
        """Test SettingsUpdate with both fields."""
        data = {
            "voice_cloning_instructions": "Updated instructions.",
            "anti_ai_guidelines": "Updated guidelines.",
        }
        update = SettingsUpdate(**data)

        assert update.voice_cloning_instructions == "Updated instructions."
        assert update.anti_ai_guidelines == "Updated guidelines."

    def test_settings_update_empty(self):
        """Test SettingsUpdate can be empty."""
        update = SettingsUpdate()

        assert update.voice_cloning_instructions is None
        assert update.anti_ai_guidelines is None


class TestSettingsResponseSchema:
    """Tests for SettingsResponse schema serialization."""

    def test_settings_response(self):
        """Test SettingsResponse serialization."""
        data = {
            "id": "settings-123",
            "user_id": "user-456",
            "voice_cloning_instructions": "Voice cloning instructions.",
            "anti_ai_guidelines": "Anti-AI guidelines.",
            "created_at": datetime(2024, 1, 15, 10, 30, 0),
            "updated_at": datetime(2024, 1, 20, 14, 0, 0),
        }
        response = SettingsResponse(**data)

        assert response.id == "settings-123"
        assert response.user_id == "user-456"
        assert "Voice cloning" in response.voice_cloning_instructions
        assert "Anti-AI" in response.anti_ai_guidelines

    def test_settings_response_from_attributes(self):
        """Test SettingsResponse supports from_attributes mode."""
        assert SettingsResponse.model_config.get("from_attributes") is True


class TestSettingsHistoryResponseSchema:
    """Tests for SettingsHistoryResponse schema."""

    def test_settings_history_response(self):
        """Test SettingsHistoryResponse serialization."""
        data = {
            "id": "history-123",
            "settings_id": "settings-456",
            "setting_type": "voice_cloning_instructions",
            "content": "Previous version content.",
            "version": 3,
            "created_at": datetime(2024, 1, 15, 10, 30, 0),
        }
        response = SettingsHistoryResponse(**data)

        assert response.id == "history-123"
        assert response.setting_type == "voice_cloning_instructions"
        assert response.version == 3

    def test_settings_history_response_from_attributes(self):
        """Test SettingsHistoryResponse supports from_attributes mode."""
        assert SettingsHistoryResponse.model_config.get("from_attributes") is True


class TestPlatformSettingsCreateSchema:
    """Tests for PlatformSettingsCreate schema validation."""

    def test_valid_platform_settings_create(self):
        """Test PlatformSettingsCreate accepts valid data."""
        data = {
            "platform": "slack",
            "display_name": "Slack",
            "best_practices": "Keep messages concise and use threads.",
        }
        platform = PlatformSettingsCreate(**data)

        assert platform.platform == "slack"
        assert platform.display_name == "Slack"
        assert "concise" in platform.best_practices

    def test_platform_settings_create_required_fields(self):
        """Test PlatformSettingsCreate requires all fields."""
        with pytest.raises(ValidationError) as exc_info:
            PlatformSettingsCreate()

        errors = exc_info.value.errors()
        required = {"platform", "display_name", "best_practices"}
        error_fields = {e["loc"][0] for e in errors}
        assert required <= error_fields

    def test_platform_min_length(self):
        """Test PlatformSettingsCreate platform min_length=1."""
        with pytest.raises(ValidationError) as exc_info:
            PlatformSettingsCreate(
                platform="",
                display_name="Empty",
                best_practices="Some practices.",
            )

        errors = exc_info.value.errors()
        assert any(e["loc"] == ("platform",) for e in errors)

    def test_platform_max_length(self):
        """Test PlatformSettingsCreate platform max_length=50."""
        with pytest.raises(ValidationError) as exc_info:
            PlatformSettingsCreate(
                platform="x" * 51,
                display_name="Long Platform",
                best_practices="Some practices.",
            )

        errors = exc_info.value.errors()
        assert any(e["loc"] == ("platform",) for e in errors)

    def test_display_name_max_length(self):
        """Test PlatformSettingsCreate display_name max_length=100."""
        with pytest.raises(ValidationError) as exc_info:
            PlatformSettingsCreate(
                platform="custom",
                display_name="x" * 101,
                best_practices="Some practices.",
            )

        errors = exc_info.value.errors()
        assert any(e["loc"] == ("display_name",) for e in errors)

    def test_best_practices_min_length(self):
        """Test PlatformSettingsCreate best_practices min_length=1."""
        with pytest.raises(ValidationError) as exc_info:
            PlatformSettingsCreate(
                platform="custom",
                display_name="Custom",
                best_practices="",
            )

        errors = exc_info.value.errors()
        assert any(e["loc"] == ("best_practices",) for e in errors)


class TestPlatformSettingsUpdateSchema:
    """Tests for PlatformSettingsUpdate schema validation."""

    def test_platform_settings_update_partial(self):
        """Test PlatformSettingsUpdate allows partial updates."""
        data = {"display_name": "Updated Name"}
        update = PlatformSettingsUpdate(**data)

        assert update.display_name == "Updated Name"
        assert update.best_practices is None

    def test_platform_settings_update_empty(self):
        """Test PlatformSettingsUpdate can be empty."""
        update = PlatformSettingsUpdate()

        assert update.display_name is None
        assert update.best_practices is None

    def test_platform_settings_update_display_name_max_length(self):
        """Test PlatformSettingsUpdate display_name max_length."""
        with pytest.raises(ValidationError) as exc_info:
            PlatformSettingsUpdate(display_name="x" * 101)

        errors = exc_info.value.errors()
        assert any(e["loc"] == ("display_name",) for e in errors)


class TestPlatformSettingsResponseSchema:
    """Tests for PlatformSettingsResponse schema."""

    def test_platform_settings_response(self):
        """Test PlatformSettingsResponse serialization."""
        data = {
            "id": "platform-123",
            "user_id": "user-456",
            "platform": "linkedin",
            "display_name": "LinkedIn",
            "best_practices": "Use professional tone.",
            "is_default": True,
            "created_at": datetime(2024, 1, 15, 10, 30, 0),
            "updated_at": None,
        }
        response = PlatformSettingsResponse(**data)

        assert response.id == "platform-123"
        assert response.platform == "linkedin"
        assert response.is_default is True

    def test_platform_settings_response_from_attributes(self):
        """Test PlatformSettingsResponse supports from_attributes mode."""
        assert PlatformSettingsResponse.model_config.get("from_attributes") is True


class TestPlatformSettingsListResponseSchema:
    """Tests for PlatformSettingsListResponse schema."""

    def test_platform_settings_list_response(self):
        """Test PlatformSettingsListResponse structure."""
        platform_data = {
            "id": "platform-123",
            "user_id": "user-456",
            "platform": "linkedin",
            "display_name": "LinkedIn",
            "best_practices": "Best practices.",
            "is_default": True,
            "created_at": datetime(2024, 1, 15, 10, 30, 0),
            "updated_at": None,
        }
        data = {"items": [PlatformSettingsResponse(**platform_data)]}
        response = PlatformSettingsListResponse(**data)

        assert len(response.items) == 1
        assert response.items[0].platform == "linkedin"

    def test_platform_settings_list_response_empty(self):
        """Test PlatformSettingsListResponse with empty items."""
        data = {"items": []}
        response = PlatformSettingsListResponse(**data)

        assert response.items == []
