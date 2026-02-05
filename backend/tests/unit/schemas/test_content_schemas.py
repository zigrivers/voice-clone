"""Tests for Content schemas."""

from datetime import datetime

import pytest
from pydantic import ValidationError

from voice_clone.models.content import ContentStatus
from voice_clone.schemas.content import (
    ContentCreate,
    ContentFilterParams,
    ContentListResponse,
    ContentResponse,
    ContentUpdate,
    GenerationRequest,
    GenerationResponse,
)


class TestGenerationRequestSchema:
    """Tests for GenerationRequest schema validation."""

    def test_valid_generation_request(self):
        """Test GenerationRequest accepts valid data."""
        data = {
            "voice_clone_id": "clone-123",
            "platform": "linkedin",
            "input_text": "Write a post about AI.",
        }
        request = GenerationRequest(**data)

        assert request.voice_clone_id == "clone-123"
        assert request.platform == "linkedin"
        assert request.input_text == "Write a post about AI."

    def test_generation_request_with_options(self):
        """Test GenerationRequest with optional properties."""
        data = {
            "voice_clone_id": "clone-123",
            "platform": "twitter",
            "input_text": "Write a tweet.",
            "length": "short",
            "tone_override": "casual",
            "target_audience": "developers",
            "cta_style": "question",
        }
        request = GenerationRequest(**data)

        assert request.length == "short"
        assert request.tone_override == "casual"
        assert request.target_audience == "developers"
        assert request.cta_style == "question"

    def test_generation_request_input_text_required(self):
        """Test GenerationRequest requires input_text."""
        data = {
            "voice_clone_id": "clone-123",
            "platform": "linkedin",
        }
        with pytest.raises(ValidationError) as exc_info:
            GenerationRequest(**data)

        errors = exc_info.value.errors()
        assert any(e["loc"] == ("input_text",) for e in errors)

    def test_generation_request_input_text_not_empty(self):
        """Test GenerationRequest input_text must not be empty."""
        data = {
            "voice_clone_id": "clone-123",
            "platform": "linkedin",
            "input_text": "",
        }
        with pytest.raises(ValidationError) as exc_info:
            GenerationRequest(**data)

        errors = exc_info.value.errors()
        assert any(e["loc"] == ("input_text",) for e in errors)

    def test_generation_request_valid_lengths(self):
        """Test GenerationRequest length pattern."""
        for length in ["short", "medium", "long"]:
            data = {
                "voice_clone_id": "clone-123",
                "platform": "linkedin",
                "input_text": "Write content.",
                "length": length,
            }
            request = GenerationRequest(**data)
            assert request.length == length

    def test_generation_request_invalid_length(self):
        """Test GenerationRequest rejects invalid length."""
        data = {
            "voice_clone_id": "clone-123",
            "platform": "linkedin",
            "input_text": "Write content.",
            "length": "extra-long",
        }
        with pytest.raises(ValidationError) as exc_info:
            GenerationRequest(**data)

        errors = exc_info.value.errors()
        assert any(e["loc"] == ("length",) for e in errors)


class TestContentCreateSchema:
    """Tests for ContentCreate schema validation."""

    def test_valid_content_create(self):
        """Test ContentCreate accepts valid data."""
        data = {
            "platform": "linkedin",
            "content_text": "Generated content here.",
            "input_text": "Original prompt.",
        }
        content = ContentCreate(**data)

        assert content.platform == "linkedin"
        assert content.content_text == "Generated content here."
        assert content.input_text == "Original prompt."
        assert content.voice_clone_id is None
        assert content.properties_used == {}
        assert content.tags == []

    def test_content_create_with_all_fields(self):
        """Test ContentCreate with all fields."""
        data = {
            "voice_clone_id": "clone-123",
            "platform": "twitter",
            "content_text": "Tweet content.",
            "input_text": "Write a tweet.",
            "properties_used": {"tone": "casual"},
            "detection_score": 85,
            "detection_breakdown": {"perplexity": 0.8},
            "tags": ["marketing", "social"],
        }
        content = ContentCreate(**data)

        assert content.voice_clone_id == "clone-123"
        assert content.detection_score == 85
        assert content.tags == ["marketing", "social"]


class TestContentUpdateSchema:
    """Tests for ContentUpdate schema validation."""

    def test_content_update_partial(self):
        """Test ContentUpdate allows partial updates."""
        data = {"content_text": "Updated content."}
        update = ContentUpdate(**data)

        assert update.content_text == "Updated content."
        assert update.status is None
        assert update.tags is None

    def test_content_update_status(self):
        """Test ContentUpdate can update status."""
        for status in [
            ContentStatus.DRAFT,
            ContentStatus.READY,
            ContentStatus.PUBLISHED,
            ContentStatus.ARCHIVED,
        ]:
            data = {"status": status}
            update = ContentUpdate(**data)
            assert update.status == status

    def test_content_update_empty(self):
        """Test ContentUpdate can be empty."""
        update = ContentUpdate()
        assert update.content_text is None
        assert update.status is None
        assert update.tags is None

    def test_content_update_tags(self):
        """Test ContentUpdate can update tags."""
        data = {"tags": ["new-tag", "updated"]}
        update = ContentUpdate(**data)
        assert update.tags == ["new-tag", "updated"]


class TestContentResponseSchema:
    """Tests for ContentResponse schema serialization."""

    def test_content_response(self):
        """Test ContentResponse serialization."""
        data = {
            "id": "content-123",
            "user_id": "user-456",
            "voice_clone_id": "clone-789",
            "platform": "linkedin",
            "content_text": "Post content.",
            "input_text": "Write a post.",
            "properties_used": {"tone": "professional"},
            "detection_score": 90,
            "detection_breakdown": {"perplexity": 0.9},
            "status": ContentStatus.READY,
            "tags": ["marketing"],
            "created_at": datetime(2024, 1, 15, 10, 30, 0),
            "updated_at": None,
            "voice_clone_name": "Professional Voice",
        }
        response = ContentResponse(**data)

        assert response.id == "content-123"
        assert response.platform == "linkedin"
        assert response.status == ContentStatus.READY
        assert response.voice_clone_name == "Professional Voice"

    def test_content_response_from_attributes(self):
        """Test ContentResponse supports from_attributes mode."""
        assert ContentResponse.model_config.get("from_attributes") is True


class TestContentListResponseSchema:
    """Tests for ContentListResponse schema."""

    def test_content_list_response(self):
        """Test ContentListResponse structure."""
        data = {
            "items": [],
            "total": 0,
            "page": 1,
            "per_page": 20,
            "pages": 1,
        }
        response = ContentListResponse(**data)

        assert response.items == []
        assert response.total == 0
        assert response.pages == 1


class TestContentFilterParamsSchema:
    """Tests for ContentFilterParams schema."""

    def test_content_filter_params_defaults(self):
        """Test ContentFilterParams has proper defaults."""
        params = ContentFilterParams()

        assert params.voice_clone_id is None
        assert params.platform is None
        assert params.status is None
        assert params.search is None
        assert params.sort == "created_at"
        assert params.sort_order == "desc"
        assert params.page == 1
        assert params.per_page == 20

    def test_content_filter_params_with_filters(self):
        """Test ContentFilterParams with filters."""
        params = ContentFilterParams(
            voice_clone_id="clone-123",
            platform="linkedin",
            status=ContentStatus.READY,
            search="marketing",
            sort="updated_at",
            sort_order="asc",
            page=2,
            per_page=50,
        )

        assert params.voice_clone_id == "clone-123"
        assert params.platform == "linkedin"
        assert params.status == ContentStatus.READY
        assert params.search == "marketing"
        assert params.sort == "updated_at"
        assert params.sort_order == "asc"
        assert params.page == 2
        assert params.per_page == 50


class TestGenerationResponseSchema:
    """Tests for GenerationResponse schema."""

    def test_generation_response(self):
        """Test GenerationResponse structure."""
        data = {
            "id": "content-123",
            "content_text": "Generated content here.",
            "platform": "linkedin",
            "detection_score": 85,
            "detection_breakdown": {"perplexity": 85, "burstiness": 75},
            "properties_used": {"tone": "professional"},
        }
        response = GenerationResponse(**data)

        assert response.id == "content-123"
        assert response.content_text == "Generated content here."
        assert response.detection_score == 85

    def test_generation_response_nullable_fields(self):
        """Test GenerationResponse with nullable fields."""
        data = {
            "id": "content-123",
            "content_text": "Generated content.",
            "platform": "linkedin",
            "detection_score": None,
            "detection_breakdown": None,
            "properties_used": {},
        }
        response = GenerationResponse(**data)

        assert response.detection_score is None
        assert response.detection_breakdown is None
